import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/authcontext';

export const useRooms = () => {
  const { user } = useAuth();
  
  // State Management
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState(false);

  // Form States
  const [roomForm, setRoomForm] = useState({
    room_number: "",
    bed_type: "Single Bed",
    capacity: "",
    price_monthly: "",
    base_electric_rate: "",
  });

  const [editForm, setEditForm] = useState({
    room_number: "",
    bed_type: "",
    capacity: "",
    price_monthly: "",
    base_electric_rate: "",
  });

  // Initial Data Fetch
  useEffect(() => {
    fetchRooms();
    fetchTenants();
  }, []);

  // Fetch Functions
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("Error loading rooms: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*, profiles(full_name, phone), rooms(room_number)")
        .eq("status", "Active");

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  // Room Actions
  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!roomForm.room_number || !roomForm.capacity || !roomForm.price_monthly || !roomForm.base_electric_rate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const pricePerHead = parseFloat(roomForm.price_monthly) / parseInt(roomForm.capacity);

      const { error } = await supabase
        .from("rooms")
        .insert([
          {
            room_number: roomForm.room_number,
            bed_type: roomForm.bed_type,
            capacity: parseInt(roomForm.capacity),
            price_monthly: parseFloat(roomForm.price_monthly),
            price_per_head: parseFloat(pricePerHead),
            base_electric_rate: parseFloat(roomForm.base_electric_rate),
            status: "Available",
            created_by: user?.id,
          },
        ]);

      if (error) throw error;

      alert("✅ Room created successfully!");

      setRoomForm({
        room_number: "",
        bed_type: "Single Bed",
        capacity: "",
        price_monthly: "",
        base_electric_rate: "",
      });

      setShowAddRoom(false);
      await fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("❌ Error creating room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleEditClick = () => {
    setEditForm({
      room_number: selectedRoom.room_number,
      bed_type: selectedRoom.bed_type,
      capacity: selectedRoom.capacity,
      price_monthly: selectedRoom.price_monthly,
      base_electric_rate: selectedRoom.base_electric_rate || 0,
    });
    setShowEditRoom(true);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const pricePerHead = parseFloat(editForm.price_monthly) / parseInt(editForm.capacity);

      // Check if capacity is being reduced and if it would exceed current occupancy
      const currentOccupancy = getOccupancy(selectedRoom.id);
      if (parseInt(editForm.capacity) < currentOccupancy) {
        alert(`❌ Cannot reduce capacity to ${editForm.capacity}\n\nCurrent occupancy: ${currentOccupancy} tenants\nPlease remove tenants first.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("rooms")
        .update({
          room_number: editForm.room_number,
          bed_type: editForm.bed_type,
          capacity: parseInt(editForm.capacity),
          price_monthly: parseFloat(editForm.price_monthly),
          price_per_head: parseFloat(pricePerHead),
          base_electric_rate: parseFloat(editForm.base_electric_rate),
        })
        .eq("id", selectedRoom.id);

      if (error) throw error;

      alert("✅ Room updated successfully!");
      setShowEditRoom(false);
      setShowRoomDetails(false);
      await fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
      alert("❌ Error updating room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    const roomTenants = tenants.filter(t => t.room_id === selectedRoom.id);
    
    if (roomTenants.length > 0) {
      alert(`❌ Cannot delete Room ${selectedRoom.room_number}\n\nThis room has ${roomTenants.length} active tenant(s).\nPlease remove all tenants before deleting the room.`);
      return;
    }

    if (!confirm(`⚠️ Delete Room ${selectedRoom.room_number}?\n\nThis action cannot be undone.`)) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("rooms").delete().eq("id", selectedRoom.id);

      if (error) throw error;

      alert("✅ Room deleted successfully!");
      setShowRoomDetails(false);
      await fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("❌ Error deleting room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (tenantId, tenantName) => {
    if (!confirm(`⚠️ Remove ${tenantName} from this room?\n\nThis will set their status to Inactive.`)) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("tenants")
        .update({ status: "Inactive" })
        .eq("id", tenantId);

      if (error) throw error;

      alert("✅ Tenant removed successfully!");
      await Promise.all([fetchTenants(), fetchRooms()]);
      
      // Refresh room details if modal is open
      if (showRoomDetails && selectedRoom) {
        const { data } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", selectedRoom.id)
          .single();
        if (data) setSelectedRoom(data);
      }
    } catch (error) {
      console.error("Error removing tenant:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowRoomDetails(false);
    setShowEditRoom(false);
    setSelectedRoom(null);
  };

  // Helper Functions
  const getOccupancy = (roomId) => {
    return tenants.filter(t => t.room_id === roomId).length;
  };

  const getRoomTenants = (roomId) => {
    return tenants.filter(t => t.room_id === roomId);
  };

  const calculatePricePerHead = (price, capacity) => {
    return capacity && price ? (parseFloat(price) / parseInt(capacity)).toFixed(2) : 0;
  };

  // Stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "Available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;

  // Calculated values for forms
  const pricePerHead = calculatePricePerHead(roomForm.price_monthly, roomForm.capacity);
  const electricPerHead = calculatePricePerHead(roomForm.base_electric_rate, roomForm.capacity);
  const editPricePerHead = calculatePricePerHead(editForm.price_monthly, editForm.capacity);
  const editElectricPerHead = calculatePricePerHead(editForm.base_electric_rate, editForm.capacity);

  return {
    // State
    rooms,
    tenants,
    loading,
    showAddRoom,
    selectedRoom,
    showRoomDetails,
    showEditRoom,
    roomForm,
    editForm,
    
    // Setters
    setShowAddRoom,
    setRoomForm,
    setEditForm,
    
    // Actions
    handleCreateRoom,
    handleRoomClick,
    handleEditClick,
    handleUpdateRoom,
    handleDeleteRoom,
    handleRemoveTenant,
    closeModals,
    
    // Helpers
    getOccupancy,
    getRoomTenants,
    
    // Stats
    totalRooms,
    availableRooms,
    occupiedRooms,
    
    // Calculated
    pricePerHead,
    electricPerHead,
    editPricePerHead,
    editElectricPerHead,
  };
};