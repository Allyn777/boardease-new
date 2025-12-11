import React from "react";

export default function RoomDetailsModal({
  room,
  tenants,
  occupancy,
  onClose,
  onEdit,
  onDelete,
  onRemoveTenant,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Room {room.room_number}</h3>
            <p className="text-sm text-gray-600 mt-1">{room.bed_type}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ✕
          </button>
        </div>

        {/* Room Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capacity & Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Capacity & Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Max Capacity:</span>
                <span className="font-semibold text-gray-900">{room.capacity} persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Occupancy:</span>
                <span className="font-semibold text-blue-700">
                  {occupancy}/{room.capacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Spots:</span>
                <span className="font-semibold text-green-700">{room.capacity - occupancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    room.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {room.status}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pricing
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent:</span>
                <span className="font-bold text-green-700">₱{room.price_monthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electric Base:</span>
                <span className="font-bold text-yellow-700">
                  ₱{(room.base_electric_rate || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-green-300 pt-2">
                <span className="text-gray-600">Rent Per Person:</span>
                <span className="font-bold text-blue-700">
                  ₱{(room.price_monthly / room.capacity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electric Per Person:</span>
                <span className="font-bold text-yellow-700">
                  ₱{((room.base_electric_rate || 0) / room.capacity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-green-300 pt-2">
                <span className="text-gray-600">Total Per Person:</span>
                <span className="font-bold text-green-800 text-lg">
                  ₱{((room.price_monthly + (room.base_electric_rate || 0)) / room.capacity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants List */}
        <div className="mt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Current Tenants
            <span className="text-sm font-normal text-gray-500">
              ({occupancy} of {room.capacity})
            </span>
          </h4>

          {tenants.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500 text-sm">No tenants in this room</p>
              <p className="text-xs text-gray-400 mt-1">This room is available for new tenants</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{tenant.tenant_name}</p>
                      {tenant.profiles?.full_name && (
                        <p className="text-sm text-gray-600">Account: {tenant.profiles.full_name}</p>
                      )}
                      {tenant.profiles?.phone && (
                        <p className="text-sm text-gray-600">📱 {tenant.profiles.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {tenant.rent_start ? new Date(tenant.rent_start).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveTenant(tenant.id, tenant.tenant_name)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 rounded px-3 py-1.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ✏️ Edit Room
          </button>
          <button
            onClick={onDelete}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            🗑️ Delete Room
          </button>
        </div>
      </div>
    </div>
  );
}