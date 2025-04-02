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
import { Card, Spin, Modal, Button, message } from "antd";
import Avatar from "@mui/material/Avatar";
import QRScannerModal from "../Modals/QrScanner";

const API_BASE_URL = "http://localhost:4000/members";

const Dashboard = () => {
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
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [
          totalRes,
          monthlyRes,
          expiring3DaysRes,
          expiringWeekRes,
          expiredRes,
          inactiveRes,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/all-members`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/monthly-members`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/expiring-within-3-days`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/expiring-within-4to7-days`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/expiredMemberships`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/inactiveMembers`, {
            withCredentials: true,
          }),
        ]);

        setStats({
          totalMembers: totalRes.data.members.length,
          monthlyMembers: monthlyRes.data.members.length,
          expiringIn3Days: expiring3DaysRes.data.members.length,
          expiringThisWeek: expiringWeekRes.data.members.length,
          expiredMemberships: expiredRes.data.members.length,
          inactiveMembers: inactiveRes.data.members.length,
        });

        // Process monthly join data
        const joinCountByDay = monthlyRes.data.members.reduce((acc, member) => {
          const joinDate = new Date(member.createdAt).toLocaleDateString(
            "en-GB"
          );
          acc[joinDate] = (acc[joinDate] || 0) + 1;
          return acc;
        }, {});

        setMonthlyJoinData(
          Object.keys(joinCountByDay).map((date) => ({
            date,
            members: joinCountByDay[date],
          }))
        );

        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleScanSuccess = async (qrData) => {
    try {
      message.loading({ content: "Processing QR code...", key: "scan" });

      const response = await axios.post(
        `${API_BASE_URL}/scan-qr`,
        { qrData: JSON.stringify(qrData) },
        { withCredentials: true }
      );

      setScanResult(response.data);
      message.success({
        content: `${response.data.message}: ${response.data.member.name}`,
        key: "scan",
        duration: 3,
      });

      // Refresh stats after successful scan
      const statsRes = await axios.get(`${API_BASE_URL}/all-members`, {
        withCredentials: true,
      });

      // Also refresh today's attendance data if available
      try {
        const attendanceRes = await axios.get(
          `${API_BASE_URL}/todays-attendance`,
          {
            withCredentials: true,
          }
        );
        // You might want to store this in state if you display it
      } catch (attendanceErr) {
        console.log("Couldn't refresh attendance data", attendanceErr);
      }

      setStats((prev) => ({
        ...prev,
        totalMembers: statsRes.data.members.length,
      }));
    } catch (err) {
      console.error("Error scanning QR code:", err);
      message.error({
        content:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to process QR code",
        key: "scan",
      });
    } finally {
      setScanModalVisible(false);
    }
  };

  const cardData = [
    {
      title: "Active Members",
      path: "/memberList",
      value: "active",
      count:
        stats.totalMembers - stats.expiredMemberships - stats.inactiveMembers,
      color: "#4CAF50",
    },
    {
      title: "Joined This Month",
      path: "/specific/monthly",
      value: "monthly",
      count: stats.monthlyMembers,
      color: "#2196F3",
    },
    {
      title: "Expiring in 3 Days",
      path: "/specific/expiring-within-3days",
      value: "threeDays",
      count: stats.expiringIn3Days,
      color: "#FF9800",
    },
    {
      title: "Expiring This Week",
      path: "/specific/expiring-this-week",
      value: "thisWeek",
      count: stats.expiringThisWeek,
      color: "#FF5722",
    },
    {
      title: "Expired Memberships",
      path: "/specific/expiredMemberships",
      value: "expired",
      count: stats.expiredMemberships,
      color: "#F44336",
    },
    {
      title: "Inactive Members",
      path: "/specific/inactiveMembers",
      value: "inactive",
      count: stats.inactiveMembers,
      color: "#9E9E9E",
    },
  ];

  const handleCardClick = (path, value) => {
    if (path === "/memberList" && value === "active") {
      navigate(path, { state: { filter: "active" } });
    } else if (path.startsWith("/specific") && value) {
      sessionStorage.setItem("func", value);
      navigate(path);
    } else {
      navigate(path);
    }
  };

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
    <div className="w-full min-h-screen bg-gray-50 p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            type="primary"
            onClick={() => setScanModalVisible(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Scan Member QR
          </Button>
          <div
            className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={scanModalVisible}
        onClose={() => {
          setScanModalVisible(false);
          setScanResult(null);
        }}
        onScanSuccess={handleScanSuccess}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cardData.map((card, index) => (
              <Card
                key={index}
                className={`shadow-sm transition-all duration-200 cursor-pointer 
                  ${
                    hoveredCard === index
                      ? "transform -translate-y-1 shadow-lg"
                      : ""
                  }`}
                onClick={() => handleCardClick(card.path, card.value)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ borderLeft: `4px solid ${card.color}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <p
                      className="text-2xl font-bold mt-2"
                      style={{ color: card.color }}
                    >
                      {card.count}
                    </p>
                  </div>
                  {hoveredCard === index && (
                    <span className="text-xs text-gray-500">
                      Click to view details
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <Card
              className="p-4 shadow-sm hover:shadow-md transition-shadow"
              hoverable
            >
              <h3 className="text-lg font-semibold mb-4">
                Membership Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      contentStyle={{ borderRadius: "8px" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pie Chart */}
            <Card
              className="p-4 shadow-sm hover:shadow-md transition-shadow"
              hoverable
            >
              <h3 className="text-lg font-semibold mb-4">Membership Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px" }}
                      formatter={(value) => [`${value} members`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Line Chart */}
          <Card
            className="p-4 shadow-sm mb-6 hover:shadow-md transition-shadow"
            hoverable
          >
            <h3 className="text-lg font-semibold mb-4">
              Recent Member Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyJoinData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px" }}
                    formatter={(value) => [`${value} members`, "Count"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="members"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 border-t">
        <p>Contact us at: 98735456732 for any inquiries</p>
      </div>
    </div>
  );
};

export default Dashboard;
