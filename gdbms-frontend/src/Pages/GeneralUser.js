import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button, Card, Space, Statistic, message } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";

const GeneralUser = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [header, setHeader] = useState("General Users");
  const [members, setMembers] = useState([]);
  const [today] = useState(dayjs().format("YYYY-MM-DD"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
  });

  const theme = {
    primary: "#1890ff",
    secondary: "#f0f2f5",
    text: "rgba(0, 0, 0, 0.85)",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    border: "#d9d9d9",
  };

  // Column configuration
  const columns = [
    { title: "Index", width: 80 },
    { title: "Member Name", width: 200 },
    { title: "Address", width: 200 },
    { title: "Phone Number", width: 150 },
    { title: "Today's Attendance", width: 250 },
    { title: "Expiring Date", width: 150 },
    { title: "Details", width: 150 },
  ];

  useEffect(() => {
    const func = sessionStorage.getItem("func");
    functionCall(func);
    fetchMembers(func);
  }, []);

  const functionCall = (func) => {
    const headers = {
      monthly: "Joined This Month",
      threeDays: "Expiring Within Three Days",
      thisWeek: "Expiring Within This Week",
      expired: "Expired Memberships",
      inactive: "Inactive Memberships",
    };
    setHeader(headers[func] || "General Users");
  };

  const fetchMembers = async (func) => {
    setIsRefreshing(true);
    const endpoints = {
      monthly: "http://localhost:4000/members/monthly-members",
      threeDays: "http://localhost:4000/members/expiring-within-3-days",
      thisWeek: "http://localhost:4000/members/expiring-within-4to7-days",
      expired: "http://localhost:4000/members/expiredMemberships",
      inactive: "http://localhost:4000/members/inactiveMembers",
    };

    const endpoint =
      endpoints[func] || "http://localhost:4000/members/all-members";
    try {
      const response = await axios.get(endpoint, { withCredentials: true });
      const membersData = response.data.members || response.data.members;
      setMembers(membersData);

      const totalMembers = membersData.length;
      const activeMembers = membersData.filter(
        (m) => m.status === "Active"
      ).length;

      setStats({
        totalMembers,
        activeMembers,
      });

      message.success("Members list refreshed successfully");
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewMember = (id) => {
    navigate(`/member/${id}`);
  };

  const toggleAttendance = async (memberId, currentStatus) => {
    try {
      const newStatus = currentStatus === "present" ? "absent" : "present";

      await axios.post(
        `http://localhost:4000/members/mark-attendance/${memberId}`,
        { status: newStatus, date: today },
        { withCredentials: true }
      );

      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member._id === memberId) {
            const todayRecordIndex = member.attendance?.findIndex(
              (record) => dayjs(record.date).format("YYYY-MM-DD") === today
            );

            const updatedAttendance = [...(member.attendance || [])];
            if (todayRecordIndex >= 0) {
              updatedAttendance[todayRecordIndex].status = newStatus;
            } else {
              updatedAttendance.push({
                date: new Date(),
                status: newStatus,
              });
            }

            return {
              ...member,
              attendance: updatedAttendance,
            };
          }
          return member;
        })
      );

      toast.success(`Attendance marked as ${newStatus}`);
    } catch (error) {
      toast.error("Error updating attendance: " + error.message);
    }
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div
      className="flex-1 flex-col px-4 pb-4"
      style={{ backgroundColor: theme.secondary }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1
          className="text-3xl my-2 font-semibold text-center"
          style={{ color: theme.text }}
        >
          {header}
        </h1>

        <Card
          bordered={false}
          style={{
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Space size="large" style={{ marginBottom: "16px" }}>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              valueStyle={{ color: theme.primary }}
            />
            <Statistic
              title="Active Members"
              value={stats.activeMembers}
              valueStyle={{ color: "#52c41a" }}
            />
          </Space>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "left",
            }}
          >
            <Input
              placeholder="Search members..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "300px" }}
              allowClear
            />

            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                const func = sessionStorage.getItem("func");
                fetchMembers(func);
              }}
              loading={isRefreshing}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                color: "#fff",
              }}
            >
              Refresh
            </Button>
          </div>
        </Card>
      </div>

      {/* Header Row */}
      <Row
        style={{
          backgroundColor: theme.headerBg,
          color: theme.text,
          fontWeight: "bold",
          padding: "12px 0",
          margin: 0,
          width: "100%",
          display: "flex",
          borderRadius: "8px 8px 0 0",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {columns.map((col, index) => (
          <Col
            key={index}
            style={{
              padding: "0 8px",
              textAlign: "center",
              flex: `0 0 ${col.width}px`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: theme.text,
            }}
          >
            {col.title}
          </Col>
        ))}
      </Row>

      {/* Member Rows */}
      {isRefreshing ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <SyncOutlined spin style={{ fontSize: 24, marginBottom: 16 }} />
          <p>Loading members...</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        filteredMembers.map((item, index) => {
          const todayAttendance = item.attendance?.find(
            (record) => dayjs(record.date).format("YYYY-MM-DD") === today
          ) || { status: "hasnt checked in" };

          const isExpiringSoon =
            item.nextBillDate &&
            dayjs(item.nextBillDate).diff(dayjs(), "day") <= 7;

          return (
            <ListCard
              key={item._id}
              index={index + 1}
              name={item.name}
              address={item.address}
              phoneNumber={item.phoneNumber}
              expireDate={
                item.nextBillDate
                  ? dayjs(item.nextBillDate).format("DD/MM/YYYY")
                  : "N/A"
              }
              memberDetail={() => handleViewMember(item._id)}
              attendanceStatus={todayAttendance.status}
              onToggleAttendance={() =>
                toggleAttendance(item._id, todayAttendance.status)
              }
              colWidths={columns.map((col) => col.width)}
              isExpiringSoon={isExpiringSoon}
            />
          );
        })
      ) : (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <p>No members found matching your criteria</p>
          <Button
            type="primary"
            onClick={() => {
              setSearchQuery("");
              const func = sessionStorage.getItem("func");
              fetchMembers(func);
            }}
            style={{
              marginTop: 16,
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default GeneralUser;
