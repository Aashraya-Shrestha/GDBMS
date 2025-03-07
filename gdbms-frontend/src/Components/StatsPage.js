import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { ArrowLeft } from "@mui/icons-material";

const API_BASE_URL = "http://localhost:4000/members";

const StatsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyMembers: 0,
    expiringIn3Days: 0,
    expiringThisWeek: 0,
    expiredMemberships: 0,
    inactiveMembers: 0,
  });
  const [monthlyJoinData, setMonthlyJoinData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data from the backend
        const totalRes = await axios.get(`${API_BASE_URL}/all-members`, {
          withCredentials: true,
        });
        const monthlyRes = await axios.get(`${API_BASE_URL}/monthly-members`, {
          withCredentials: true,
        });
        const expiring3DaysRes = await axios.get(
          `${API_BASE_URL}/expiring-within-3-days`,
          { withCredentials: true }
        );
        const expiringWeekRes = await axios.get(
          `${API_BASE_URL}/expiring-within-4to7-days`,
          { withCredentials: true }
        );
        const expiredRes = await axios.get(
          `${API_BASE_URL}/expiredMemberships`,
          { withCredentials: true }
        );
        const inactiveRes = await axios.get(`${API_BASE_URL}/inactiveMembers`, {
          withCredentials: true,
        });

        // Calculate counts from the lists
        setStats({
          totalMembers: totalRes.data.members.length,
          monthlyMembers: monthlyRes.data.members.length,
          expiringIn3Days: expiring3DaysRes.data.members.length,
          expiringThisWeek: expiringWeekRes.data.members.length,
          expiredMemberships: expiredRes.data.members.length,
          inactiveMembers: inactiveRes.data.members.length,
        });

        // Prepare data for the line graph (members joined this month)
        const monthlyJoins = monthlyRes.data.members;
        const joinCountByDay = {};

        monthlyJoins.forEach((member) => {
          const joinDate = new Date(member.createdAt).toLocaleDateString(
            "en-GB"
          );
          joinCountByDay[joinDate] = (joinCountByDay[joinDate] || 0) + 1;
        });

        const formattedData = Object.keys(joinCountByDay).map((date) => ({
          date,
          members: joinCountByDay[date],
        }));

        setMonthlyJoinData(formattedData);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);

  const barData = [
    { name: "Total Members", value: stats.totalMembers },
    { name: "Joined This Month", value: stats.monthlyMembers },
    { name: "Expiring in 3 Days", value: stats.expiringIn3Days },
    { name: "Expiring This Week", value: stats.expiringThisWeek },
    { name: "Expired Memberships", value: stats.expiredMemberships },
    { name: "Inactive Members", value: stats.inactiveMembers },
  ];

  const pieData = [
    {
      name: "Active",
      value:
        stats.totalMembers - stats.expiredMemberships - stats.inactiveMembers,
    },
    { name: "Expired", value: stats.expiredMemberships },
    { name: "Inactive", value: stats.inactiveMembers },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#FFBB28"];

  return (
    <div className="p-8 w-full min-h-screen bg-gray-100">
      {/* Dashboard Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2"
        >
          <ArrowLeft />
          Back to dashboard
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
        Membership Statistics
      </h1>

      {/* Bar Chart - Top Section */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Member Overview
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={14} strokeDasharray="0" />
              <YAxis fontSize={14} strokeDasharray="0" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Graph - Monthly Joins */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Members Joined This Month
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyJoinData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={14} strokeDasharray="0" />
              <YAxis fontSize={14} strokeDasharray="0" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="members"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Bottom Section */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Membership Status
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
