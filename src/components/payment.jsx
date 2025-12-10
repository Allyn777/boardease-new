// payment.jsx - Connected to Profile Bookings
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authcontext';
import Header from './header';
import Footer from './footer';

const stripePromise = loadStripe('pk_test_51SWqewRomjPRW2fxOGnbEUiKmeSj82OqH1vqMrvpNxDfGAVYvJm4uaABWPj0TBdX2lYMEfLHajV2UJ9HslWft9cd00UILNvo6b');

// PAYMENT FORM COMPONENT
const PaymentForm = ({ userInfo, bookingData, onShowConfirmation, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Ready to process payment');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait.');
      return;
    }

    setProcessing(true);
    setError(null);
    setDebugInfo('Step 1: Creating payment method...');

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phoneNumber,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setDebugInfo('❌ Failed at creating payment method');
        setProcessing(false);
        return;
      }

      setDebugInfo('Step 2: Contacting payment server...');

      const requestData = {
        paymentMethodId: paymentMethod.id,
        amount: bookingData?.amount || 5000,
        currency: 'php',
        customerInfo: {
          name: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phoneNumber,
        },
        bookingInfo: bookingData,
      };

      // ✅ CHANGED: Use Vercel serverless function instead of localhost
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || 'Server error';
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        
        setError(errorMessage);
        setDebugInfo(`❌ Server error: ${errorMessage}`);
        setProcessing(false);
        return;
      }

      setDebugInfo('Step 3: Processing response...');
      const paymentResult = await response.json();

      if (paymentResult.error) {
        setError(paymentResult.error);
        setDebugInfo('❌ Payment failed: ' + paymentResult.error);
        setProcessing(false);
        return;
      }

      if (paymentResult.requiresAction) {
        setDebugInfo('Step 4: Completing 3D Secure authentication...');
        
        const { error: confirmError } = await stripe.confirmCardPayment(
          paymentResult.clientSecret
        );

        if (confirmError) {
          setError(confirmError.message);
          setDebugInfo('❌ 3D Secure failed');
          setProcessing(false);
          return;
        }
      }

      setDebugInfo('✅ Payment successful!');
      onShowConfirmation(paymentResult.paymentIntentId, paymentResult);
      
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setDebugInfo(`❌ Error: ${errorMessage}`);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={`p-4 rounded-lg border-2 ${
        debugInfo.includes('✅') ? 'bg-green-100 border-green-400 text-green-800' :
        debugInfo.includes('❌') ? 'bg-red-100 border-red-400 text-red-800' :
        'bg-blue-100 border-blue-400 text-blue-800'
      }`}>
        <p className="font-semibold text-sm">Status:</p>
        <p className="text-sm">{debugInfo}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-semibold mb-3">Payment Method</h3>
          <div className="p-4 rounded-lg border-2 border-white bg-white/10">
            <p className="text-white font-semibold mb-3">Credit / Debit Card</p>
            <div className="flex gap-3 items-center">
              <div className="bg-white rounded p-2">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[8px]">VISA</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="w-12 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-[8px]">MC</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <label className="block text-gray-700 font-semibold mb-2">Card Details</label>
          <CardElement options={cardElementOptions} />
          <p className="text-xs text-gray-500 mt-2">Test card: 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white font-semibold mb-2">Full name</label>
          <input type="text" value={userInfo.fullName} readOnly className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg" />
        </div>
        <div>
          <label className="block text-white font-semibold mb-2">Email</label>
          <input type="email" value={userInfo.email} readOnly className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg" />
        </div>
        <div>
          <label className="block text-white font-semibold mb-2">Phone Number</label>
          <input type="tel" value={userInfo.phoneNumber} readOnly className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg" />
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <h4 className="text-white font-semibold mb-2">Booking Details</h4>
        <div className="text-white/80 text-sm space-y-1">
          <p>Room: {bookingData?.roomNumber || 'N/A'}</p>
          <p>Term: {bookingData?.rentalTerm || 'N/A'}</p>
          <p className="text-lg font-bold text-white mt-2">
            Amount: ₱{((bookingData?.amount || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Payment Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full bg-white text-[#061A25] font-semibold py-4 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing Payment...' : `Pay ₱${((bookingData?.amount || 0) / 100).toFixed(2)}`}
      </button>
    </form>
  );
};

const PaymentSuccessful = ({ onTrackBooking }) => (
  <div className="text-center text-white space-y-6">
    <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 className="text-4xl font-bold text-green-400">PAYMENT SUCCESSFUL</h1>
    <p className="text-gray-300">Your booking has been confirmed!</p>
    <button
      onClick={onTrackBooking}
      className="bg-white text-[#061A25] font-semibold py-3 px-8 rounded-lg hover:bg-gray-100"
    >
      View My Bookings
    </button>
  </div>
);

const BookingConfirmation = ({ onConfirmPayment, confirming }) => (
  <div className="text-center text-white space-y-6">
    <h1 className="text-4xl font-bold text-blue-400">BOOKING CONFIRMATION</h1>
    <p className="text-gray-300">Click below to confirm your payment</p>
    <button
      onClick={onConfirmPayment}
      disabled={confirming}
      className="bg-white text-[#061A25] font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 disabled:opacity-50"
    >
      {confirming ? 'Confirming...' : 'Confirm Payment'}
    </button>
  </div>
);
function Payment() {

  const navigate = useNavigate();
  const { id } = useParams(); // booking ID from URL
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchBookingData();
    }
  }, [user, id]);

  const fetchBookingData = async () => {
    try {
      // Fetch booking request
      const { data: bookingData, error: bookingError } = await supabase
        .from('booking_requests')
        .select('*, rooms(*)')
        .eq('id', id)
        .eq('requestor', user.id)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Fetch tenant record if exists
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('profile_id', user.id)
        .eq('room_id', bookingData.room_id)
        .eq('status', 'Active')
        .single();

      setTenant(tenantData);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserInfo({
        fullName: profileData?.full_name || 'N/A',
        email: user.email,
        phoneNumber: profileData?.phone || 'N/A',
      });

      setBookingData({
        id: bookingData.id,
        roomId: bookingData.room_id,
        roomNumber: bookingData.rooms?.room_number,
        rentalTerm: bookingData.rooms?.rental_term,
        amount: bookingData.rooms?.price_monthly * 100, // Convert to cents
        tenantId: tenantData?.id || null
      });

    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Error loading booking data');
      navigate('/profile#my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleShowConfirmation = (id, result) => {
    setPaymentId(id);
    setShowConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    setConfirming(true);
    
    try {
      // Save payment to database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          tenant_id: tenant?.id || null,
          room_id: bookingData.roomId,
          recorded_by: user.id,
          payment_date: new Date().toISOString().split('T')[0],
          amount: bookingData.amount / 100,
          payment_status: 'Paid',
          reference_no: paymentId,
          stripe_payment_intent_id: paymentId,
          payment_method: 'stripe',
          currency: 'php',
          notes: `Stripe Payment for Room ${bookingData.roomNumber}`
        }]);

      if (paymentError) throw paymentError;

      // Send notification to user
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          from_user: 'System',
          message: `Your payment for Room ${bookingData.roomNumber} has been received. Amount: ₱${(bookingData.amount / 100).toLocaleString()}`,
          type: 'payment',
          is_read: false
        }]);

      setShowConfirmation(false);
      setPaymentSuccess(true);
      
    } catch (err) {
      console.error('Confirmation error:', err);
      alert('Error saving payment. Please contact support.');
    } finally {
      setConfirming(false);
    }
  };

  const handleTrackBooking = () => {
    navigate('/profile#my-bookings');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading payment details...</div>
      </div>
    );
  }

  if (!booking || !userInfo || !bookingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-[#061A25] rounded-2xl shadow-xl p-8 border border-white/10">
            {paymentSuccess ? (
              <PaymentSuccessful onTrackBooking={handleTrackBooking} />
            ) : showConfirmation ? (
              <BookingConfirmation 
                onConfirmPayment={handleConfirmPayment}
                confirming={confirming}
              />
            ) : (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  userInfo={userInfo}
                  bookingData={bookingData}
                  onShowConfirmation={handleShowConfirmation}
                  onError={handlePaymentError}
                />
              </Elements>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
export { Payment };

//test payment