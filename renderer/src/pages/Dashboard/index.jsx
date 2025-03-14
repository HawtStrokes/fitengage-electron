import React, { useState, useEffect } from "react";
import { FaUsers, FaExclamationCircle, FaHourglass } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// Constants
const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;

const Dashboard = () => {
  const [membershipData, setMembershipData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState(null);

  // ✅ Fetch members & membership types using Electron API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [members, types] = await Promise.all([
          window.api.getMembers(),
          window.api.getMembershipTypes(),
        ]);

        // Map membership type ID to price
        const membershipTypeMap = {};
        types.forEach((type) => {
          membershipTypeMap[type.id] = type.price;
        });

        setMembershipTypes(membershipTypeMap);
        setMembershipData(members);
        processDashboardStats(members);
        processRevenueData(members, membershipTypeMap);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Process dashboard statistics
  const processDashboardStats = (members) => {
    const today = new Date();
    const expiringThreshold = new Date(today.getTime() + DAYS_7_MS);

    const overdueMembers = members.filter((m) => new Date(m.membership_end) < today).length;
    const expiringSoonMembers = members.filter((m) => {
      const expiryDate = new Date(m.membership_end);
      return expiryDate >= today && expiryDate < expiringThreshold;
    }).length;

    setDashboardStats({
      totalMembers: members.length,
      overdueMembers,
      expiringSoonMembers,
    });
  };

  // ✅ Process revenue data for the chart
  const processRevenueData = (members, typeMap) => {
    const paymentsByMonth = Array(12).fill(0);

    members.forEach((m) => {
      const paymentDate = new Date(m.membership_start);
      const monthIndex = paymentDate.getMonth();
      const membershipPrice = typeMap[m.membership_type_id] || 0;
      paymentsByMonth[monthIndex] += membershipPrice;
    });

    const formattedRevenueData = paymentsByMonth.map((revenue, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      revenue,
    }));

    setRevenueData(formattedRevenueData);
  };

  // ✅ Handle stat click
  const handleStatClick = (stat) => {
    if (stat !== "total") {
      setSelectedStat(stat);
    }
  };

  // ✅ Show loading state
  if (loading) return <div className="text-center text-lg">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-center text-4xl font-bold mb-4 text-red-950">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Members"
          value={dashboardStats?.totalMembers || 0}
          icon={FaUsers}
          onClick={() => handleStatClick("total")}
        />
        <StatCard
          title="Overdue Members"
          value={dashboardStats?.overdueMembers || 0}
          icon={FaExclamationCircle}
          onClick={() => handleStatClick("overdue")}
        />
        <StatCard
          title="Membership Expiring Soon"
          value={dashboardStats?.expiringSoonMembers || 0}
          icon={FaHourglass}
          onClick={() => handleStatClick("expiringSoon")}
        />
      </div>

      {/* ✅ Revenue Chart */}
      <div className="mt-8 bg-white shadow-lg p-6 rounded-lg w-full">
        <h2 className="text-center text-xl font-semibold mb-4 text-red-950">Monthly Revenue</h2>
        {revenueData.every((r) => r.revenue === 0) ? (
          <p className="text-center text-gray-500">No revenue data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#AA0000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ✅ Display List of Members for Overdue/Expiring */}
      {selectedStat === "overdue" && <MemberList members={membershipData.filter((m) => new Date(m.membership_end) < new Date())} />}
      {selectedStat === "expiringSoon" && (
        <MemberList
          members={membershipData.filter(
            (m) => new Date(m.membership_end) >= new Date() && new Date(m.membership_end) < new Date(Date.now() + DAYS_7_MS)
          )}
        />
      )}
    </div>
  );
};

// ✅ StatCard Component
const StatCard = ({ title, value, icon: Icon, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg shadow-md cursor-pointer bg-white" onClick={onClick}>
    <div className="flex items-center space-x-4">
      <Icon className="text-4xl text-red-900" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </motion.div>
);

// ✅ MemberList Component
const MemberList = ({ members }) => (
  <div className="mt-6 p-4 bg-white shadow-lg rounded-lg">
    <h3 className="text-xl font-semibold mb-3">{members.length === 0 ? "No members found" : "Members List"}</h3>
    {members.length === 0 ? (
      <p className="text-gray-500">No data available</p>
    ) : (
      <ul className="space-y-2">
        {members.map((member, index) => (
          <li key={index} className="p-2 border-b">
            <strong>{member.name}</strong> - Expiry: {new Date(member.membership_end).toLocaleDateString()}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Dashboard;

