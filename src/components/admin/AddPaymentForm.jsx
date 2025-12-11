import React from "react";

export default function AddPaymentForm({
  paymentForm,
  setPaymentForm,
  handleAddPayment,
  tenants,
  onClose,
  loading,
}) {
  const selectedTenant = tenants.find(t => t.id === parseInt(paymentForm.tenant_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Add Payment Record</h3>
          <button 
            onClick={onClose}
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.tenant_name} - Room {tenant.rooms?.room_number}
                </option>
              ))}
            </select>
          </div>

          {selectedTenant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">Selected Room</p>
              <p className="text-sm font-bold text-blue-800">
                Room {selectedTenant.rooms?.room_number}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Monthly Rate: ₱{selectedTenant.rooms?.price_monthly?.toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700">Amount (PHP) *</label>
            <input
              type="number"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3000"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Base rent amount for this payment period
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Due Date *</label>
            <input
              type="date"
              required
              value={paymentForm.due_date}
              onChange={(e) => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Electricity Reading (kWh)</label>
            <input
              type="number"
              value={paymentForm.electricity_reading}
              onChange={(e) => setPaymentForm({ ...paymentForm, electricity_reading: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 150"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current meter reading in kilowatt-hours
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Electricity Cost (PHP)</label>
            <input
              type="number"
              value={paymentForm.electricity_cost}
              onChange={(e) => setPaymentForm({ ...paymentForm, electricity_cost: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Additional electricity charges for this period
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Notes</label>
            <textarea
              rows={3}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or remarks..."
            />
          </div>

          {/* Total Preview */}
          {paymentForm.amount && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Base Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ₱{parseFloat(paymentForm.amount).toLocaleString()}
                  </span>
                </div>
                {paymentForm.electricity_cost && parseFloat(paymentForm.electricity_cost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">⚡ Electricity:</span>
                    <span className="font-semibold text-yellow-700">
                      ₱{parseFloat(paymentForm.electricity_cost).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-green-300 pt-2 flex justify-between">
                  <span className="font-bold text-green-800">Total Due:</span>
                  <span className="text-2xl font-bold text-green-800">
                    ₱{(
                      parseFloat(paymentForm.amount) + 
                      parseFloat(paymentForm.electricity_cost || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}