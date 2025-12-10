import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authcontext";
import { supabase, uploadRoomImages, deleteRoomImage } from "../../lib/supabaseClient";

const ManagementTable = ({
  columns,
  rows,
  renderRow,
  emptyLabel,
}) => (
  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
    {/* Desktop Table Header */}
    <div className="hidden md:grid md:grid-cols-6 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
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
  const [uploadingImages, setUploadingImages] = useState(false);

  const { user } = useAuth();

  const [roomForm, setRoomForm] = useState({
    room_number: "",
    bed_type: "Single Bed",
    capacity: "",
    price_monthly: "",
    price_per_head: "",
    description: "",
    status: "Available",
  });

  const [selectedImages, setSelectedImages] = useState([]);

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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setSelectedImages(files);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!roomForm.room_number || !roomForm.capacity || !roomForm.price_monthly) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setUploadingImages(true);

      let imageUrls = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadRoomImages(selectedImages, roomForm.room_number);
      }

      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            room_number: roomForm.room_number,
            bed_type: roomForm.bed_type,
            capacity: parseInt(roomForm.capacity),
            price_monthly: parseFloat(roomForm.price_monthly),
            price_per_head: parseFloat(roomForm.price_per_head) || 0,
            description: roomForm.description,
            status: roomForm.status,
            image_urls: JSON.stringify(imageUrls),
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
        price_per_head: "",
        description: "",
        status: "Available",
      });

      setSelectedImages([]);
      setShowAddRoom(false);

      fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room: " + error.message);
    } finally {
      setUploadingImages(false);
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, imageUrls) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      setLoading(true);

      if (imageUrls) {
        const urls = JSON.parse(imageUrls);
        await Promise.all(urls.map((url) => deleteRoomImage(url)));
      }

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
            columns={["Room No.", "Bed Type", "Capacity", "Price/Month", "Price/Head", "Status"]}
            rows={rooms}
            emptyLabel="No rooms added yet. Click 'Add New Room' to get started!"
            renderRow={(room) => (
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
                  {room.price_per_head > 0 && (
                    <p className="text-sm text-blue-600">₱{room.price_per_head.toLocaleString()}/head</p>
                  )}
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.image_urls)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>

                {/* Desktop Table Row */}
                <div className="hidden md:grid md:grid-cols-6 px-4 py-3 text-sm text-gray-800 border-t border-gray-100">
                  <span className="font-semibold">Room {room.room_number}</span>
                  <span>{room.bed_type}</span>
                  <span>{room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</span>
                  <span className="font-semibold text-green-600">₱{room.price_monthly.toLocaleString()}</span>
                  <span className={room.price_per_head > 0 ? "font-semibold text-blue-600" : "text-gray-400"}>
                    {room.price_per_head > 0 ? `₱${room.price_per_head.toLocaleString()}` : 'N/A'}
                  </span>

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
                      onClick={() => handleDeleteRoom(room.id, room.image_urls)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800 ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Price per Head (PHP) - Optional</label>
              <input
                type="number"
                value={roomForm.price_per_head}
                onChange={(e) => setRoomForm({ ...roomForm, price_per_head: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., 1500 (for bed spacers)"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">For bed spacers or shared room pricing</p>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Status</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Images (Max 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {selectedImages.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedImages.length} image(s) selected
                </p>
              )}
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Description</label>
              <textarea
                rows={4}
                value={roomForm.description}
                onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Add room description, amenities, etc."
              />
            </div>

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
                disabled={loading || uploadingImages}
                className="w-full sm:w-auto rounded-md bg-[#051A2C] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#031121] disabled:opacity-50 order-1 sm:order-2"
              >
                {uploadingImages ? "Uploading..." : loading ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}