import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const usePayments = () => {
  // State Management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('History');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    amount: '',
    due_date: '',
    electricity_reading: '',
    electricity_cost: '',
    payment_status: '',
    notes: '',
  });

  // Initial Data Fetch
  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch Functions
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

  // Payment Actions
  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleEditClick = () => {
    setEditForm({
      amount: selectedPayment.amount,
      due_date: selectedPayment.due_date,
      electricity_reading: selectedPayment.electricity_reading || 0,
      electricity_cost: selectedPayment.electricity_cost || 0,
      payment_status: selectedPayment.payment_status,
      notes: selectedPayment.notes || '',
    });
    setShowEditPayment(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const updateData = {
        amount: parseFloat(editForm.amount),
        due_date: editForm.due_date,
        electricity_reading: parseFloat(editForm.electricity_reading) || 0,
        electricity_cost: parseFloat(editForm.electricity_cost) || 0,
        payment_status: editForm.payment_status,
        notes: editForm.notes,
      };

      // If marking as paid, update payment_date
      if (editForm.payment_status === 'Paid' && selectedPayment.payment_status !== 'Paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', selectedPayment.id);

      if (error) throw error;

      alert('✅ Payment updated successfully!');
      setShowEditPayment(false);
      setShowPaymentDetails(false);
      await fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('❌ Error updating payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!confirm(`⚠️ Delete this payment record?\n\nThis action cannot be undone.`)) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', selectedPayment.id);

      if (error) throw error;

      alert('✅ Payment deleted successfully!');
      setShowPaymentDetails(false);
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('❌ Error deleting payment: ' + error.message);
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

      alert(`✅ Payment marked as ${newStatus}`);
      await fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('❌ Error updating payment status');
    }
  };

  const closeModals = () => {
    setShowPaymentDetails(false);
    setShowEditPayment(false);
    setSelectedPayment(null);
  };

  // Filter Logic with useMemo
  const filteredPayments = useMemo(() => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    switch (filter) {
      case 'History':
        return payments;

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
  }, [payments, filter]);

  // Stats with useMemo
  const stats = useMemo(() => {
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

    return {
      totalPaid,
      totalPending,
      overdueCount,
      totalRecords: payments.length,
    };
  }, [payments]);

  return {
    // State
    payments,
    loading,
    filter,
    selectedPayment,
    showPaymentDetails,
    showEditPayment,
    editForm,
    filteredPayments,
    stats,

    // Setters
    setFilter,
    setEditForm,

    // Actions
    handlePaymentClick,
    handleEditClick,
    handleUpdatePayment,
    handleDeletePayment,
    updatePaymentStatus,
    closeModals,
  };
};