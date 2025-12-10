import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/authcontext';

export default function Tenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [tenantForm, setTenantForm] = useState({
    tenant_name: '',
    email: '',
    phone: '',
    address: '',
    room_id: '',
    rent_start: '',
    rent_due: '',
  });

  useEffect(() => {
    fetchTenants();
    fetchAvailableRooms();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          rooms(id, room_number, price_monthly),
          profiles(full_name, email, phone, address)
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
        .select('id, room_number, price_monthly')
        .eq('status', 'Available')
        .order('room_number', { ascending: true });

      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  // ✅ CLICK TENANT TO VIEW PAYMENT HISTORY
  const handleTenantClick = async (tenant) => {
    setSelectedTenant(tenant);
    setShowPaymentHistory(true);
    setLoadingHistory(true);

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, rooms(room_number)')
        .eq('tenant_id', tenant.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Error loading payment history');
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

      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          tenant_name: tenantForm.tenant_name,
          room_id: parseInt(tenantForm.room_id),
          rent_start: tenantForm.rent_start,
          rent_due: tenantForm.rent_due,
          status: 'Active'
        }])
        .select();

      if (error) throw error;

      // Update room status to Occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'Occupied' })
        .eq('id', parseInt(tenantForm.room_id));

      if (roomError) throw roomError;

      alert('Tenant added successfully!');
      
      setTenantForm({
        tenant_name: '',
        email: '',
        phone: '',
        address: '',
        room_id: '',
        rent_start: '',
        rent_due: '',
      });

      setShowAddTenant(false);
      fetchTenants();
      fetchAvailableRooms();

    } catch (error) {
      console.error('Error adding tenant:', error);
      alert('Error adding tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (tenantId, roomId) => {
    if (!confirm('Are you sure you want to remove this tenant?')) return;

    try {
      setLoading(true);

      // Set tenant as Inactive
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ status: 'Inactive' })
        .eq('id', tenantId);

      if (tenantError) throw tenantError;

      // Update room status to Available
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'Available' })
        .eq('id', roomId);

      if (roomError) throw roomError;

      alert('Tenant removed successfully!');
      fetchTenants();
      fetchAvailableRooms();
    } catch (error) {
      console.error('Error removing tenant:', error);
      alert('Error removing tenant: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const activeTenants = tenants.filter(t => t.status === 'Active');

  return (
    <>
      <section className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">
              Admin Tenant Management
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Tenants Management
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Active Tenants: {activeTenants.length} | Total: {tenants.length}
            </p>
          </div>

          <button 
            onClick={() => setShowAddTenant(true)}
            className="rounded-md bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-gray-900"
          >
            Add New Tenant
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-6 bg-gray-100 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-700">
            <span>Room No.</span>
            <span>Tenant Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Rent Due</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Loading tenants...
            </div>
          ) : tenants.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No tenants yet. Click "Add New Tenant" to get started.
            </div>
          ) : (
            tenants.map((tenant) => (
              <div key={tenant.id}>
                {/* Mobile Card View */}
                <div className="md:hidden border-t border-gray-100 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Room {tenant.rooms?.room_number || 'N/A'}</p>
                      <p className="text-sm text-gray-700 font-medium">{tenant.tenant_name}</p>
                      <p className="text-xs text-gray-600">{tenant.profiles?.email || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{tenant.profiles?.phone || 'N/A'}</p>
                    </div>
                    {tenant.status === 'Active' ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleTenantClick(tenant)}
                      className="flex-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 py-2 rounded"
                    >
                      View Payments
                    </button>
                    {tenant.status === 'Active' && (
                      <button 
                        onClick={() => handleRemoveTenant(tenant.id, tenant.room_id)}
                        className="flex-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 py-2 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Table Row - CLICKABLE */}
                <div 
                  className="hidden md:grid md:grid-cols-6 px-4 py-3 text-xs sm:text-sm text-gray-800 border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleTenantClick(tenant)}
                >
                  <span className="font-semibold">Room {tenant.rooms?.room_number || 'N/A'}</span>
                  <span className="font-medium">{tenant.tenant_name}</span>
                  <span className="text-gray-600">{tenant.profiles?.email || 'N/A'}</span>
                  <span className="text-gray-600">{tenant.profiles?.phone || 'N/A'}</span>
                  <span className="text-gray-700">
                    {tenant.rent_due ? new Date(tenant.rent_due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                  <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                    {tenant.status === 'Active' ? (
                      <>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                          Active
                        </span>
                        <button 
                          onClick={() => handleRemoveTenant(tenant.id, tenant.room_id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 ml-2"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ADD TENANT MODAL */}
      {showAddTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Tenant</h3>
              <button 
                onClick={() => setShowAddTenant(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Tenant Name *</label>
                <input
                  type="text"
                  required
                  value={tenantForm.tenant_name}
                  onChange={(e) => setTenantForm({ ...tenantForm, tenant_name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter tenant name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Room *</label>
                <select
                  required
                  value={tenantForm.room_id}
                  onChange={(e) => setTenantForm({ ...tenantForm, room_id: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select Room</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - ₱{room.price_monthly.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Rent Start Date *</label>
                <input
                  type="date"
                  required
                  value={tenantForm.rent_start}
                  onChange={(e) => setTenantForm({ ...tenantForm, rent_start: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Rent Due Date *</label>
                <input
                  type="date"
                  required
                  value={tenantForm.rent_due}
                  onChange={(e) => setTenantForm({ ...tenantForm, rent_due: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-[#051A2C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#031121] disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {showPaymentHistory && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTenant.tenant_name} - Room {selectedTenant.rooms?.room_number}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowPaymentHistory(false);
                  setSelectedTenant(null);
                  setPaymentHistory([]);
                }}
                className="text-gray-500 hover:text-black text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              {/* Tenant Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Tenant Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{selectedTenant.tenant_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{selectedTenant.profiles?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{selectedTenant.profiles?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address:</p>
                    <p className="font-medium">{selectedTenant.profiles?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment History List */}
              <h4 className="font-semibold text-gray-900 mb-3">Payment Records</h4>
              
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-500">Loading payment history...</div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payment records found</div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            }) : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">Room {payment.rooms?.room_number}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                          payment.payment_status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>
                          <p className="text-gray-600">Amount:</p>
                          <p className="font-semibold text-green-600">₱{parseFloat(payment.amount || 0).toLocaleString()}</p>
                        </div>
                        {payment.electricity_reading > 0 && (
                          <div>
                            <p className="text-gray-600">Electricity:</p>
                            <p className="font-medium">{payment.electricity_reading} kWh</p>
                          </div>
                        )}
                        {payment.reference_no && (
                          <div className="col-span-2">
                            <p className="text-gray-600">Reference:</p>
                            <p className="font-mono text-xs">{payment.reference_no}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}