import React from 'react';

/**
 * BookingCard Component
 * Displays a booking with cancel option
 * 
 * @param {Object} booking - Booking object (cabin with booking info)
 * @param {Function} onCancel - Callback when cancel button is clicked
 * @param {string} employeeId - ID of the employee who made the booking
 */
const BookingCard = ({ booking, onCancel, employeeId }) => {
  if (!booking) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <p className="text-gray-600 text-center">No active booking</p>
      </div>
    );
  }

  const getTypeColor = (type) => {
    return type === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{booking.name}</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(booking.type)}`}>
            {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          Booked
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {booking.type === 'work' && booking.capacity && (
          <p className="text-gray-600">
            <span className="font-semibold">Capacity:</span> {booking.capacity} people
          </p>
        )}
        <p className="text-gray-600">
          <span className="font-semibold">Status:</span> {booking.status}
        </p>
      </div>

      <button
        onClick={() => onCancel(employeeId)}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
      >
        Cancel Booking
      </button>
    </div>
  );
};

export default BookingCard;

