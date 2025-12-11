import React from "react";

export default function PaymentDetailsModal({
  payment,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const isOverdue = payment.payment_status === 'Pending' && 
                    payment.due_date && 
                    new Date(payment.due_date) < new Date();

  const daysSinceDue = payment.due_date 
    ? Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              {payment.tenants?.tenant_name} - Room {payment.rooms?.room_number}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ✕
          </button>
        </div>

        {/* Payment Status Card */}
        <div className={`mt-6 rounded-xl p-5 border-2 ${
          payment.payment_status === 'Paid' ? 'bg-green-50 border-green-200' :
          payment.payment_status === 'Pending' ? 'bg-orange-50 border-orange-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Status</p>
              <p className={`text-3xl font-bold ${
                payment.payment_status === 'Paid' ? 'text-green-700' :
                payment.payment_status === 'Pending' ? 'text-orange-700' :
                'text-red-700'
              }`}>
                {payment.payment_status}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              payment.payment_status === 'Paid' ? 'bg-green-200 text-green-800' :
              payment.payment_status === 'Pending' ? 'bg-orange-200 text-orange-800' :
              'bg-red-200 text-red-800'
            }`}>
              {payment.payment_status}
            </span>
          </div>

          {isOverdue && (
            <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
              <p className="text-sm font-bold text-red-800">
                ⚠️ Overdue by {Math.abs(daysSinceDue)} day{Math.abs(daysSinceDue) !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Payment Info Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Amount
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Amount:</span>
                <span className="font-bold text-blue-700">
                  ₱{parseFloat(payment.amount || 0).toLocaleString()}
                </span>
              </div>
              {payment.electricity_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">⚡ Electric Cost:</span>
                  <span className="font-bold text-yellow-700">
                    ₱{parseFloat(payment.electricity_cost).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-blue-300 pt-2 flex justify-between">
                <span className="font-bold text-blue-800">Total:</span>
                <span className="text-2xl font-bold text-blue-800">
                  ₱{parseFloat(payment.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Important Dates
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-semibold text-gray-900">
                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Not paid yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                  {payment.due_date ? new Date(payment.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(payment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Electricity Details */}
        {payment.electricity_reading > 0 && (
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Electricity Usage
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-yellow-100">
                <p className="text-xs text-gray-600 mb-1">Reading</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {payment.electricity_reading} kWh
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-100">
                <p className="text-xs text-gray-600 mb-1">Cost</p>
                <p className="text-2xl font-bold text-yellow-700">
                  ₱{parseFloat(payment.electricity_cost || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notes
            </h4>
            <p className="text-sm text-gray-700">{payment.notes}</p>
          </div>
        )}

        {/* Quick Status Change */}
        {payment.payment_status === 'Pending' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-3">Quick Status Change</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onStatusChange(payment.id, 'Paid');
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                ✓ Mark as Paid
              </button>
              <button
                onClick={() => {
                  onStatusChange(payment.id, 'Failed');
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                ✕ Mark as Failed
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ✏️ Edit Payment
          </button>
          <button
            onClick={onDelete}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}