// /src/components/payment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authcontext';
import Header from './header';
import Footer from './footer';

// Initialize Stripe - Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

// Payment Form Component
const PaymentForm = ({ payment, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      console.log('🔵 Starting payment confirmation...');
      console.log('🔵 Payment ID:', payment.id);
      
      const returnUrl = `${window.location.origin}/payment-success/${payment.id}`;
      console.log('🔵 Return URL:', returnUrl);

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: payment.tenants?.tenant_name || '',
              phone: payment.tenants?.profiles?.phone || '',
            }
          }
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        console.error('❌ Payment confirmation error:', confirmError);
        setError(confirmError.message);
        setProcessing(false);
      } else if (paymentIntent) {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        navigate(`/payment-success/${payment.id}?payment_intent=${paymentIntent.id}&redirect_status=succeeded`);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
          <p className="text-gray-600 mt-2">Complete your rent payment</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-xl font-bold text-black">₱{parseFloat(payment.amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600">Room:</span>
            <span className="font-medium">Room {payment.rooms?.room_number}</span>
          </div>
          {payment.electricity_reading > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Electricity:</span>
              <span className="font-medium">{payment.electricity_reading} kWh (₱{parseFloat(payment.electricity_cost || 0).toLocaleString()})</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-[#061A25] text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-[#0a2433] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay ₱${parseFloat(payment.amount).toLocaleString()}`
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Payment Component
export const Payment = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && id) {
      fetchPaymentAndCreateIntent();
    }
  }, [user, id]);

  const fetchPaymentAndCreateIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Fetching payment:', id, 'for user:', user.id);

      // Fetch payment with tenant and room details
      const { data: paymentData, error: paymentError } = await supabase
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

      if (paymentError) {
        console.error('❌ Payment fetch error:', paymentError);
        throw new Error('Payment not found. Please try again.');
      }

      if (!paymentData) {
        throw new Error('Payment does not exist.');
      }

      // Verify user owns this payment
      if (paymentData.tenants?.profile_id !== user.id) {
        throw new Error('You do not have access to this payment.');
      }

      setPayment(paymentData);
      console.log('✅ Payment found:', paymentData.id);

      // Check if already paid
      if (paymentData.payment_status === 'Paid') {
        console.log('⚠️ Payment already paid, redirecting...');
        navigate('/profile');
        return;
      }

      // Create payment intent
      console.log('🔵 Creating payment intent for amount:', paymentData.amount);
      
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          orderId: paymentData.id,
          userId: user.id
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`Payment setup failed: ${errorText.substring(0, 100)}`);
      }

      const responseData = await res.json();
      console.log('✅ Payment intent created:', responseData);

      if (!responseData.clientSecret) {
        throw new Error('No payment token received');
      }

      setClientSecret(responseData.clientSecret);

    } catch (err) {
      console.error('❌ Payment setup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#061A25] mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up secure payment...</p>
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
        <div className="flex items-center justify-center p-6 py-20">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={fetchPaymentAndCreateIntent}
                className="w-full bg-[#061A25] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#0a2433] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Profile
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Pay your rent securely with Stripe</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            {clientSecret && payment && (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#061A25',
                    }
                  }
                }}
              >
                <PaymentForm payment={payment} clientSecret={clientSecret} />
              </Elements>
            )}
          </div>
          
          {/* Payment Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
              
              {payment && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Room Rent</span>
                      <span>₱{parseFloat(payment.amount).toLocaleString()}</span>
                    </div>
                    {payment.electricity_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Electricity</span>
                        <span>₱{parseFloat(payment.electricity_cost).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-lg">₱{parseFloat(payment.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Details:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Room:</strong> {payment.rooms?.room_number}</p>
                      <p><strong>Tenant:</strong> {payment.tenants?.tenant_name}</p>
                      <p><strong>Due Date:</strong> {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};