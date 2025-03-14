import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import Payments from "./pages/Payments";
import Members from "./pages/Members";
import Home from "./pages/Home";
import Login from "./pages/Login";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* ✅ Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ✅ Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Private Routes (No Auth Check Yet) */}
        <Route
          path="/dashboard"
          element={
            <div className="flex">
              <Sidebar />
              <Dashboard />
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="flex">
              <Sidebar />
              <AdminProfile />
            </div>
          }
        />
        <Route
          path="/payments"
          element={
            <div className="flex">
              <Sidebar />
              <Payments />
            </div>
          }
        />
        <Route
          path="/members"
          element={
            <div className="flex">
              <Sidebar />
              <Members />
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;