import React from "react";

export default function AddRoomForm({
  roomForm,
  setRoomForm,
  handleCreateRoom,
  setShowAddRoom,
  loading,
  pricePerHead,
  electricPerHead,
}) {
  return (
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
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 101, 102, 201"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-semibold text-gray-700">Bed Type *</label>
          <select
            required
            value={roomForm.bed_type}
            onChange={(e) => setRoomForm({ ...roomForm, bed_type: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Bunk Bed">Bunk Bed</option>
            <option value="Queen Bed">Queen Bed</option>
            <option value="King Bed">King Bed</option>
          </select>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-semibold text-gray-700">
            Capacity (Number of People) *
          </label>
          <input
            type="number"
            required
            value={roomForm.capacity}
            onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1, 2, 4"
            min="1"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-semibold text-gray-700">
            Price per Month (PHP) *
          </label>
          <input
            type="number"
            required
            value={roomForm.price_monthly}
            onChange={(e) => setRoomForm({ ...roomForm, price_monthly: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3000"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-semibold text-gray-700">
            Base Electric Rate (PHP/Month) *
          </label>
          <input
            type="number"
            required
            value={roomForm.base_electric_rate}
            onChange={(e) => setRoomForm({ ...roomForm, base_electric_rate: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">Fixed monthly electric cost for this room</p>
        </div>

        {/* Auto-calculated Price Per Head Display */}
        {roomForm.capacity && roomForm.price_monthly && roomForm.base_electric_rate && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <label className="text-xs sm:text-sm font-semibold text-blue-700 mb-2 block">
              💰 Cost per Person
            </label>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Rent per head:</span>
                <span className="font-bold text-blue-700">₱{parseFloat(pricePerHead).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">⚡ Electric per head:</span>
                <span className="font-bold text-yellow-700">
                  ₱{parseFloat(electricPerHead).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-blue-300 pt-2 flex justify-between">
                <span className="font-bold text-blue-800">Total per person:</span>
                <span className="font-bold text-blue-800 text-lg">
                  ₱{(parseFloat(pricePerHead) + parseFloat(electricPerHead)).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-600 mt-2">
              💡 Each tenant will pay ₱
              {(parseFloat(pricePerHead) + parseFloat(electricPerHead)).toFixed(2)}/month (excluding
              extra electronics if applicable)
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
  );
}