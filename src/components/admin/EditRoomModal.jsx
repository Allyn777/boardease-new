import React from "react";

export default function EditRoomModal({
  editForm,
  setEditForm,
  handleUpdateRoom,
  onClose,
  loading,
  editPricePerHead,
  editElectricPerHead,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Room</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateRoom} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Room No. *</label>
            <input
              type="text"
              required
              value={editForm.room_number}
              onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 101, 102, 201"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Bed Type *</label>
            <select
              required
              value={editForm.bed_type}
              onChange={(e) => setEditForm({ ...editForm, bed_type: e.target.value })}
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
            <label className="text-sm font-semibold text-gray-700">Capacity *</label>
            <input
              type="number"
              required
              value={editForm.capacity}
              onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1, 2, 4"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Cannot reduce below current occupancy
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Price per Month (PHP) *</label>
            <input
              type="number"
              required
              value={editForm.price_monthly}
              onChange={(e) => setEditForm({ ...editForm, price_monthly: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3000"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Base Electric Rate (PHP/Month) *</label>
            <input
              type="number"
              required
              value={editForm.base_electric_rate}
              onChange={(e) => setEditForm({ ...editForm, base_electric_rate: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
              min="0"
              step="0.01"
            />
          </div>

          {/* Updated Price Preview */}
          {editForm.capacity && editForm.price_monthly && editForm.base_electric_rate && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <label className="text-sm font-semibold text-purple-700 mb-2 block">
                💰 Updated Cost per Person
              </label>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600">Rent per head:</span>
                  <span className="font-bold text-purple-700">
                    ₱{parseFloat(editPricePerHead).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">⚡ Electric per head:</span>
                  <span className="font-bold text-yellow-700">
                    ₱{parseFloat(editElectricPerHead).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-purple-300 pt-2 flex justify-between">
                  <span className="font-bold text-purple-800">Total per person:</span>
                  <span className="font-bold text-purple-800 text-lg">
                    ₱{(parseFloat(editPricePerHead) + parseFloat(editElectricPerHead)).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-purple-600 mt-2">
                📝 Existing tenants will be affected by this price change
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-[#051A2C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#031121] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}