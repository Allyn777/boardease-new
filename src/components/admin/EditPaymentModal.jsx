import React from "react";

export default function EditPaymentModal({
  editForm,
  setEditForm,
  handleUpdatePayment,
  onClose,
  loading,
  payment,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdatePayment} className="mt-6 space-y-4">
          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-semibold mb-1">Payment For</p>
            <p className="text-sm font-bold text-blue-800">
              {payment.tenants?.tenant_name} - Room {payment.rooms?.room_number}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Amount (PHP) *</label>
            <input
              type="number"
              required
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={editForm.due_date}
              onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Payment Status *</label>
            <select
              required
              value={editForm.payment_status}
              onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
            {editForm.payment_status === 'Paid' && payment.payment_status !== 'Paid' && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Payment date will be set to today
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Electricity Reading (kWh)</label>
            <input
              type="number"
              value={editForm.electricity_reading}
              onChange={(e) => setEditForm({ ...editForm, electricity_reading: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 150"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Electricity Cost (PHP)</label>
            <input
              type="number"
              value={editForm.electricity_cost}
              onChange={(e) => setEditForm({ ...editForm, electricity_cost: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Notes</label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Total Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-green-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-800">
                ₱{parseFloat(editForm.amount || 0).toLocaleString()}
              </span>
            </div>
            {parseFloat(editForm.electricity_cost || 0) > 0 && (
              <p className="text-xs text-green-600 mt-2">
                Includes ₱{parseFloat(editForm.electricity_cost).toLocaleString()} electricity cost
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-[#051A2C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#031121] disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}