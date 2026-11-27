import { MotionConfig } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { useAuth } from "./contexts/auth-context.js";
import Landing from "./Pages/Landing.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import { Dashboard } from "./Pages/Dashboard.jsx";
import Customers from "./Pages/Customer.jsx";
import Transaction from "./Pages/transaction.jsx";
import Inventory from "./Pages/Inventory.jsx";
import Billing from "./Pages/Billing.jsx";
import Cashbook from "./Pages/Cashbook.jsx";
import Suppliers from "./Pages/Suppliers.jsx";
import Reports from "./Pages/Reports.jsx";
import Assistant from "./Pages/Assistant.jsx";
import Settings from "./Pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-slate-500">Loading your shop…</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <Routes>
            <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/cashbook" element={<ProtectedRoute><Cashbook /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MotionConfig>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
