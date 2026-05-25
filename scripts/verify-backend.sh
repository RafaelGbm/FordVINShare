#!/usr/bin/env bash
# Validate that the back's promised fixes for 2026-05-28 deploy actually shipped.
# Mirrors the checklist from docs/BACKEND_RESPONSE_2026-05-24.md.
#
# Usage:
#   EMAIL=claude-test@vinshare.dev PASSWORD=Test1234! bash scripts/verify-backend.sh
#   # or with a different account:
#   EMAIL=owner@ford.com PASSWORD=senha123 bash scripts/verify-backend.sh
#
# Exits 0 when every check passes, 1 on the first failure.
# Requires: bash, curl, jq.

set -uo pipefail

BASE="${API_URL:-https://vinshare-api.azurewebsites.net/api/v1}"
EMAIL="${EMAIL:?set EMAIL=... before running}"
PASSWORD="${PASSWORD:?set PASSWORD=... before running}"

PASS=0
FAIL=0
WARN=0

color() { printf '\033[%sm%s\033[0m' "$1" "$2"; }
ok()    { color '0;32' "[ OK ]";  PASS=$((PASS+1)); }
fail()  { color '0;31' "[FAIL]";  FAIL=$((FAIL+1)); }
warn()  { color '0;33' "[WARN]";  WARN=$((WARN+1)); }

require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "Missing dependency: jq. Install via 'brew install jq', 'choco install jq', or 'apt install jq'."
    exit 2
  fi
}

login() {
  local body
  body=$(curl -sS -X POST "$BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  TOKEN=$(echo "$body" | jq -r '.data.accessToken // empty')
  EXPIRES_IN=$(echo "$body" | jq -r '.data.expiresIn // empty')
  if [ -z "$TOKEN" ]; then
    echo "Login failed. Response was:"
    echo "$body" | jq .
    exit 1
  fi
}

http_code() {
  curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$BASE$1"
}

probe_json() {
  curl -sS -H "Authorization: Bearer $TOKEN" "$BASE$1"
}

# ─── Checks ─────────────────────────────────────────────────────────────────

check_expires_in() {
  if [ "$EXPIRES_IN" = "900" ]; then
    echo "$(ok) expiresIn=$EXPIRES_IN (expected 900)"
  else
    echo "$(fail) expiresIn=$EXPIRES_IN (expected 900 — JWT_ACCESS_MIN env not flipped?)"
  fi
}

check_endpoint_200() {
  local label=$1 path=$2
  local code; code=$(http_code "$path")
  if [ "$code" = "200" ]; then
    echo "$(ok) $label  GET $path  → 200"
  else
    echo "$(fail) $label  GET $path  → $code (expected 200)"
  fi
}

check_lead_fields() {
  local body; body=$(probe_json "/leads?status=EM_RISCO&size=1")
  local code; code=$(echo "$body" | jq -r '.success // false')
  if [ "$code" != "true" ]; then
    echo "$(fail) /leads?status=EM_RISCO did not return success:true"
    return
  fi
  local missing=()
  local lead; lead=$(echo "$body" | jq -r '.data.content[0] // empty')
  if [ -z "$lead" ]; then
    echo "$(warn) /leads returned empty content; cannot verify new fields"
    return
  fi
  for field in cpfMasked vehiclePlate status warrantyStatus daysSinceLastVisit customerId updatedAt; do
    local present; present=$(echo "$lead" | jq -r --arg f "$field" 'has($f)')
    if [ "$present" != "true" ]; then missing+=("$field"); fi
  done
  if [ ${#missing[@]} -eq 0 ]; then
    echo "$(ok) /leads content[0] has all 7 new fields (cpfMasked, vehiclePlate, status, warrantyStatus, daysSinceLastVisit, customerId, updatedAt)"
  else
    echo "$(fail) /leads content[0] missing fields: ${missing[*]}"
  fi
}

check_segments_distribution_envelope() {
  local body; body=$(probe_json "/segments/distribution")
  local kind; kind=$(echo "$body" | jq -r '.data | if type == "array" then "array" else (keys | join(",")) end')
  if [ "$kind" = "array" ]; then
    echo "$(warn) /segments/distribution still returns a flat array (back hasn't deployed the envelope yet — service normalizer handles it)"
  elif echo "$kind" | grep -q "buckets" && echo "$kind" | grep -q "totalCustomers"; then
    echo "$(ok) /segments/distribution envelope shipped (keys: $kind)"
  else
    echo "$(fail) /segments/distribution unexpected shape — keys: $kind"
  fi
}

check_segments_customers_shape() {
  local body; body=$(probe_json "/segments/FIEL/customers?size=1")
  local first; first=$(echo "$body" | jq -r '.data.content[0] // empty')
  if [ -z "$first" ]; then
    echo "$(warn) /segments/FIEL/customers returned empty content; cannot verify"
    return
  fi
  if echo "$first" | jq -e 'has("name") and has("cpfMasked") and has("estimatedLtv")' >/dev/null; then
    echo "$(ok) /segments/{segment}/customers shipped real customer profile (name, cpfMasked, estimatedLtv)"
  else
    local keys; keys=$(echo "$first" | jq -r 'keys | join(",")')
    echo "$(warn) /segments/{segment}/customers still on the ML-prediction shape (keys: $keys)"
  fi
}

check_dealership_vin_share() {
  local body; body=$(probe_json "/analytics/vin-share/by-dealership?period=30d")
  local first; first=$(echo "$body" | jq -r '.data[0] // empty')
  if [ -z "$first" ]; then
    echo "$(warn) /analytics/vin-share/by-dealership empty; cannot verify"
    return
  fi
  if echo "$first" | jq -e 'has("trend") and has("estimatedRevenue")' >/dev/null; then
    echo "$(ok) /analytics/vin-share/by-dealership has trend + estimatedRevenue"
  else
    echo "$(warn) /analytics/vin-share/by-dealership missing trend/estimatedRevenue (back hasn't shipped yet)"
  fi
}

check_availability_time_format() {
  local dealership_id
  dealership_id=$(probe_json "/dealerships?lat=-23.55&lng=-46.63&radiusKm=50" | jq -r '.data[0].id // empty')
  if [ -z "$dealership_id" ]; then
    echo "$(warn) Could not fetch a dealership ID; skipping availability check"
    return
  fi
  local time
  time=$(probe_json "/dealerships/$dealership_id/availability?serviceType=REVIEW&date=2026-06-01" | jq -r '.data.slots[0].time // empty')
  if [ -z "$time" ]; then
    echo "$(warn) availability returned no slots; cannot verify time format"
    return
  fi
  case "$time" in
    *:*:*) echo "$(warn) AvailabilitySlot.time=\"$time\" still has seconds (back hasn't applied @JsonFormat yet)" ;;
    *) echo "$(ok) AvailabilitySlot.time=\"$time\" (HH:mm)" ;;
  esac
}

check_me_fullname() {
  local body; body=$(probe_json "/me")
  local name; name=$(echo "$body" | jq -r '.data.fullName // empty')
  if [ -z "$name" ] || [ "$name" = "null" ]; then
    echo "$(warn) /me fullName is null for $EMAIL (back may not have populated display_name yet)"
  else
    echo "$(ok) /me fullName=\"$name\""
  fi
}

# ─── Run ────────────────────────────────────────────────────────────────────

require_jq

echo "→ Logging in as $EMAIL against $BASE"
login

echo
echo "── Auth & user profile ─────────────────────────────"
check_expires_in
check_me_fullname

echo
echo "── Endpoints previously returning 500 ──────────────"
check_endpoint_200 "Home timeline " "/me/services"
check_endpoint_200 "Appointments  " "/me/appointments"
check_endpoint_200 "VIN Share line" "/analytics/vin-share/series?groupBy=week&from=2026-04-01&to=2026-05-28"
check_endpoint_200 "NPS summary   " "/analytics/nps"
echo "$(test "$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/v3/api-docs")" = "200" && ok || fail) OpenAPI spec GET /v3/api-docs"

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
