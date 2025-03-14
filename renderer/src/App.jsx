import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";
import Payments from "./pages/Payments";
import Members from "./pages/Members";
import Home from "./pages/Home";
import Login from "./pages/Login";

// ✅ Only Import If They Exist
// import EmailVerify from "./pages/EmailVerify";
// import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ❌ Remove These Routes If They Don't Exist */}
        {/* <Route path="/email-verify" element={<EmailVerify />} /> */}
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

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

