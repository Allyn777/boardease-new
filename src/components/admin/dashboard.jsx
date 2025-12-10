import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    totalTenants: 0,
    activeTenants: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
    upcomingPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch rooms data
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('status');

      if (roomsError) throw roomsError;

      // Fetch tenants data
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('status');

      if (tenantsError) throw tenantsError;

      // Fetch payments data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_status, payment_date, due_date');

      if (paymentsError) throw paymentsError;

      // Calculate room stats
      const totalRooms = roomsData?.length || 0;
      const availableRooms = roomsData?.filter(r => r.status === 'Available').length || 0;
      const occupiedRooms = roomsData?.filter(r => r.status === 'Occupied').length || 0;
      const maintenanceRooms = roomsData?.filter(r => r.status === 'Maintenance').length || 0;

      // Calculate tenant stats
      const totalTenants = tenantsData?.length || 0;
      const activeTenants = tenantsData?.filter(t => t.status === 'Active').length || 0;

      // Calculate revenue
      const totalRevenue = paymentsData
        ?.filter(p => p.payment_status === 'Paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = paymentsData
        ?.filter(p => {
          const paymentDate = new Date(p.payment_date);
          return p.payment_status === 'Paid' && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

      // Calculate overdue and upcoming payments
      const today = new Date();
      const overduePayments = paymentsData?.filter(p => {
        if (p.payment_status !== 'Pending' || !p.due_date) return false;
        return new Date(p.due_date) < today;
      }).length || 0;

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const upcomingPayments = paymentsData?.filter(p => {
        if (p.payment_status !== 'Pending' || !p.due_date) return false;
        const dueDate = new Date(p.due_date);
        return dueDate >= today && dueDate <= sevenDaysFromNow;
      }).length || 0;

      // Fetch recent activity
      await fetchRecentActivity();

      setStats({
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        totalTenants,
        activeTenants,
        totalRevenue,
        monthlyRevenue,
        overduePayments,
        upcomingPayments,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities = [];

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('*, rooms(room_number), tenants(tenant_name)')
        .eq('payment_status', 'Paid')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentPayments) {
        recentPayments.forEach(payment => {
          activities.push({
            id: `payment-${payment.id}`,
            title: `${payment.tenants?.tenant_name || 'Someone'} paid for Room ${payment.rooms?.room_number}`,
            time: getTimeAgo(payment.created_at),
            type: 'payment'
          });
        });
      }

      // Get recent tenants
      const { data: recentTenants } = await supabase
        .from('tenants')
        .select('*, rooms(room_number)')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentTenants) {
        recentTenants.forEach(tenant => {
          activities.push({
            id: `tenant-${tenant.id}`,
            title: `New tenant: ${tenant.tenant_name} - Room ${tenant.rooms?.room_number}`,
            time: getTimeAgo(tenant.created_at),
            type: 'tenant'
          });
        });
      }

      // Sort by time and limit to 5
      activities.sort((a, b) => a.time.localeCompare(b.time));
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const occupancyPercentage = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;
  
  const vacantPercentage = stats.totalRooms > 0 
    ? Math.round((stats.availableRooms / stats.totalRooms) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {/* TOP SUMMARY SECTION */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-500">Overview</p>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>

          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Rooms */}
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-gray-200 bg-white text-center shadow-inner">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs uppercase tracking-widest text-gray-500">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-green-200 bg-white text-center shadow-inner">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs uppercase tracking-widest text-gray-500">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats.availableRooms}</p>
              </div>
            </div>
          </div>

          {/* Occupied */}
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-red-200 bg-white text-center shadow-inner">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs uppercase tracking-widest text-gray-500">Occupied</p>
                <p className="text-3xl font-bold text-red-600">{stats.occupiedRooms}</p>
              </div>
            </div>
          </div>

          {/* Active Tenants */}
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-blue-200 bg-white text-center shadow-inner">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs uppercase tracking-widest text-gray-500">Tenants</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeTenants}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION */}
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr] mt-6">
        {/* LEFT COLUMN */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500">Quick Actions</p>
              <h3 className="text-xl font-semibold text-gray-900">Manage Operations</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button 
              onClick={() => navigate('/admin/rooms')}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left hover:border-black hover:bg-white transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">Manage Rooms</p>
              <p className="text-xs text-gray-500 mt-1">{stats.availableRooms} rooms available</p>
            </button>

            <button 
              onClick={() => navigate('/admin/tenants')}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left hover:border-black hover:bg-white transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">Manage Tenants</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeTenants} active tenants</p>
            </button>

            <button 
              onClick={() => navigate('/admin/payments')}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left hover:border-black hover:bg-white transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">View Payments</p>
              <p className="text-xs text-gray-500 mt-1">{stats.overduePayments} overdue</p>
            </button>
          </div>

          {/* Occupancy */}
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-500">Occupancy Snapshot</p>
                <h4 className="text-lg font-semibold">Room Status</h4>
              </div>
              <span className="text-sm font-semibold text-gray-700">{occupancyPercentage}% Occupied</span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700">
                  <span>Occupied</span>
                  <span>{occupancyPercentage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${occupancyPercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700">
                  <span>Available</span>
                  <span>{vacantPercentage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${vacantPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>

          <div className="mt-6 space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-[#051A2C] p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-widest text-white/70">Revenue</p>
            <p className="mt-2 text-2xl font-semibold">₱{stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-white/70">This month</p>
            <p className="text-xs text-white/60 mt-2">Total: ₱{stats.totalRevenue.toLocaleString()}</p>
            
            {stats.overduePayments > 0 && (
              <div className="mt-4 bg-red-500/20 border border-red-400 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-200">⚠️ {stats.overduePayments} Overdue Payment{stats.overduePayments > 1 ? 's' : ''}</p>
              </div>
            )}
            
            {stats.upcomingPayments > 0 && (
              <div className="mt-2 bg-yellow-500/20 border border-yellow-400 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-200">📅 {stats.upcomingPayments} Upcoming Payment{stats.upcomingPayments > 1 ? 's' : ''}</p>
              </div>
            )}

            <button 
              onClick={() => navigate('/admin/payments')}
              className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#051A2C] shadow hover:bg-gray-100 transition-colors w-full"
            >
              View All Payments
            </button>
          </div>
        </div>
      </section>
    </>
  );
}