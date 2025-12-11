import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import AdvancePaymentModal from './AdvancePaymentModal';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/authcontext';

// Icon Definitions
const Icon = ({ path, className = "w-6 h-6", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const UserIcon = (props) => <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" {...props} />;
const CameraIcon = (props) => <Icon path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" {...props} />;
const CheckCircleIcon = (props) => <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...props} />;

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [payments, setPayments] = useState([]);
    const [showAdvancePayment, setShowAdvancePayment] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchCurrentRoom();
            fetchPayments();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                });
                setProfileImage(data.avatar_url || null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentRoom = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*, rooms(*)')
                .eq('profile_id', user.id)
                .eq('status', 'Active')
                .single();

            if (error && error.code !== 'PGRST116') {
                setCurrentRoom(null);
                return;
            }

            setCurrentRoom(data);
        } catch (error) {
            console.error('Error fetching current room:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const { data: tenantsData } = await supabase
                .from('tenants')
                .select('id')
                .eq('profile_id', user.id);

            if (!tenantsData || tenantsData.length === 0) return;

            const tenantIds = tenantsData.map(t => t.id);
            
            const { data, error } = await supabase
                .from('payments')
                .select('*, rooms(room_number)')
                .in('tenant_id', tenantIds)
                .order('payment_date', { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setUploadMessage({ text: 'Error: File size must be less than 1 MB.', type: 'error' });
            return;
        }

        try {
            setUploadMessage({ text: 'Uploading...', type: 'success' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            if (profileImage) {
                const oldFileName = profileImage.split('/').pop();
                await supabase.storage.from('avatars').remove([`${user.id}/${oldFileName}`]);
            }

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            setProfileImage(publicUrl);
            setUploadMessage({ text: 'Profile image updated successfully!', type: 'success' });
            setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadMessage({ text: 'Error uploading image', type: 'error' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setUploadMessage({ text: 'Profile saved successfully!', type: 'success' });
            setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setUploadMessage({ text: 'Error saving profile', type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelPayment = async (paymentId) => {
        if (!confirm('Are you sure you want to cancel this payment? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('payments')
                .update({ payment_status: 'Cancelled' })
                .eq('id', paymentId);

            if (error) throw error;

            setUploadMessage({ text: 'Payment cancelled successfully!', type: 'success' });
            setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
            
            // Refresh payments
            fetchPayments();
        } catch (error) {
            console.error('Error cancelling payment:', error);
            setUploadMessage({ text: 'Error cancelling payment', type: 'error' });
        }
    };

    const paidPayments = payments.filter(p => p.payment_status === 'Paid');
    const pendingPayments = payments.filter(p => p.payment_status === 'Pending');

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />

            <div className="max-w-5xl mx-auto pb-20 p-4 sm:p-6 lg:py-8">
                {uploadMessage.text && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center ${
                        uploadMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{uploadMessage.text}</span>
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-[#061A25] text-white px-6 py-4">
                        <h2 className="text-xl font-bold">My Profile</h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-inner">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-16 h-16 text-gray-500" />
                                        )}
                                    </div>
                                    <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-black rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg ring-2 ring-white">
                                        <CameraIcon className="w-5 h-5 text-white" />
                                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                                <label htmlFor="image-upload" className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-md">
                                    UPLOAD PHOTO
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Maximum 1 MB</p>
                            </div>
                            
                            <div className="flex-1 w-full">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                                            <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                                        </div>
                                        <div>
                                            <label htmlFor="full_name" className="block text-sm font-medium text-black mb-2">Full Name</label>
                                            <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061A25]" placeholder="Enter your full name" />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">Phone Number</label>
                                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061A25]" placeholder="Enter phone number" />
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-black mb-2">Address</label>
                                            <textarea id="address" name="address" rows="2" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061A25]" placeholder="Enter your address" />
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <button type="submit" className="w-full sm:w-auto bg-black text-white px-8 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md">
                                            Save Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Room Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-6">
                    <div className="bg-[#061A25] text-white px-6 py-4">
                        <h2 className="text-xl font-bold">My Room</h2>
                    </div>

                    <div className="p-6">
                        {currentRoom ? (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Room Number</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            Room {currentRoom.rooms?.room_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Monthly Rent</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                            ₱{currentRoom.rooms?.price_monthly.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Start Date</p>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {new Date(currentRoom.rent_start).toLocaleDateString('en-US', { 
                                                month: 'long', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Due Date</p>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {new Date(currentRoom.rent_due).toLocaleDateString('en-US', { 
                                                month: 'long', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {currentRoom.rooms?.description && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 font-medium">Room Details</p>
                                        <p className="text-sm text-gray-700 mt-1">{currentRoom.rooms.description}</p>
                                    </div>
                                )}

                                {/* Payment Actions */}
                                {(() => {
                                    const myPendingPayment = payments.find(p => p.payment_status === 'Pending');
                                    const hasPaidPayment = payments.some(p => p.payment_status === 'Paid');
                                    
                                    return (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            {myPendingPayment ? (
                                                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-orange-800">Pending Payment</p>
                                                            <p className="text-2xl font-bold text-orange-600 mt-1">
                                                                ₱{parseFloat(myPendingPayment.amount).toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-orange-700 mt-1">
                                                                Due: {new Date(myPendingPayment.due_date).toLocaleDateString('en-US', { 
                                                                    month: 'long', 
                                                                    day: 'numeric', 
                                                                    year: 'numeric' 
                                                                })}
                                                            </p>
                                                        </div>
                                                        <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
                                                            UNPAID
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => navigate(`/payment/${myPendingPayment.id}`)}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-md"
                                                        >
                                                            💳 Pay Now
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelPayment(myPendingPayment.id)}
                                                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-md"
                                                        >
                                                            ✖ Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : hasPaidPayment ? (
                                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-green-800">✅ All Payments Up to Date</p>
                                                            <p className="text-xs text-green-700 mt-1">
                                                                Current due: {currentRoom.rent_due ? new Date(currentRoom.rent_due).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                }) : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowAdvancePayment(true)}
                                                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                                    >
                                                        💰 Make Advance Payment
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                                                    <p className="text-sm text-gray-600 text-center">
                                                        No pending payments. Payment will be created by landlord.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>You are not currently assigned to any room.</p>
                                <p className="text-sm mt-2">Please contact the landlord for room assignment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-6">
                    <div className="bg-[#061A25] text-white px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Payment History</h2>
                        <div className="text-sm">
                            {pendingPayments.length > 0 && (
                                <span className="bg-orange-500 px-3 py-1 rounded-full">
                                    {pendingPayments.length} Pending
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {payments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No payment records yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    }) : 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">Room {payment.rooms?.room_number}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                payment.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                payment.payment_status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                payment.payment_status === 'Cancelled' ? 'bg-gray-100 text-gray-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {payment.payment_status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                            <div>
                                                <p className="text-gray-600">Amount:</p>
                                                <p className="font-semibold text-green-600">₱{parseFloat(payment.amount || 0).toLocaleString()}</p>
                                            </div>
                                            {payment.due_date && (
                                                <div>
                                                    <p className="text-gray-600">Due Date:</p>
                                                    <p className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {payment.electricity_reading > 0 && (
                                                <div>
                                                    <p className="text-gray-600">Electricity:</p>
                                                    <p className="font-medium">{payment.electricity_reading} kWh</p>
                                                </div>
                                            )}
                                            {payment.reference_no && (
                                                <div className="col-span-2">
                                                    <p className="text-gray-600">Reference:</p>
                                                    <p className="font-mono text-xs">{payment.reference_no}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Advance Payment Modal */}
            <AdvancePaymentModal
                isOpen={showAdvancePayment}
                onClose={() => setShowAdvancePayment(false)}
                currentRoom={currentRoom}
                onSuccess={async () => {
                    await Promise.all([fetchCurrentRoom(), fetchPayments()]);
                    setUploadMessage({ text: '✅ Advance payment created!', type: 'success' });
                    setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
                }}
            />

            <Footer />
        </div>
    );
};

export default Profile;