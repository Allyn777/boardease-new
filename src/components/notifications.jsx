import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authcontext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      alert('All notifications marked as read!');
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Error marking notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      alert('Notification deleted!');
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#061A25] text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-white/80 mt-1">{unreadCount} unread</p>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white text-[#061A25] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading notifications...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg p-4 sm:p-6 border-l-4 hover:shadow-md transition-shadow ${
                      notification.is_read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-[#061A25]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-gray-900">From:</span>
                          <span className="text-sm text-gray-700">{notification.from_user}</span>
                          {!notification.is_read && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-semibold text-gray-900">Date:</span>
                          <span className="text-sm text-gray-700">
                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">Message:</span>
                          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          notification.type === 'payment' ? 'bg-green-100 text-green-800' :
                          notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;