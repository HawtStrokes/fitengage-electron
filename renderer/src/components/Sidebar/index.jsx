import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUser, FaSignOutAlt, FaDollarSign, FaUsers } from "react-icons/fa";

const Sidebar = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await window.api.getSession(); // Get session token
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
    await window.api.logout(); // Call logout function
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="bg-maroon text-white w-64 min-h-screen p-5">
      {/* Admin Profile Section */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
        <p className="font-semibold">{userData ? userData.name : "Admin Name"}</p>
        <p className="text-sm">{userData ? userData.email : "admin@example.com"}</p>
      </div>

      {/* Navigation Menu */}
      <ul>
        <li>
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">
            <FaHome className="inline-block mr-2" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">
            <FaUser className="inline-block mr-2" /> Admin Profile
          </Link>
        </li>
        <li>
          <Link to="/payments" className="block py-2 px-4 hover:bg-gray-700 rounded">
            <FaDollarSign className="inline-block mr-2" /> Payments
          </Link>
        </li>
        <li>
          <Link to="/members" className="block py-2 px-4 hover:bg-gray-700 rounded">
            <FaUsers className="inline-block mr-2" /> Members
          </Link>
        </li>
      </ul>

      {/* Logout Button */}
      <div className="mt-10">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-700 rounded text-white font-semibold"
        >
          <FaSignOutAlt className="inline-block mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

