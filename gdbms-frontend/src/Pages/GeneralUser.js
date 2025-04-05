import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Card,
  Space,
  Statistic,
  message,
  Grid,
  Badge,
  Descriptions,
  Tag,
  Switch,
  Table,
} from "antd";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import {
  SearchOutlined,
  SyncOutlined,
  AppstoreOutlined,
  TableOutlined,
} from "@ant-design/icons";

const { useBreakpoint } = Grid;

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
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const screens = useBreakpoint();

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
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
    },
    {
      title: "Member Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      align: "center",
      width: 200,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      width: 150,
    },
    {
      title: "Today's Attendance",
      key: "attendance",
      align: "center",
      width: 250,
      render: (_, record) => (
        <Space>
          <Tag
            color={
              record.attendanceStatus === "present"
                ? "green"
                : record.attendanceStatus === "absent"
                ? "red"
                : "orange"
            }
          >
            {record.attendanceStatus.replace(/\b\w/g, (l) => l.toUpperCase())}
          </Tag>
          <Switch
            checked={record.attendanceStatus === "present"}
            onChange={() =>
              toggleAttendance(record._id, record.attendanceStatus)
            }
            checkedChildren="Present"
            unCheckedChildren="Absent"
          />
        </Space>
      ),
    },
    {
      title: "Expiring Date",
      key: "expireDate",
      width: 150,
      align: "center",
      render: (_, record) => (
        <span
          style={{
            color: record.isExpiringSoon ? "#f5222d" : "inherit",
            fontWeight: record.isExpiringSoon ? 500 : "normal",
          }}
        >
          {record.expireDate}
          {record.isExpiringSoon && <Badge dot style={{ marginLeft: 8 }} />}
        </span>
      ),
    },
    {
      title: "Details",
      key: "details",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Button
          onClick={() => handleViewMember(record._id)}
          type="link"
          style={{ color: "#1890ff" }}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    // Automatically switch to card view on mobile
    if (screens.xs && viewMode === "table") {
      setViewMode("card");
    }
  }, [screens, viewMode]);

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

  const filteredMembers = members
    .filter((member) =>
      Object.values(member).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .map((member, index) => {
      const todayAttendance = member.attendance?.find(
        (record) => dayjs(record.date).format("YYYY-MM-DD") === today
      ) || { status: "hasnt checked in" };

      const isExpiringSoon =
        member.nextBillDate &&
        dayjs(member.nextBillDate).diff(dayjs(), "day") <= 7;

      return {
        ...member,
        key: member._id,
        index: index + 1,
        attendanceStatus: todayAttendance.status,
        expireDate: member.nextBillDate
          ? dayjs(member.nextBillDate).format("DD/MM/YYYY")
          : "N/A",
        isExpiringSoon,
      };
    });

  const renderCardView = () => (
    <div
      className="card-container"
      style={{
        display: "grid",
        gridTemplateColumns: screens.md ? "repeat(2, 1fr)" : "1fr",
        gap: "16px",
        padding: "16px 0",
      }}
    >
      {filteredMembers.map((member) => {
        const todayAttendance = member.attendance?.find(
          (record) => dayjs(record.date).format("YYYY-MM-DD") === today
        ) || { status: "hasnt checked in" };

        const isExpiringSoon =
          member.nextBillDate &&
          dayjs(member.nextBillDate).diff(dayjs(), "day") <= 7;

        return (
          <Card
            key={member._id}
            title={member.name}
            extra={
              <Button
                onClick={() => handleViewMember(member._id)}
                type="link"
                size="small"
              >
                View
              </Button>
            }
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Address">
                {member.address}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {member.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    todayAttendance.status === "present"
                      ? "green"
                      : todayAttendance.status === "absent"
                      ? "red"
                      : "orange"
                  }
                >
                  {todayAttendance.status.replace(/\b\w/g, (l) =>
                    l.toUpperCase()
                  )}
                </Tag>
                <Switch
                  checked={todayAttendance.status === "present"}
                  onChange={() =>
                    toggleAttendance(member._id, todayAttendance.status)
                  }
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Expiry Date">
                <span
                  style={{
                    color: isExpiringSoon ? "#f5222d" : "inherit",
                    fontWeight: isExpiringSoon ? 500 : "normal",
                  }}
                >
                  {member.nextBillDate
                    ? dayjs(member.nextBillDate).format("DD/MM/YYYY")
                    : "N/A"}
                  {isExpiringSoon && <Badge dot style={{ marginLeft: 8 }} />}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div
      className="flex-1 flex-col px-4 pb-4"
      style={{ backgroundColor: theme.secondary, minHeight: "100vh" }}
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
              style={{ width: screens.xs ? "100%" : "300px" }}
              allowClear
            />

            {!screens.xs && (
              <Button
                icon={
                  viewMode === "table" ? (
                    <AppstoreOutlined />
                  ) : (
                    <TableOutlined />
                  )
                }
                onClick={() =>
                  setViewMode(viewMode === "table" ? "card" : "table")
                }
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                  color: "#fff",
                }}
              >
                {viewMode === "table" ? "Card View" : "Table View"}
              </Button>
            )}

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
              {screens.xs ? "Refresh" : "Refresh"}
            </Button>
          </div>
        </Card>
      </div>

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
        viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={filteredMembers}
            pagination={false}
            scroll={{ x: true }}
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          renderCardView()
        )
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
