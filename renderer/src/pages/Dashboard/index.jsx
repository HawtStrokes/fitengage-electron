import React, { useState, useEffect } from "react";
import { FaUsers, FaExclamationCircle, FaHourglass, FaDollarSign, FaChartLine } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Modal Component
const Modal = ({ title, data, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {data.length > 0 ? (
        <ul className="max-h-60 overflow-y-auto">
          {data.map((member, index) => (
            <li key={index} className="p-2 border-b last:border-none">
              <strong>{member.name}</strong> - Expiry: {new Date(member.membership_end).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No members found</p>
      )}
      <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg w-full" onClick={onClose}>Close</button>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [members, paymentsData] = await Promise.all([
          window.api.getMembers(),
          window.api.getPayments(),
        ]);

        processDashboardStats(members);
        processRevenueData(paymentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processDashboardStats = (members) => {
    const today = new Date();
    const expiringThreshold = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const overdueMembers = members.filter((m) => new Date(m.membership_end) < today);
    const expiringSoonMembers = members.filter((m) => {
      const expiryDate = new Date(m.membership_end);
      return expiryDate >= today && expiryDate < expiringThreshold;
    });

    setDashboardStats({
      totalMembers: members.length,
      overdueMembers,
      expiringSoonMembers,
    });
  };

  const processRevenueData = (payments) => {
    const paymentsByMonth = Array(12).fill(0);
    payments.forEach((payment) => {
      const paymentDate = new Date(payment.date);
      const monthIndex = paymentDate.getMonth();
      paymentsByMonth[monthIndex] += payment.amount;
    });

    setRevenueData(
      paymentsByMonth.map((revenue, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        revenue,
      }))
    );
  };

  if (loading) return <div className="text-center text-lg font-bold">Loading...</div>;

  return (
    <div className="p-6 h-full w-full flex flex-col items-center">
      <h1 className="text-center text-4xl font-bold mb-6 text-red-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <StatCard title="Total Members" value={dashboardStats?.totalMembers || 0} icon={FaUsers} />
        <StatCard title="Overdue Members" value={dashboardStats?.overdueMembers.length || 0} icon={FaExclamationCircle} onClick={() => setModalData({ title: "Overdue Members", data: dashboardStats?.overdueMembers || [] })} />
        <StatCard title="Expiring Soon" value={dashboardStats?.expiringSoonMembers.length || 0} icon={FaHourglass} onClick={() => setModalData({ title: "Expiring Soon", data: dashboardStats?.expiringSoonMembers || [] })} />
        <StatCard title="Total Revenue" value={`$${revenueData.reduce((acc, p) => acc + p.revenue, 0).toFixed(2)}`} icon={FaDollarSign} />
      </div>
      <div className="mt-8 bg-white shadow-lg p-6 rounded-lg w-full max-w-6xl">
        <h2 className="text-center text-xl font-semibold mb-4 text-red-800">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#AA0000" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {modalData && <Modal title={modalData.title} data={modalData.data} onClose={() => setModalData(null)} />}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg shadow-md cursor-pointer bg-white hover:bg-red-50 transition-all duration-300" onClick={onClick}>
    <div className="flex items-center space-x-4">
      <Icon className="text-4xl text-red-900" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
