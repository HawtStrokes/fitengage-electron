import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaSignOutAlt, FaDollarSign, FaUsers, FaBars, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../../assets/kiloKulture_Logo.svg";

const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await window.api.getSession();
        if (!session || !session.userId) return;

        const user = await window.api.getUserProfile(session.userId);
        if (user.success) {
          setUserData(user.user);
        } else {
          console.error("Failed to fetch user data:", user.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await window.api.logout();
    localStorage.removeItem("sessionToken");
    navigate("/login");
  };

  return (
    <motion.div
      animate={{ width: isOpen ? "16rem" : "4rem" }}
      className="bg-maroon text-white min-h-screen p-5 flex flex-col items-center relative overflow-hidden transition-all duration-300 shadow-lg"
    >
      {/* Toggle Button */}
      <button
        className="absolute top-5 right-[-1.5rem] bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
      </button>

      {/* Logo Section */}
      <motion.div animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0 }} className="mb-6">
        <img src={logo} alt="KiloKulture Logo" className="w-24 h-auto transition-all duration-300" />
      </motion.div>

      {/* Admin Profile Section */}
      <motion.div animate={{ opacity: isOpen ? 1 : 0 }} className="text-center mb-10 transition-all duration-300">
        <p className="font-semibold">{userData ? userData.name : "Admin Name"}</p>
        <p className="text-sm">{userData ? userData.email : "admin@example.com"}</p>
      </motion.div>

      {/* Navigation Menu */}
      <ul className="w-full">
        {[{ to: "/dashboard", icon: <FaHome />, label: "Dashboard" },
          { to: "/profile", icon: <FaUser />, label: "Admin Profile" },
          { to: "/payments", icon: <FaDollarSign />, label: "Payments" },
          { to: "/members", icon: <FaUsers />, label: "Members" }].map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className="flex items-center gap-2 py-3 px-4 hover:bg-gray-700 rounded transition-all duration-300"
            >
              {item.icon} <motion.span animate={{ opacity: isOpen ? 1 : 0 }}>{item.label}</motion.span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="mt-auto w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full py-3 px-4 bg-red-500 hover:bg-red-700 rounded text-white font-semibold transition-all duration-300"
        >
          <FaSignOutAlt /> <motion.span animate={{ opacity: isOpen ? 1 : 0 }}>Logout</motion.span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
