// src/components/PaymentDetailsModal.jsx - MOBILE OPTIMIZED
import React from 'react';
import {
  formatCurrency,
  formatDate,
  isPaymentOverdue,
  getOverdueDays,
  getPaymentStatusColor,
  getPaymentStatusIcon,
  getPaymentMethodName,
  hasExtraCharges
} from '../utils/paymentCalculations';

const PaymentDetailsModal = ({ payment, room, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const overdue = isPaymentOverdue(payment);
  const overdueDays = overdue ? getOverdueDays(payment.due_date) : 0;
  const statusColor = getPaymentStatusColor(payment.payment_status);
  const statusIcon = getPaymentStatusIcon(payment.payment_status);

  // Calculate breakdown
  const baseAmount = parseFloat(payment.amount || 0);
  const electricityCost = parseFloat(payment.electricity_cost || 0);
  const electricityReading = parseFloat(payment.electricity_reading || 0);
  
  // Check for extra charges from notes
  const hasElectronics = payment.notes?.toLowerCase().includes('electronics');
  const electronicsCharge = hasElectronics ? 150 : 0;
  
  // Calculate rent breakdown if room info is available
  let rentPerHead = 0;
  let electricPerHead = 0;
  
  if (room) {
    rentPerHead = room.price_monthly / room.capacity;
    electricPerHead = (room.base_electric_rate || 0) / room.capacity;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-[95vw] sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Details</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Room {payment.rooms?.room_number || 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl sm:text-2xl transition-colors flex-shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Payment Status Card */}
        <div className={`rounded-xl p-4 sm:p-5 border-2 mb-4 sm:mb-6 ${statusColor}`}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium mb-1 opacity-80">Payment Status</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">{statusIcon}</span>
                <span className="text-xl sm:text-3xl font-bold truncate">
                  {payment.payment_status}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm font-medium mb-1 opacity-80">Amount</p>
              <p className="text-xl sm:text-3xl font-bold">
                {formatCurrency(baseAmount)}
              </p>
            </div>
          </div>

          {/* Overdue Warning */}
          {overdue && (
            <div className="mt-3 sm:mt-4 bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm font-bold text-red-800">
                ⚠️ Overdue by {overdueDays} day{overdueDays !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Payment Dates */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Important Dates
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {payment.payment_date ? formatDate(payment.payment_date) : 
                    payment.payment_status === 'Paid' ? formatDate(payment.created_at) : 'Not paid yet'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Due Date</p>
                <p className={`text-xs sm:text-sm font-semibold ${overdue ? 'text-red-700' : 'text-gray-900'}`}>
                  {payment.due_date ? formatDate(payment.due_date) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Created On</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {formatDate(payment.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-purple-800 mb-2 sm:mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Info
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {getPaymentMethodName(payment.payment_method)}
                </p>
              </div>
              {payment.reference_no && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-gray-900 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-purple-200 break-all">
                    {payment.reference_no}
                  </p>
                </div>
              )}
              {payment.stripe_payment_intent_id && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Stripe Payment ID</p>
                  <p className="text-xs font-mono text-gray-700 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-purple-200 break-all">
                    {payment.stripe_payment_intent_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-bold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Payment Breakdown
          </h4>

          <div className="space-y-2 sm:space-y-3">
            {/* Rent Breakdown */}
            {room && rentPerHead > 0 && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">🏠 Rent (per person)</span>
                  <span className="text-base sm:text-lg font-bold text-green-700">
                    {formatCurrency(rentPerHead)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatCurrency(room.price_monthly)} ÷ {room.capacity} person{room.capacity > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Electricity */}
            {(electricPerHead > 0 || electricityCost > 0) && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">⚡ Electricity</span>
                  <span className="text-base sm:text-lg font-bold text-yellow-700">
                    {formatCurrency(electricPerHead || electricityCost)}
                  </span>
                </div>
                {electricityReading > 0 && (
                  <p className="text-xs text-gray-500">
                    Reading: {electricityReading} kWh
                  </p>
                )}
                {room && electricPerHead > 0 && (
                  <p className="text-xs text-gray-500">
                    {formatCurrency(room.base_electric_rate || 0)} ÷ {room.capacity} person{room.capacity > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Extra Electronics */}
            {hasElectronics && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">🔌 Extra Electronics</span>
                  <span className="text-base sm:text-lg font-bold text-orange-700">
                    {formatCurrency(electronicsCharge)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Rice cooker, electric fan, or other appliances
                </p>
              </div>
            )}

            {/* Total */}
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-bold text-green-900">Total Amount</span>
                <span className="text-xl sm:text-2xl font-bold text-green-900">
                  {formatCurrency(baseAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {payment.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}

        {/* Receipt Link */}
        {payment.receipt_url && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900 truncate">Payment Receipt</p>
                  <p className="text-xs text-blue-700">Click to view</p>
                </div>
              </div>
              <a 
                href={payment.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                View
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          
          {payment.payment_status === 'Pending' && (
            <button
              onClick={() => {
                onClose();
                window.location.href = `/payment/${payment.id}`;
              }}
              className="w-full sm:flex-1 bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition-colors"
            >
              💳 Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;