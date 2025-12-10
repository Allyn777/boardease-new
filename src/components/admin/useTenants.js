import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [tenantForm, setTenantForm] = useState({
    tenant_name: '',
    room_id: '',
    profile_id: '',
    rent_start: '',
    rent_due: '',
    has_rice_cooker: false,
  });

  useEffect(() => {
    fetchTenants();
    fetchAvailableRooms();
    fetchRegisteredUsers();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          rooms(room_number, price_monthly, capacity, base_electric_rate),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setRegisteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleTenantClick = async (tenant) => {
    setSelectedTenant(tenant);
    setShowPaymentHistory(true);
    setLoadingHistory(true);

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          rooms(room_number)
        `)
        .eq('tenant_id', tenant.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();

    if (!tenantForm.tenant_name || !tenantForm.room_id || !tenantForm.rent_start || !tenantForm.rent_due) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Get room details
      const { data: roomData, error: roomFetchError } = await supabase
        .from('rooms')
        .select('capacity, price_monthly, base_electric_rate, room_number')
        .eq('id', parseInt(tenantForm.room_id))
        .single();

      if (roomFetchError) throw roomFetchError;

      // Check current occupancy
      const { data: existingTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id')
        .eq('room_id', parseInt(tenantForm.room_id))
        .eq('status', 'Active');

      if (tenantsError) throw tenantsError;

      const currentOccupancy = existingTenants?.length || 0;

      // Validate capacity
      if (currentOccupancy >= roomData.capacity) {
        alert(`❌ Room ${roomData.room_number} is FULL!\n\nCapacity: ${roomData.capacity}\nCurrent occupants: ${currentOccupancy}`);
        setLoading(false);
        return;
      }

      // Calculate per-head costs
      const rentPerHead = roomData.price_monthly / roomData.capacity;
      const electricPerHead = (roomData.base_electric_rate || 0) / roomData.capacity;
      const riceCookerCharge = tenantForm.has_rice_cooker ? 150 : 0;
      const totalAmount = rentPerHead + electricPerHead + riceCookerCharge;

      // Add tenant
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([{
          tenant_name: tenantForm.tenant_name,
          room_id: parseInt(tenantForm.room_id),
          profile_id: tenantForm.profile_id || null,
          rent_start: tenantForm.rent_start,
          rent_due: tenantForm.rent_due,
          status: 'Active',
        }])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Calculate new occupancy
      const newOccupancy = currentOccupancy + 1;
      const roomStatus = newOccupancy >= roomData.capacity ? 'Occupied' : 'Available';

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: roomStatus })
        .eq('id', parseInt(tenantForm.room_id));

      if (roomError) throw roomError;

      // Create initial payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          tenant_id: newTenant.id,
          room_id: parseInt(tenantForm.room_id),
          payment_date: new Date().toISOString().split('T')[0],
          due_date: tenantForm.rent_due,
          amount: totalAmount,
          electricity_reading: 0,
          electricity_cost: electricPerHead,
          payment_status: 'Pending',
          notes: tenantForm.has_rice_cooker ? 'Includes ₱150 rice cooker charge' : null,
        }]);

      if (paymentError) throw paymentError;

      alert(
        `✅ Tenant Added Successfully!\n\n` +
        `👤 Name: ${tenantForm.tenant_name}\n` +
        `🏠 Room: ${roomData.room_number}\n` +
        `📊 Occupancy: ${newOccupancy}/${roomData.capacity}\n` +
        `💰 Monthly Payment: ₱${totalAmount.toFixed(2)}\n` +
        `${roomStatus === 'Occupied' ? '🔴 Room is now FULL' : '🟢 Room still has space'}`
      );

      setTenantForm({
        tenant_name: '',
        room_id: '',
        profile_id: '',
        rent_start: '',
        rent_due: '',
        has_rice_cooker: false,
      });

      setShowAddTenant(false);
      
      // Refresh both tenants and rooms
      await Promise.all([fetchTenants(), fetchAvailableRooms()]);
    } catch (error) {
      console.error('Error adding tenant:', error);
      alert('❌ Error adding tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (tenantId, roomId) => {
    try {
      // Get room and tenant info first
      const { data: roomData, error: roomFetchError } = await supabase
        .from('rooms')
        .select('room_number, capacity')
        .eq('id', roomId)
        .single();

      if (roomFetchError) throw roomFetchError;

      const { data: activeTenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, tenant_name')
        .eq('room_id', roomId)
        .eq('status', 'Active');

      if (tenantsError) throw tenantsError;

      const currentOccupancy = activeTenants?.length || 0;
      const afterRemoval = currentOccupancy - 1;

      // Enhanced confirmation dialog
      if (!confirm(
        `🚨 Remove Tenant?\n\n` +
        `📍 Room: ${roomData?.room_number}\n` +
        `👥 Current Occupancy: ${currentOccupancy}/${roomData?.capacity}\n` +
        `➡️  After Removal: ${afterRemoval}/${roomData?.capacity}\n\n` +
        `${afterRemoval === 0 ? '✅ Room will become AVAILABLE' : afterRemoval < roomData?.capacity ? '✅ Room will become AVAILABLE (has space)' : '⚠️  Room will remain OCCUPIED'}\n\n` +
        `Continue?`
      )) return;

      setLoading(true);

      // Remove tenant (set to Inactive)
      const { error } = await supabase
        .from('tenants')
        .update({ status: 'Inactive' })
        .eq('id', tenantId);

      if (error) throw error;

      // Determine room status: Occupied ONLY if full, Available if has ANY space
      const roomStatus = afterRemoval >= roomData.capacity ? 'Occupied' : 'Available';

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: roomStatus })
        .eq('id', roomId);

      if (roomError) throw roomError;

      // Success message
      alert(
        `✅ Tenant Removed Successfully!\n\n` +
        `🏠 Room ${roomData?.room_number}\n` +
        `📊 Status: ${roomStatus.toUpperCase()}\n` +
        `👥 Occupancy: ${afterRemoval}/${roomData?.capacity}\n` +
        `${afterRemoval === 0 ? '🟢 Room is now empty and available' : afterRemoval < roomData?.capacity ? '🟢 Room has space available' : '🟡 Room is still full'}`
      );
      
      // IMPORTANT: Refresh BOTH tenants AND rooms data
      await Promise.all([fetchTenants(), fetchAvailableRooms()]);
      
    } catch (error) {
      console.error('Error removing tenant:', error);
      alert('❌ Error removing tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closePaymentHistory = () => {
    setShowPaymentHistory(false);
    setSelectedTenant(null);
    setPaymentHistory([]);
  };

  return {
    tenants,
    availableRooms,
    registeredUsers,
    loading,
    showAddTenant,
    setShowAddTenant,
    selectedTenant,
    showPaymentHistory,
    paymentHistory,
    loadingHistory,
    tenantForm,
    setTenantForm,
    handleTenantClick,
    handleAddTenant,
    handleRemoveTenant,
    closePaymentHistory,
  };
};