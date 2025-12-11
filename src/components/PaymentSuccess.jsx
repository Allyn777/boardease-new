// /src/components/PaymentSuccess.jsx - MOBILE OPTIMIZED
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authcontext';
import Header from './header';
import Footer from './footer';

const PaymentSuccess = () => {
  const { id } = useParams(); // payment ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id && user) {
      handlePaymentSuccess();
    }
  }, [id, user]);

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentIntent = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');

      console.log('🔵 ===== PAYMENT SUCCESS FLOW START =====');
      console.log('🔵 Payment ID:', id);
      console.log('🔵 User ID:', user.id);
      console.log('🔵 Payment Intent:', paymentIntent);
      console.log('🔵 Redirect Status:', redirectStatus);

      // STEP 1: Fetch payment with details
      console.log('🔵 STEP 1: Fetching payment details...');
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select(`
          *,
          rooms(room_number),
          tenants(
            id,
            tenant_name,
            profile_id,
            profiles(full_name, phone)
          )
        `)
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Payment fetch error:', checkError);
        throw new Error(checkError.code === 'PGRST116' 
          ? 'Payment not found.'
          : `Failed to verify payment: ${checkError.message}`
        );
      }

      if (!existingPayment) {
        throw new Error('Payment does not exist.');
      }

      // Verify user owns this payment
      if (existingPayment.tenants?.profile_id !== user.id) {
        throw new Error('You do not have access to this payment.');
      }

      console.log('✅ Payment fetched:', existingPayment.id);
      console.log('🔵 Current payment status:', existingPayment.payment_status);

      // Check if already processed
      if (existingPayment.payment_status === 'Paid') {
        console.log('⚠️ Payment already marked as paid, skipping processing');
        setPayment(existingPayment);
        setLoading(false);
        return;
      }

      // STEP 2: Update payment to PAID
      console.log('🔵 STEP 2: Updating payment status to PAID...');
      
      const updateData = {
        payment_status: 'Paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'stripe',
        stripe_payment_intent_id: paymentIntent || null,
        reference_no: paymentIntent ? `STRIPE-${paymentIntent.slice(-12)}` : null,
      };

      console.log('🔵 Update data:', updateData);
      console.log('🔵 Updating payment ID:', id);

      const { data: updatedPaymentArray, error: updateError } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          rooms(room_number),
          tenants(tenant_name, profiles(full_name, phone))
        `);

      if (updateError) {
        console.error('❌ Payment update failed:', updateError);
        console.error('❌ Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw new Error(`Failed to update payment: ${updateError.message}`);
      }

      if (!updatedPaymentArray || updatedPaymentArray.length === 0) {
        console.error('❌ Payment update returned 0 rows');
        console.error('❌ This usually means RLS policies are blocking the update');
        throw new Error('Payment update failed - Check RLS policies. The update was blocked by database security rules.');
      }

      console.log('✅ Payment status updated to PAID');
      console.log('✅ Updated payment:', updatedPaymentArray[0]);

      setPayment(updatedPaymentArray[0]);
      console.log('✅✅✅ PAYMENT SUCCESS FLOW COMPLETE ✅✅✅');
      setLoading(false);
      
    } catch (err) {
      console.error('❌❌❌ PAYMENT SUCCESS FLOW FAILED ❌❌❌');
      console.error('Error:', err);
      setError(err.message || 'Failed to confirm payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12 sm:py-20 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#061A25] mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Confirming your payment...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">⏳ Processing payment confirmation</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center p-4 sm:p-6 py-12 sm:py-20">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Confirmation Error</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{error}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Your payment may have been successful with Stripe. Please check your payment history or contact support.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-[#061A25] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#0a2433] transition-colors"
              >
                VIEW MY PAYMENTS
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full border border-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors"
              >
                BACK TO PROFILE
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto p-4 sm:p-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Payment Successful! 🎉
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Thank you for your payment! Your rent has been paid successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Payment Details</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Reference Number</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 break-all text-right ml-2">{payment?.reference_no || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Room</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Room {payment?.rooms?.room_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Amount Paid</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">₱{payment?.amount ? parseFloat(payment.amount).toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Payment Date</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Payment Method</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Card (Stripe)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Payment Status</span>
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  ✓ PAID
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-2 sm:mb-3">What's Next?</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>✅ Payment confirmation recorded in your account</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>📧 Payment receipt available in your profile</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>🏠 Your landlord has been notified of the payment</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>📱 View payment history in your profile</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-[#061A25] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#0a2433] transition-colors"
            >
              VIEW MY PROFILE
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-white text-[#061A25] border-2 border-[#061A25] py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition-colors"
            >
              PAYMENT HISTORY
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Need help with your payment?</p>
          <a 
            href="mailto:support@boardinghouse.com" 
            className="text-[#061A25] font-semibold hover:underline text-xs sm:text-sm"
          >
            📧 Contact Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;