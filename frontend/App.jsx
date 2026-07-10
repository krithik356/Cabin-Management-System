import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './src/components/Navigation';
import Home from './src/pages/Home';
import AdminLogin from './src/pages/AdminLogin';
import AdminCabinManagement from './src/pages/AdminCabinManagement';
import AdminBookingOverview from './src/pages/AdminBookingOverview';
import AdminDashboard from './src/pages/AdminDashboard';
import EmployeeLogin from './src/pages/EmployeeLogin';
import EmployeeAvailableCabins from './src/pages/EmployeeAvailableCabins';
import EmployeeBookings from './src/pages/EmployeeBookings';

/**
 * Main App Component
 * Sets up routing and navigation for the application
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home Route - No Navigation */}
          <Route path="/" element={<Home />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <>
                <Navigation isAdmin={true} />
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="cabins" element={<AdminCabinManagement />} />
                  <Route path="bookings" element={<AdminBookingOverview />} />
                </Routes>
              </>
            }
          />

          {/* Employee Routes */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route
            path="/employee/*"
            element={
              <>
                <Navigation isAdmin={false} />
                <Routes>
                  <Route path="cabins" element={<EmployeeAvailableCabins />} />
                  <Route path="bookings" element={<EmployeeBookings />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

