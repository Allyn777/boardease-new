// src/components/AdvancePaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import {
  fetchTenantPaymentData,
  calculateMonthlyPayment,
  calculateNextDueDate,
  createAdvancePayment
} from '../utils/advancePaymentHelper';

const AdvancePaymentModal = ({ isOpen, onClose, currentRoom, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      loadPaymentData();
    }
  }, [isOpen, user]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { tenantData, lastPayment } = await fetchTenantPaymentData(user.id);
      const room = tenantData.rooms;
      const payment = calculateMonthlyPayment(room, lastPayment);
      const nextDueDate = calculateNextDueDate(tenantData.rent_due);

      setPaymentData({
        tenantData,
        room,
        payment,
        currentDueDate: new Date(tenantData.rent_due),
        nextDueDate,
        nextDueDateFormatted: new Date(nextDueDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentData) return;

    try {
      setCreating(true);

      const newPayment = await createAdvancePayment(
        paymentData.tenantData,
        {
          nextDueDate: paymentData.nextDueDate,
          totalAmount: paymentData.payment.totalAmount,
          electricPerHead: paymentData.payment.electricPerHead,
          hasElectronics: paymentData.payment.hasElectronics
        }
      );

      // Call success callback to refresh parent data
      if (onSuccess) {
        await onSuccess();
      }

      // Redirect to payment page
      setTimeout(() => {
        navigate(`/payment/${newPayment.id}`);
      }, 500);

    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Advance Payment</h3>
            <p className="text-sm text-gray-600 mt-1">Pay for next month in advance</p>
          </div>
          <button 
            onClick={onClose}
            disabled={creating}
            className="text-gray-500 hover:text-black text-2xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating payment...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">❌ {error}</p>
            <button
              onClick={onClose}
              className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
            >
              Close
            </button>
          </div>
        )}

        {/* Payment Details */}
        {!loading && !error && paymentData && (
          <div className="mt-6 space-y-4">
            {/* Room Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Your Room</p>
              <p className="text-lg font-bold text-gray-900">
                Room {paymentData.room.room_number}
              </p>
            </div>

            {/* Current Due Date */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Current Due Date</p>
              <p className="text-lg font-bold text-gray-900">
                {paymentData.currentDueDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* New Due Date */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">New Due Date (After Payment)</p>
              <p className="text-lg font-bold text-blue-900">
                {paymentData.nextDueDateFormatted}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                📅 Extended by 1 month
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
              <h4 className="text-sm font-bold text-green-800 mb-3">💰 Payment Breakdown</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rent (per person):</span>
                  <span className="font-semibold text-gray-900">
                    ₱{paymentData.payment.rentPerHead.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">⚡ Electric (per person):</span>
                  <span className="font-semibold text-yellow-700">
                    ₱{paymentData.payment.electricPerHead.toFixed(2)}
                  </span>
                </div>
                
                {paymentData.payment.hasElectronics && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">🔌 Extra electronics:</span>
                    <span className="font-semibold text-orange-700">₱150.00</span>
                  </div>
                )}
                
                <div className="border-t border-green-300 pt-2 flex justify-between">
                  <span className="font-bold text-green-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-800">
                    ₱{paymentData.payment.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-green-600 mt-3">
                ✅ Same as your regular monthly payment
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">How Advance Payment Works</p>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                    <li>• Your due date will be extended by 1 month</li>
                    <li>• Payment amount stays the same</li>
                    <li>• You can pay multiple months in advance</li>
                    <li>• Payment record created immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={creating}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={creating}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  `Pay ₱${paymentData.payment.totalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancePaymentModal;