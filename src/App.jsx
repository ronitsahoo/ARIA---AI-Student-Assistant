import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { DocumentUpload, FeePayment, HostelApp, LMSActivation } from './components/StudentModules';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-dark-bg text-blue-600 dark:text-neon-blue">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />; // Or unauthorized page

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute allowedRoles={['student', 'staff', 'admin']}><DashboardLayout /></ProtectedRoute>}>
              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/documents" element={<ProtectedRoute allowedRoles={['student']}><div className="max-w-7xl mx-auto h-full flex flex-col p-4"><DocumentUpload fullPage={true} /></div></ProtectedRoute>} />
              <Route path="/student/payment" element={<ProtectedRoute allowedRoles={['student']}><div className="max-w-7xl mx-auto h-full flex flex-col p-4"><FeePayment fullPage={true} /></div></ProtectedRoute>} />
              <Route path="/student/hostel" element={<ProtectedRoute allowedRoles={['student']}><div className="max-w-7xl mx-auto h-full flex flex-col p-4"><HostelApp fullPage={true} /></div></ProtectedRoute>} />
              <Route path="/student/lms" element={<ProtectedRoute allowedRoles={['student']}><div className="max-w-7xl mx-auto h-full flex flex-col p-4"><LMSActivation fullPage={true} /></div></ProtectedRoute>} />

              {/* Staff Routes */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/staff/verifications" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><div className="text-center py-20 text-gray-400">Reports Module Coming Soon</div></ProtectedRoute>} />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
