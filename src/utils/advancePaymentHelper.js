// src/utils/advancePaymentHelper.js
import { supabase } from '../lib/supabaseClient';

/**
 * Calculate the next due date (1 month from current due date)
 */
export const calculateNextDueDate = (currentDueDate) => {
  const date = new Date(currentDueDate);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

/**
 * Fetch tenant data with room details and last payment
 */
export const fetchTenantPaymentData = async (userId) => {
  try {
    // Get tenant with room details
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        room_id,
        rent_due,
        rooms (
          price_monthly,
          capacity,
          base_electric_rate,
          room_number
        )
      `)
      .eq('profile_id', userId)
      .eq('status', 'Active')
      .single();

    if (tenantError) throw tenantError;
    if (!tenantData) throw new Error('Tenant record not found');

    // Get last payment to check for extra charges
    const { data: lastPayment } = await supabase
      .from('payments')
      .select('amount, electricity_cost, notes')
      .eq('tenant_id', tenantData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { tenantData, lastPayment };
  } catch (error) {
    throw new Error(`Failed to fetch tenant data: ${error.message}`);
  }
};

/**
 * Calculate monthly payment amount for user
 */
export const calculateMonthlyPayment = (room, lastPayment) => {
  const rentPerHead = room.price_monthly / room.capacity;
  const electricPerHead = (room.base_electric_rate || 0) / room.capacity;
  
  // Check if user has extra electronics charge
  const hasElectronics = lastPayment?.notes?.toLowerCase().includes('electronics') || false;
  const electronicsCharge = hasElectronics ? 150 : 0;
  
  const totalAmount = rentPerHead + electricPerHead + electronicsCharge;

  return {
    rentPerHead,
    electricPerHead,
    electronicsCharge,
    hasElectronics,
    totalAmount
  };
};

/**
 * Create advance payment record
 */
export const createAdvancePayment = async (tenantData, paymentDetails) => {
  try {
    const { data: newPayment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        tenant_id: tenantData.id,
        room_id: tenantData.room_id,
        payment_date: new Date().toISOString().split('T')[0],
        due_date: paymentDetails.nextDueDate,
        amount: paymentDetails.totalAmount,
        electricity_reading: 0,
        electricity_cost: paymentDetails.electricPerHead,
        payment_status: 'Pending',
        notes: paymentDetails.hasElectronics 
          ? 'Advance payment - Includes ₱150 extra electronics charge' 
          : 'Advance payment',
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update tenant's rent_due date
    const { error: tenantUpdateError } = await supabase
      .from('tenants')
      .update({ rent_due: paymentDetails.nextDueDate })
      .eq('id', tenantData.id);

    if (tenantUpdateError) throw tenantUpdateError;

    return newPayment;
  } catch (error) {
    throw new Error(`Failed to create payment: ${error.message}`);
  }
};