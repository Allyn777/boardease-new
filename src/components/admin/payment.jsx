import { usePayments } from './usePayments';
import PaymentDetailsModal from './PaymentDetailsModal';
import EditPaymentModal from './EditPaymentModal';
import AddPaymentForm from './AddPaymentForm';

export default function Payments() {
  const {
    loading,
    filter,
    setFilter,
    showAddPayment,
    setShowAddPayment,
    selectedPayment,
    showPaymentDetails,
    showEditPayment,
    paymentForm,
    setPaymentForm,
    editForm,
    setEditForm,
    tenants,
    filteredPayments,
    stats,
    handleAddPayment,
    handlePaymentClick,
    handleEditClick,
    handleUpdatePayment,
    handleDeletePayment,
    updatePaymentStatus,
    closeModals,
  } = usePayments();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                ₱{stats.totalPaid.toLocaleString()}
              </p>
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
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                ₱{stats.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Overdue</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                {stats.overdueCount}
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Records</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats.totalRecords}
              </p>
            </div>
            <div className="bg-gray-100 p-2 sm:p-3 rounded-full">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">Admin Payment Management</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management</h2>
          </div>

          <button
            onClick={() => setShowAddPayment(true)}
            className="rounded-md bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-gray-900"
          >
            Add Payment Record
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['History', 'Overdue', 'Upcoming', 'Paid', 'Pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                filter === status
                  ? 'bg-[#051A2C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Loading payments...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No payments found in this category
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="border border-gray-200 rounded-lg p-4 space-y-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handlePaymentClick(payment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Room {payment.rooms?.room_number || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payment.tenants?.tenant_name || 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        payment.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                        payment.payment_status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.payment_status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-green-600">
                      ₱{parseFloat(payment.amount || 0).toLocaleString()}
                    </p>
                    {payment.electricity_reading > 0 && (
                      <p className="text-xs text-blue-600">
                        ⚡ {payment.electricity_reading} kWh
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Due: {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Room</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Electricity</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-500 text-sm">
                        No payments found in this category
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr 
                        key={payment.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handlePaymentClick(payment)}
                      >
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">
                          Room {payment.rooms?.room_number || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-800">
                          {payment.tenants?.tenant_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-green-600">
                          ₱{parseFloat(payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-blue-600">
                          {payment.electricity_reading > 0 ? `${payment.electricity_reading} kWh` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                            payment.payment_status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {payment.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={payment.payment_status}
                            onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                            className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#051A2C]"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                          </select>
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

      {/* ADD PAYMENT MODAL */}
      {showAddPayment && (
        <AddPaymentForm
          paymentForm={paymentForm}
          setPaymentForm={setPaymentForm}
          handleAddPayment={handleAddPayment}
          tenants={tenants}
          onClose={() => setShowAddPayment(false)}
          loading={loading}
        />
      )}

      {/* PAYMENT DETAILS MODAL */}
      {showPaymentDetails && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={closeModals}
          onEdit={handleEditClick}
          onDelete={handleDeletePayment}
          onStatusChange={updatePaymentStatus}
        />
      )}

      {/* EDIT PAYMENT MODAL */}
      {showEditPayment && selectedPayment && (
        <EditPaymentModal
          editForm={editForm}
          setEditForm={setEditForm}
          handleUpdatePayment={handleUpdatePayment}
          onClose={() => setShowEditPayment(false)}
          loading={loading}
          payment={selectedPayment}
        />
      )}
    </div>
  );
}