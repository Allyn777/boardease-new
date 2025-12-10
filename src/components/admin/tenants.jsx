import { useTenants } from './useTenants';

export default function Tenants() {
  const {
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
  } = useTenants();

  const activeTenants = tenants.filter(t => t.status === 'Active');

  // Calculate per-head pricing for preview
  const selectedRoom = availableRooms.find(r => r.id === parseInt(tenantForm.room_id));
  const rentPerHead = selectedRoom ? selectedRoom.price_monthly / selectedRoom.capacity : 0;
  const electricPerHead = selectedRoom ? (selectedRoom.base_electric_rate || 0) / selectedRoom.capacity : 0;
  const electronicsCharge = tenantForm.has_electronics ? 150 : 0; // Changed from has_rice_cooker
  const totalPerHead = rentPerHead + electricPerHead + electronicsCharge;

  // Get current occupancy
  const currentOccupancy = selectedRoom ? tenants.filter(t => t.room_id === selectedRoom.id && t.status === 'Active').length : 0;
  const spotsLeft = selectedRoom ? selectedRoom.capacity - currentOccupancy : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Tenants</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{tenants.length}</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Tenants</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{activeTenants.length}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Available Rooms</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                {availableRooms.filter(r => r.status === 'Available').length}
              </p>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Registered Users</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{registeredUsers.length}</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">Admin Tenant Management</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tenant Management</h2>
          </div>

          <button
            onClick={() => setShowAddTenant(true)}
            className="rounded-md bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-gray-900"
          >
            Add New Tenant
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Loading tenants...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {tenants.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No tenants added yet
                </div>
              ) : (
                tenants.map((tenant) => (
                  <div key={tenant.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{tenant.tenant_name}</p>
                        <p className="text-xs text-gray-600">
                          Room {tenant.rooms?.room_number || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Rent Due: {tenant.rent_due ? new Date(tenant.rent_due).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tenant.status}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleTenantClick(tenant)}
                        className="flex-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-3 py-1.5"
                      >
                        View Payments
                      </button>
                      {tenant.status === 'Active' && (
                        <button
                          onClick={() => handleRemoveTenant(tenant.id, tenant.room_id)}
                          className="flex-1 text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 rounded px-3 py-1.5"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Room</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Rent Start</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Rent Due</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-gray-500 text-sm">
                        No tenants added yet
                      </td>
                    </tr>
                  ) : (
                    tenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">{tenant.tenant_name}</td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          Room {tenant.rooms?.room_number || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          {tenant.rent_start ? new Date(tenant.rent_start).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          {tenant.rent_due ? new Date(tenant.rent_due).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTenantClick(tenant)}
                              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                            {tenant.status === 'Active' && (
                              <button
                                onClick={() => handleRemoveTenant(tenant.id, tenant.room_id)}
                                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

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
                  {availableRooms.map((room) => {
                    const occupancy = tenants.filter(t => t.room_id === room.id && t.status === 'Active').length;
                    const spotsLeft = room.capacity - occupancy;
                    return (
                      <option 
                        key={room.id} 
                        value={room.id}
                        disabled={spotsLeft === 0}
                      >
                        Room {room.room_number} - {spotsLeft > 0 ? `${spotsLeft}/${room.capacity} spots left` : 'FULL'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Link to Registered User (Optional)</label>
                <select
                  value={tenantForm.profile_id}
                  onChange={(e) => setTenantForm({ ...tenantForm, profile_id: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">No linked user</option>
                  {registeredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || 'Unnamed User'}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="electronics"
                  checked={tenantForm.has_electronics}
                  onChange={(e) => setTenantForm({ ...tenantForm, has_electronics: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="electronics" className="text-sm text-gray-700">
                  Has Extra Electronics (+₱150/month)
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6 -mt-2">
                Rice cooker, electric fan, or other appliances
              </p>

              {/* Per-Head Cost Preview */}
              {selectedRoom && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-xs sm:text-sm font-semibold text-blue-700 mb-2 block">💰 Monthly Cost Breakdown (Per Person)</label>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Rent share ({selectedRoom.capacity} persons):</span>
                      <span className="font-bold text-blue-700">₱{rentPerHead.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-yellow-600">⚡ Electric share:</span>
                      <span className="font-bold text-yellow-700">₱{electricPerHead.toFixed(2)}</span>
                    </div>
                    
                    {tenantForm.has_electronics && (
                      <div className="flex justify-between">
                        <span className="text-orange-600">🔌 Extra electronics:</span>
                        <span className="font-bold text-orange-700">₱{electronicsCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-blue-300 pt-2 flex justify-between">
                      <span className="font-bold text-blue-800">Total per person:</span>
                      <span className="font-bold text-blue-800 text-lg">₱{totalPerHead.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Occupancy: {currentOccupancy + 1}/{selectedRoom.capacity} after adding this tenant
                  </p>
                </div>
              )}

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

      {/* TENANT DETAILS MODAL */}
      {showPaymentHistory && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTenant.tenant_name}</h3>
                <p className="text-sm text-gray-600 mt-1">Complete Tenant Information</p>
              </div>
              <button 
                onClick={closePaymentHistory}
                className="text-gray-500 hover:text-black text-2xl"
              >
                ✕
              </button>
            </div>

            {/* TENANT INFO SECTION */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-semibold text-gray-900">{selectedTenant.tenant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-semibold text-gray-900">Room {selectedTenant.rooms?.room_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedTenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedTenant.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Linked Account:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedTenant.profiles?.full_name || 'No linked account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rent Info Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Rent Schedule
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedTenant.rent_start ? new Date(selectedTenant.rent_start).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold text-orange-700">
                      {selectedTenant.rent_due ? new Date(selectedTenant.rent_due).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Since Start:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedTenant.rent_start 
                        ? Math.floor((new Date() - new Date(selectedTenant.rent_start)) / (1000 * 60 * 60 * 24)) + ' days'
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Until Due:</span>
                    <span className={`font-semibold ${
                      selectedTenant.rent_due && new Date(selectedTenant.rent_due) < new Date() 
                        ? 'text-red-700' 
                        : 'text-green-700'
                    }`}>
                      {selectedTenant.rent_due 
                        ? Math.ceil((new Date(selectedTenant.rent_due) - new Date()) / (1000 * 60 * 60 * 24)) + ' days'
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MONTHLY COST BREAKDOWN */}
            {selectedTenant.rooms && (
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Monthly Payment Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">Rent Per Person</p>
                    <p className="text-lg font-bold text-purple-700">
                      ₱{(selectedTenant.rooms.price_monthly / selectedTenant.rooms.capacity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (₱{selectedTenant.rooms.price_monthly.toLocaleString()} ÷ {selectedTenant.rooms.capacity})
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">⚡ Electric Per Person</p>
                    <p className="text-lg font-bold text-yellow-700">
                      ₱{((selectedTenant.rooms.base_electric_rate || 0) / selectedTenant.rooms.capacity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (₱{(selectedTenant.rooms.base_electric_rate || 0).toLocaleString()} ÷ {selectedTenant.rooms.capacity})
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">🔌 Extra Electronics</p>
                    <p className="text-lg font-bold text-orange-700">
                      {paymentHistory.length > 0 && paymentHistory[0].notes?.toLowerCase().includes('electronics') 
                        ? '₱150.00' 
                        : '₱0.00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentHistory.length > 0 && paymentHistory[0].notes?.toLowerCase().includes('electronics') 
                        ? 'Has extra electronics' 
                        : 'No extra electronics'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-purple-100 rounded-lg p-3 border-2 border-purple-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-900">Total Monthly Payment:</span>
                    <span className="text-2xl font-bold text-purple-900">
                      ₱{paymentHistory.length > 0 
                        ? parseFloat(paymentHistory[0].amount).toLocaleString()
                        : ((selectedTenant.rooms.price_monthly / selectedTenant.rooms.capacity) + 
                           ((selectedTenant.rooms.base_electric_rate || 0) / selectedTenant.rooms.capacity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT HISTORY SECTION */}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Payment History
                <span className="text-sm font-normal text-gray-500">({paymentHistory.length} records)</span>
              </h4>
              
              {loadingHistory ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading payment history...</div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No payment records found</p>
                  <p className="text-xs text-gray-400 mt-1">Payment history will appear here once created</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {paymentHistory.map((payment, index) => (
                    <div key={payment.id} className={`border-2 rounded-xl p-4 ${
                      payment.payment_status === 'Paid' ? 'border-green-200 bg-green-50' :
                      payment.payment_status === 'Pending' ? 'border-orange-200 bg-orange-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment #{paymentHistory.length - index}</p>
                          <p className="text-2xl font-bold text-gray-900">₱{parseFloat(payment.amount).toLocaleString()}</p>
                          <p className="text-xs text-gray-600 mt-1">Room {payment.rooms?.room_number}</p>
                        </div>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
                          payment.payment_status === 'Paid' ? 'bg-green-200 text-green-800' :
                          payment.payment_status === 'Pending' ? 'bg-orange-200 text-orange-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {payment.payment_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Payment Date</p>
                          <p className="font-semibold text-gray-900">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            }) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="font-semibold text-gray-900">
                            {payment.due_date ? new Date(payment.due_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {payment.electricity_reading > 0 && (
                        <div className="mt-3 bg-white rounded-lg p-2 border border-blue-200">
                          <p className="text-xs text-blue-700 font-semibold">
                            ⚡ Electricity: {payment.electricity_reading} kWh 
                            {payment.electricity_cost > 0 && ` = ₱${parseFloat(payment.electricity_cost).toLocaleString()}`}
                          </p>
                        </div>
                      )}

                      {payment.notes && (
                        <div className="mt-3 bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Note:</span> {payment.notes}
                          </p>
                        </div>
                      )}

                      {payment.payment_status === 'Pending' && payment.due_date && new Date(payment.due_date) < new Date() && (
                        <div className="mt-3 bg-red-100 rounded-lg p-2 border border-red-300">
                          <p className="text-xs text-red-700 font-semibold">
                            ⚠️ Overdue by {Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={closePaymentHistory}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Close
              </button>
              {selectedTenant.status === 'Active' && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${selectedTenant.tenant_name} from Room ${selectedTenant.rooms?.room_number}?`)) {
                      handleRemoveTenant(selectedTenant.id, selectedTenant.room_id);
                      closePaymentHistory();
                    }
                  }}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Remove Tenant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}