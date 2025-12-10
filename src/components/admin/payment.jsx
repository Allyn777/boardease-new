import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('History');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [tenants, setTenants] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    tenant_id: '',
    amount: '',
    due_date: '',
    electricity_reading: '',
    electricity_cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchActiveTenants();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          rooms(room_number),
          tenants(tenant_name, profiles(full_name))
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, tenant_name, room_id, rooms(room_number, price_monthly)')
        .eq('status', 'Active')
        .order('tenant_name', { ascending: true });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (!paymentForm.tenant_id || !paymentForm.amount || !paymentForm.due_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const selectedTenant = tenants.find(t => t.id === parseInt(paymentForm.tenant_id));

      const { error } = await supabase
        .from('payments')
        .insert([{
          tenant_id: parseInt(paymentForm.tenant_id),
          room_id: selectedTenant?.room_id,
          payment_date: new Date().toISOString().split('T')[0],
          due_date: paymentForm.due_date,
          amount: parseFloat(paymentForm.amount),
          electricity_reading: parseFloat(paymentForm.electricity_reading) || 0,
          electricity_cost: parseFloat(paymentForm.electricity_cost) || 0,
          payment_status: 'Pending',
          notes: paymentForm.notes,
        }]);

      if (error) throw error;

      alert('Payment record added successfully!');
      
      setPaymentForm({
        tenant_id: '',
        amount: '',
        due_date: '',
        electricity_reading: '',
        electricity_cost: '',
        notes: '',
      });

      setShowAddPayment(false);
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error adding payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const updateData = { payment_status: newStatus };
      
      if (newStatus === 'Paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;

      alert(`Payment marked as ${newStatus}`);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment status');
    }
  };

  // Filter payments by category
  const getFilteredPayments = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    switch (filter) {
      case 'History':
        return payments; // All payments

      case 'Overdue':
        return payments.filter(p => {
          if (p.payment_status !== 'Pending' || !p.due_date) return false;
          return new Date(p.due_date) < today;
        });

      case 'Upcoming':
        return payments.filter(p => {
          if (p.payment_status !== 'Pending' || !p.due_date) return false;
          const dueDate = new Date(p.due_date);
          return dueDate >= today && dueDate <= sevenDaysFromNow;
        });

      case 'Paid':
        return payments.filter(p => p.payment_status === 'Paid');

      case 'Pending':
        return payments.filter(p => p.payment_status === 'Pending');

      default:
        return payments;
    }
  };

  const filteredPayments = getFilteredPayments();

  const totalPaid = payments
    .filter(p => p.payment_status === 'Paid')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const totalPending = payments
    .filter(p => p.payment_status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const overdueCount = payments.filter(p => {
    if (p.payment_status !== 'Pending' || !p.due_date) return false;
    return new Date(p.due_date) < new Date();
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                ₱{totalPaid.toLocaleString()}
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
                ₱{totalPending.toLocaleString()}
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
                {overdueCount}
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
                {payments.length}
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
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
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
                    <select
                      value={payment.payment_status}
                      onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#051A2C]"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
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
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        <td className="px-4 py-3">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Payment Record</h3>
              <button 
                onClick={() => setShowAddPayment(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Tenant *</label>
                <select
                  required
                  value={paymentForm.tenant_id}
                  onChange={(e) => {
                    const tenant = tenants.find(t => t.id === parseInt(e.target.value));
                    setPaymentForm({ 
                      ...paymentForm, 
                      tenant_id: e.target.value,
                      amount: tenant?.rooms?.price_monthly || ''
                    });
                  }}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select Tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.tenant_name} - Room {tenant.rooms?.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Amount (PHP) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., 3000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Due Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.due_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Electricity Reading (kWh)</label>
                <input
                  type="number"
                  value={paymentForm.electricity_reading}
                  onChange={(e) => setPaymentForm({ ...paymentForm, electricity_reading: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., 150"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Electricity Cost (PHP)</label>
                <input
                  type="number"
                  value={paymentForm.electricity_cost}
                  onChange={(e) => setPaymentForm({ ...paymentForm, electricity_cost: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-[#051A2C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#031121] disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}