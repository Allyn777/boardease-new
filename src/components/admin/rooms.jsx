import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authcontext";
import { supabase } from "../../lib/supabaseClient";

const ManagementTable = ({
  columns,
  rows,
  renderRow,
  emptyLabel,
}) => (
  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
    {/* Desktop Table Header */}
    <div className="hidden md:grid md:grid-cols-7 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
      {columns.map((column) => (
        <span key={column}>{column}</span>
      ))}
    </div>

    {rows.length === 0 ? (
      <div className="h-72 bg-gray-50 flex items-center justify-center text-gray-500 text-sm px-4 text-center" aria-label={emptyLabel}>
        {emptyLabel}
      </div>
    ) : (
      rows.map(renderRow)
    )}
  </div>
);

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);

  const { user } = useAuth();

  const [roomForm, setRoomForm] = useState({
    room_number: "",
    bed_type: "Single Bed",
    capacity: "",
    price_monthly: "",
    base_electric_rate: "",
  });

  // Calculate price per head automatically
  const pricePerHead = roomForm.capacity && roomForm.price_monthly 
    ? (parseFloat(roomForm.price_monthly) / parseInt(roomForm.capacity)).toFixed(2)
    : 0;

  const electricPerHead = roomForm.capacity && roomForm.base_electric_rate
    ? (parseFloat(roomForm.base_electric_rate) / parseInt(roomForm.capacity)).toFixed(2)
    : 0;

  useEffect(() => {
    fetchRooms();
  }, []);

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

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!roomForm.room_number || !roomForm.capacity || !roomForm.price_monthly || !roomForm.base_electric_rate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
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
        ])
        .select();

      if (error) throw error;

      alert("Room created successfully!");

      setRoomForm({
        room_number: "",
        bed_type: "Single Bed",
        capacity: "",
        price_monthly: "",
        base_electric_rate: "",
      });

      setShowAddRoom(false);
      fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;

      alert("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "Available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;

  return (
    <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr,0.7fr]">
      {/* LEFT SIDE */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">Admin Room Management</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Room Management</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Total: {totalRooms} | Available: {availableRooms} | Occupied: {occupiedRooms}
            </p>
          </div>

          <button
            onClick={() => setShowAddRoom(true)}
            className="rounded-md bg-black px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-gray-900 w-full sm:w-auto"
            disabled={loading}
          >
            Add New Room
          </button>
        </div>

        {loading && !showAddRoom ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-sm">Loading rooms...</div>
          </div>
        ) : (
          <ManagementTable
            columns={["Room No.", "Bed Type", "Capacity", "Rent/Month", "Electric/Month", "Price/Head", "Status"]}
            rows={rooms}
            emptyLabel="No rooms added yet. Click 'Add New Room' to get started!"
            renderRow={(room) => {
              const rentPerHead = room.capacity > 0 ? (room.price_monthly / room.capacity).toFixed(2) : 0;
              const electricPerHead = room.capacity > 0 ? ((room.base_electric_rate || 0) / room.capacity).toFixed(2) : 0;
              
              return (
                <div key={room.id}>
                  {/* Mobile Card View */}
                  <div className="md:hidden border-t border-gray-100 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">Room {room.room_number}</p>
                        <p className="text-sm text-gray-600">{room.bed_type}</p>
                        <p className="text-sm text-gray-600">Capacity: {room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</p>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          room.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : room.status === "Occupied"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <p className="font-semibold text-green-600">₱{room.price_monthly.toLocaleString()}/mo</p>
                    <p className="text-sm text-yellow-600">⚡ ₱{room.base_electric_rate?.toLocaleString() || 0}/mo</p>
                    <div className="bg-blue-50 rounded p-2 mt-2">
                      <p className="text-xs text-blue-600 font-semibold">Per Person:</p>
                      <p className="text-sm text-blue-700">Rent: ₱{rentPerHead} • Electric: ₱{electricPerHead}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Desktop Table Row */}
                  <div className="hidden md:grid md:grid-cols-7 px-4 py-3 text-sm text-gray-800 border-t border-gray-100">
                    <span className="font-semibold">Room {room.room_number}</span>
                    <span>{room.bed_type}</span>
                    <span>{room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</span>
                    <span className="font-semibold text-green-600">₱{room.price_monthly.toLocaleString()}</span>
                    <span className="font-semibold text-yellow-600">₱{room.base_electric_rate?.toLocaleString() || 0}</span>
                    <div>
                      <p className="text-xs text-gray-500">Rent: ₱{rentPerHead}</p>
                      <p className="text-xs text-gray-500">⚡: ₱{electricPerHead}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold w-fit ${
                          room.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : room.status === "Occupied"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {room.status}
                      </span>

                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-800 ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* RIGHT SIDE - ADD FORM */}
      {showAddRoom && (
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 lg:sticky lg:top-8 h-fit">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Room</h3>
            <button
              onClick={() => setShowAddRoom(false)}
              className="text-sm font-semibold text-gray-500 hover:text-black"
              disabled={loading}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleCreateRoom} className="mt-4 sm:mt-6 space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Room No. *</label>
              <input
                type="text"
                required
                value={roomForm.room_number}
                onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., 101, 102, 201"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Bed Type *</label>
              <select
                required
                value={roomForm.bed_type}
                onChange={(e) => setRoomForm({ ...roomForm, bed_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="Bunk Bed">Bunk Bed</option>
                <option value="Queen Bed">Queen Bed</option>
                <option value="King Bed">King Bed</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Capacity (Number of People) *</label>
              <input
                type="number"
                required
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., 1, 2, 4"
                min="1"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Price per Month (PHP) *</label>
              <input
                type="number"
                required
                value={roomForm.price_monthly}
                onChange={(e) => setRoomForm({ ...roomForm, price_monthly: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., 3000"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Base Electric Rate (PHP/Month) *</label>
              <input
                type="number"
                required
                value={roomForm.base_electric_rate}
                onChange={(e) => setRoomForm({ ...roomForm, base_electric_rate: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., 500"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Fixed monthly electric cost for this room</p>
            </div>

            {/* Auto-calculated Price Per Head Display */}
            {roomForm.capacity && roomForm.price_monthly && roomForm.base_electric_rate && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <label className="text-xs sm:text-sm font-semibold text-blue-700 mb-2 block">💰 Cost per Person</label>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">Rent per head:</span>
                    <span className="font-bold text-blue-700">₱{parseFloat(pricePerHead).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">⚡ Electric per head:</span>
                    <span className="font-bold text-yellow-700">₱{parseFloat(electricPerHead).toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-blue-300 pt-2 flex justify-between">
                    <span className="font-bold text-blue-800">Total per person:</span>
                    <span className="font-bold text-blue-800 text-lg">₱{(parseFloat(pricePerHead) + parseFloat(electricPerHead)).toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-blue-600 mt-2">
                  💡 Each tenant will pay ₱{(parseFloat(pricePerHead) + parseFloat(electricPerHead)).toFixed(2)}/month (excluding rice cooker if applicable)
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRoom(false)}
                className="text-sm font-semibold text-gray-500 hover:text-black order-2 sm:order-1"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-[#051A2C] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#031121] disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}