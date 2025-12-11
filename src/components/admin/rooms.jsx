import React from "react";
import { useRooms } from "./useRooms";
import RoomDetailsModal from "./RoomDetailsModal";
import EditRoomModal from "./EditRoomModal";
import AddRoomForm from "./AddRoomForm";

const ManagementTable = ({ columns, rows, renderRow, emptyLabel }) => (
  <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
    {/* Desktop Table Header */}
    <div className="hidden md:grid md:grid-cols-8 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
      {columns.map((column) => (
        <span key={column}>{column}</span>
      ))}
    </div>

    {rows.length === 0 ? (
      <div className="h-72 bg-gray-50 flex items-center justify-center text-gray-500 text-sm px-4 text-center">
        {emptyLabel}
      </div>
    ) : (
      rows.map(renderRow)
    )}
  </div>
);

export default function Rooms() {
  const {
    rooms,
    loading,
    showAddRoom,
    setShowAddRoom,
    selectedRoom,
    showRoomDetails,
    showEditRoom,
    handleRoomClick,
    handleEditClick,
    handleUpdateRoom,
    handleDeleteRoom,
    handleRemoveTenant,
    closeModals,
    getOccupancy,
    getRoomTenants,
    totalRooms,
    availableRooms,
    occupiedRooms,
    roomForm,
    setRoomForm,
    handleCreateRoom,
    pricePerHead,
    electricPerHead,
    editForm,
    setEditForm,
    editPricePerHead,
    editElectricPerHead,
  } = useRooms();

  return (
    <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr,0.7fr]">
      {/* LEFT SIDE - ROOMS TABLE */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500">
              Admin Room Management
            </p>
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
            columns={["Room", "Bed Type", "Capacity", "Rent/Mo", "Electric/Mo", "Per Head", "Occupancy", "Actions"]}
            rows={rooms}
            emptyLabel="No rooms added yet. Click 'Add New Room' to get started!"
            renderRow={(room) => {
              const occupancy = getOccupancy(room.id);
              const rentPerHead = room.capacity > 0 ? (room.price_monthly / room.capacity).toFixed(2) : 0;
              const electricPerHead = room.capacity > 0 ? ((room.base_electric_rate || 0) / room.capacity).toFixed(2) : 0;

              return (
                <div key={room.id}>
                  {/* Mobile Card */}
                  <div className="md:hidden border-t border-gray-100 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">Room {room.room_number}</p>
                        <p className="text-sm text-gray-600">{room.bed_type}</p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Occupancy</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {occupancy}/{room.capacity}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Monthly Rent</p>
                        <p className="font-semibold text-green-600">₱{room.price_monthly.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Electric</p>
                        <p className="font-semibold text-yellow-600">₱{(room.base_electric_rate || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRoomClick(room)}
                      className="w-full text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg py-2"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Desktop Row */}
                  <div
                    className="hidden md:grid md:grid-cols-8 px-4 py-3 text-sm text-gray-800 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRoomClick(room)}
                  >
                    <span className="font-semibold">Room {room.room_number}</span>
                    <span>{room.bed_type}</span>
                    <span>{room.capacity} {room.capacity > 1 ? "persons" : "person"}</span>
                    <span className="font-semibold text-green-600">₱{room.price_monthly.toLocaleString()}</span>
                    <span className="font-semibold text-yellow-600">₱{(room.base_electric_rate || 0).toLocaleString()}</span>
                    <div>
                      <p className="text-xs text-gray-500">Rent: ₱{rentPerHead}</p>
                      <p className="text-xs text-gray-500">⚡: ₱{electricPerHead}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          occupancy === 0
                            ? "bg-gray-100 text-gray-600"
                            : occupancy >= room.capacity
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {occupancy}/{room.capacity}
                      </span>
                    </div>
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
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* RIGHT SIDE - ADD FORM */}
      {showAddRoom && (
        <AddRoomForm
          roomForm={roomForm}
          setRoomForm={setRoomForm}
          handleCreateRoom={handleCreateRoom}
          setShowAddRoom={setShowAddRoom}
          loading={loading}
          pricePerHead={pricePerHead}
          electricPerHead={electricPerHead}
        />
      )}

      {/* ROOM DETAILS MODAL */}
      {showRoomDetails && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          tenants={getRoomTenants(selectedRoom.id)}
          occupancy={getOccupancy(selectedRoom.id)}
          onClose={closeModals}
          onEdit={handleEditClick}
          onDelete={handleDeleteRoom}
          onRemoveTenant={handleRemoveTenant}
        />
      )}

      {/* EDIT ROOM MODAL */}
      {showEditRoom && selectedRoom && (
        <EditRoomModal
          editForm={editForm}
          setEditForm={setEditForm}
          handleUpdateRoom={handleUpdateRoom}
          onClose={() => setShowEditRoom(false)}
          loading={loading}
          editPricePerHead={editPricePerHead}
          editElectricPerHead={editElectricPerHead}
        />
      )}
    </section>
  );
}