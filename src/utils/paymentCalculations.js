// src/utils/paymentCalculations.js

/**
 * Format currency to Philippine Peso
 */
export const formatCurrency = (amount) => {
  return `₱${parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (date, format = 'long') => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString();
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if payment is overdue
 */
export const isPaymentOverdue = (payment) => {
  if (payment.payment_status !== 'Pending') return false;
  if (!payment.due_date) return false;
  
  const today = new Date();
  const dueDate = new Date(payment.due_date);
  return dueDate < today;
};

/**
 * Calculate overdue days
 */
export const getOverdueDays = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  if (due >= today) return 0;
  
  return Math.floor((today - due) / (1000 * 60 * 60 * 24));
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status) => {
  const colors = {
    'Paid': 'bg-green-100 text-green-700 border-green-200',
    'Pending': 'bg-orange-100 text-orange-700 border-orange-200',
    'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
    'Failed': 'bg-red-100 text-red-700 border-red-200'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Get payment status icon
 */
export const getPaymentStatusIcon = (status) => {
  const icons = {
    'Paid': '✅',
    'Pending': '⏳',
    'Cancelled': '❌',
    'Failed': '⚠️'
  };
  
  return icons[status] || '📄';
};

/**
 * Calculate payment breakdown from room details
 */
export const calculatePaymentBreakdown = (room, hasElectronics = false) => {
  if (!room) return null;
  
  const rentPerHead = room.price_monthly / room.capacity;
  const electricPerHead = (room.base_electric_rate || 0) / room.capacity;
  const electronicsCharge = hasElectronics ? 150 : 0;
  const totalAmount = rentPerHead + electricPerHead + electronicsCharge;
  
  return {
    rentPerHead,
    electricPerHead,
    electronicsCharge,
    totalAmount,
    hasElectronics
  };
};

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method) => {
  const methods = {
    'stripe': 'Credit/Debit Card (Stripe)',
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'gcash': 'GCash',
    'paymaya': 'PayMaya'
  };
  
  return methods[method] || method || 'N/A';
};

/**
 * Calculate payment summary statistics
 */
export const calculatePaymentStats = (payments) => {
  const stats = {
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    totalCount: payments.length
  };
  
  payments.forEach(payment => {
    const amount = parseFloat(payment.amount || 0);
    
    if (payment.payment_status === 'Paid') {
      stats.totalPaid += amount;
      stats.paidCount++;
    } else if (payment.payment_status === 'Pending') {
      stats.totalPending += amount;
      stats.pendingCount++;
      
      if (isPaymentOverdue(payment)) {
        stats.overdueCount++;
      }
    }
    
    stats.totalAmount += amount;
  });
  
  return stats;
};

/**
 * Group payments by month
 */
export const groupPaymentsByMonth = (payments) => {
  const grouped = {};
  
  payments.forEach(payment => {
    const date = new Date(payment.payment_date || payment.created_at);
    const monthKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    
    grouped[monthKey].push(payment);
  });
  
  return grouped;
};

/**
 * Check if payment has extra charges
 */
export const hasExtraCharges = (payment) => {
  return payment.notes?.toLowerCase().includes('electronics') ||
         payment.notes?.toLowerCase().includes('extra') ||
         (payment.electricity_cost && parseFloat(payment.electricity_cost) > 0);
};