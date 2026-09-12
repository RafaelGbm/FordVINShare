#!/usr/bin/env bash
# Smoke test the deployed backend against the contract the app expects.
# Mirrors the checklist from docs/BACKEND_RESPONSE_2026-05-24.md.
#
# Usage:
#   EMAIL=<analista/admin> PASSWORD=<senha> \
#   CLIENT_EMAIL=<cliente> CLIENT_PASSWORD=<senha> \
#     bash scripts/verify-backend.sh
#
# EMAIL must be an ANALYST or ADMIN account: most checks hit analyst-only
# endpoints. CLIENT_EMAIL is optional, but the /me/* checks need it — an
# admin has no Customer record, so those endpoints answer 403 for them.
#
# Pass credentials through the environment, never by editing this file:
# anything written here is committed and pushed with it.
#
# Exits 0 when every check passes, 1 if any failed.
# Requires: bash, curl, jq.

set -uo pipefail

BASE="${API_URL:-https://vinshare-api.azurewebsites.net/api/v1}"
EMAIL="${EMAIL:?set EMAIL=... before running}"
PASSWORD="${PASSWORD:?set PASSWORD=... before running}"
CLIENT_EMAIL="${CLIENT_EMAIL:-}"
CLIENT_PASSWORD="${CLIENT_PASSWORD:-}"

PASS=0
FAIL=0
WARN=0

# NOTE: these print *and* count, so they must be called as statements
# (`ok "msg"`), never inside $(...) — a command substitution runs in a
# subshell and the counter increments would be discarded, which used to
# make the script report 0/0/0 and always exit 0.
ok()   { PASS=$((PASS+1)); printf '\033[0;32m[ OK ]\033[0m %s\n' "$1"; }
fail() { FAIL=$((FAIL+1)); printf '\033[0;31m[FAIL]\033[0m %s\n' "$1"; }
warn() { WARN=$((WARN+1)); printf '\033[0;33m[WARN]\033[0m %s\n' "$1"; }

require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "Missing dependency: jq. Install via 'winget install jqlang.jq', 'brew install jq', or 'apt install jq'."
    exit 2
  fi
}

# Logs in and echoes the access token, or an empty string on failure.
login_token() {
  local email=$1 password=$2 body
  body=$(curl -sS -X POST "$BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")
  echo "$body" | jq -r '.data.accessToken // empty'
}

http_code() {
  local token=$1 path=$2
  curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $token" "$BASE$path"
}

probe_json() {
  local token=$1 path=$2
  curl -sS -H "Authorization: Bearer $token" "$BASE$path"
}

# ─── Checks ─────────────────────────────────────────────────────────────────

check_expires_in() {
  if [ "$EXPIRES_IN" = "900" ]; then
    ok "expiresIn=$EXPIRES_IN (expected 900)"
  else
    fail "expiresIn=$EXPIRES_IN (expected 900 — JWT_ACCESS_MIN env not flipped?)"
  fi
}

check_endpoint_200() {
  local token=$1 label=$2 path=$3
  local code; code=$(http_code "$token" "$path")
  if [ "$code" = "200" ]; then
    ok "$label  GET $path  → 200"
  else
    fail "$label  GET $path  → $code (expected 200)"
  fi
}

check_openapi() {
  local code; code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/v3/api-docs")
  if [ "$code" = "200" ]; then
    ok "OpenAPI spec GET /v3/api-docs → 200"
  else
    fail "OpenAPI spec GET /v3/api-docs → $code (expected 200)"
  fi
}

check_me_fullname() {
  local body; body=$(probe_json "$ADMIN_TOKEN" "/me")
  local name; name=$(echo "$body" | jq -r '.data.fullName // empty')
  if [ -z "$name" ] || [ "$name" = "null" ]; then
    warn "/me fullName is null for $EMAIL (back may not have populated display_name yet)"
  else
    ok "/me fullName=\"$name\""
  fi
}

check_lead_fields() {
  local body; body=$(probe_json "$ADMIN_TOKEN" "/leads?status=EM_RISCO&size=1")
  if [ "$(echo "$body" | jq -r '.success // false')" != "true" ]; then
    fail "/leads?status=EM_RISCO did not return success:true"
    return
  fi
  local lead; lead=$(echo "$body" | jq -r '.data.content[0] // empty')
  if [ -z "$lead" ]; then
    warn "/leads returned empty content; cannot verify new fields"
    return
  fi
  local missing=()
  for field in cpfMasked vehiclePlate status warrantyStatus daysSinceLastVisit customerId updatedAt; do
    if [ "$(echo "$lead" | jq -r --arg f "$field" 'has($f)')" != "true" ]; then
      missing+=("$field")
    fi
  done
  if [ ${#missing[@]} -eq 0 ]; then
    ok "/leads content[0] has all 7 new fields"
  else
    fail "/leads content[0] missing fields: ${missing[*]}"
  fi
}

check_segments_distribution_envelope() {
  local body; body=$(probe_json "$ADMIN_TOKEN" "/segments/distribution")
  local kind; kind=$(echo "$body" | jq -r '.data | if type == "array" then "array" else (keys | join(",")) end')
  if [ "$kind" = "array" ]; then
    warn "/segments/distribution still returns a flat array (service normalizer handles it)"
  elif echo "$kind" | grep -q "buckets" && echo "$kind" | grep -q "totalCustomers"; then
    ok "/segments/distribution envelope shipped (keys: $kind)"
  else
    fail "/segments/distribution unexpected shape — keys: $kind"
  fi
}

check_segments_customers_shape() {
  local body; body=$(probe_json "$ADMIN_TOKEN" "/segments/FIEL/customers?size=1")
  local first; first=$(echo "$body" | jq -r '.data.content[0] // empty')
  if [ -z "$first" ]; then
    warn "/segments/FIEL/customers returned empty content; cannot verify"
    return
  fi
  if echo "$first" | jq -e 'has("name") and has("cpfMasked") and has("estimatedLtv")' >/dev/null; then
    ok "/segments/{segment}/customers shipped real customer profile"
  else
    warn "/segments/{segment}/customers still on the ML-prediction shape (keys: $(echo "$first" | jq -r 'keys | join(",")'))"
  fi
}

check_dealership_vin_share() {
  local body; body=$(probe_json "$ADMIN_TOKEN" "/analytics/vin-share/by-dealership?period=30d")
  local first; first=$(echo "$body" | jq -r '.data[0] // empty')
  if [ -z "$first" ]; then
    warn "/analytics/vin-share/by-dealership empty; cannot verify"
    return
  fi
  if echo "$first" | jq -e 'has("trend") and has("estimatedRevenue")' >/dev/null; then
    ok "/analytics/vin-share/by-dealership has trend + estimatedRevenue"
  else
    warn "/analytics/vin-share/by-dealership missing trend/estimatedRevenue"
  fi
}

check_availability_time_format() {
  local dealership_id
  dealership_id=$(probe_json "$ADMIN_TOKEN" "/dealerships?lat=-23.55&lng=-46.63&radiusKm=50" | jq -r '.data[0].id // empty')
  if [ -z "$dealership_id" ]; then
    warn "Could not fetch a dealership ID; skipping availability check"
    return
  fi
  local date; date=$(date -d '+30 days' +%Y-%m-%d 2>/dev/null || date -v+30d +%Y-%m-%d 2>/dev/null)
  local time
  time=$(probe_json "$ADMIN_TOKEN" "/dealerships/$dealership_id/availability?serviceType=REVIEW&date=$date" | jq -r '.data.slots[0].time // empty')
  if [ -z "$time" ]; then
    warn "availability returned no slots for $date; cannot verify time format"
    return
  fi
  case "$time" in
    *:*:*) warn "AvailabilitySlot.time=\"$time\" still has seconds (@JsonFormat not applied)" ;;
    *)     ok "AvailabilitySlot.time=\"$time\" (HH:mm)" ;;
  esac
}

# ─── Run ────────────────────────────────────────────────────────────────────

require_jq

echo "→ Logging in as $EMAIL against $BASE"
ADMIN_TOKEN=$(login_token "$EMAIL" "$PASSWORD")
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Login failed for $EMAIL. Check the credentials and try again."
  exit 1
fi
EXPIRES_IN=$(curl -sS -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.data.expiresIn // empty')

CLIENT_TOKEN=""
if [ -n "$CLIENT_EMAIL" ] && [ -n "$CLIENT_PASSWORD" ]; then
  echo "→ Logging in as $CLIENT_EMAIL (client role)"
  CLIENT_TOKEN=$(login_token "$CLIENT_EMAIL" "$CLIENT_PASSWORD")
  if [ -z "$CLIENT_TOKEN" ]; then
    echo "Login failed for $CLIENT_EMAIL. Check the credentials and try again."
    exit 1
  fi
fi

echo
echo "── Auth & user profile ─────────────────────────────"
check_expires_in
check_me_fullname

echo
echo "── Client endpoints ────────────────────────────────"
if [ -n "$CLIENT_TOKEN" ]; then
  check_endpoint_200 "$CLIENT_TOKEN" "Vehicles      " "/me/vehicles"
  check_endpoint_200 "$CLIENT_TOKEN" "Home timeline " "/me/services"
  check_endpoint_200 "$CLIENT_TOKEN" "Appointments  " "/me/appointments"
  check_endpoint_200 "$CLIENT_TOKEN" "Loyalty       " "/me/loyalty/balance"
  check_endpoint_200 "$CLIENT_TOKEN" "Pending NPS   " "/me/surveys/pending"
else
  warn "CLIENT_EMAIL/CLIENT_PASSWORD not set — skipping /me/* checks (an admin gets 403 there)"
fi

echo
echo "── Analyst endpoints ───────────────────────────────"
check_endpoint_200 "$ADMIN_TOKEN" "VIN Share line" "/analytics/vin-share/series?groupBy=month"
check_endpoint_200 "$ADMIN_TOKEN" "NPS summary   " "/analytics/nps"
check_openapi

echo
echo "── Shape upgrades ──────────────────────────────────"
check_lead_fields
check_segments_distribution_envelope
check_segments_customers_shape
check_dealership_vin_share
check_availability_time_format

echo
echo "── Summary ─────────────────────────────────────────"
echo "PASS=$PASS  WARN=$WARN  FAIL=$FAIL"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
