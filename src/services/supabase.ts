import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseQueries = {
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserVehicles(userId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getVehicleServices(vehicleId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDealers() {
    const { data, error } = await supabase
      .from('dealers')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getNearbyDealers(latitude: number, longitude: number, radiusKm: number = 50) {
    const { data, error } = await supabase
      .rpc('get_nearby_dealers', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
      });

    if (error) throw error;
    return data;
  },

  async saveNPS(serviceId: string, userId: string, score: number, comment: string, category: string) {
    const { data, error } = await supabase
      .from('nps')
      .insert([{
        service_id: serviceId,
        user_id: userId,
        score,
        comment,
        category,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserNPSHistory(userId: string) {
    const { data, error } = await supabase
      .from('nps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createService(vehicleId: string, type: string, dealerId: string, scheduledDate: string) {
    const { data, error } = await supabase
      .from('services')
      .insert([{
        vehicle_id: vehicleId,
        type,
        dealer_id: dealerId,
        scheduled_date: scheduledDate,
        status: 'scheduled',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserPoints(userId: string) {
    const { data, error } = await supabase
      .from('points')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.balance || 0;
  },

  async getAnalystDashboard(analystId: string) {
    const { data, error } = await supabase
      .rpc('get_analyst_dashboard', {
        analyst_id: analystId,
      });

    if (error) throw error;
    return data;
  },

  async getLeadsList(analystId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        users!user_id (name, email, cpf),
        vehicles!user_id (model, year)
      `)
      .order('risk_score', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCustomer360(customerId: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single();

    if (userError) throw userError;

    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', customerId);

    if (vehiclesError) throw vehiclesError;

    const { data: npsHistory, error: npsError } = await supabase
      .from('nps')
      .select('*')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (npsError) throw npsError;

    const { data: leadInfo, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', customerId)
      .single();

    return {
      user,
      vehicles,
      npsHistory,
      leadInfo: leadInfo || null,
    };
  },

  async getSegmentation() {
    const { data, error } = await supabase
      .rpc('get_segmentation_stats');

    if (error) throw error;
    return data;
  },
};
