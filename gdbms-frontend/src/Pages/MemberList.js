import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Tag,
  Card,
  Descriptions,
  message,
  Space,
  Select,
  Badge,
  Statistic,
  Switch,
  Grid,
  Progress,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import {
  SearchOutlined,
  UserAddOutlined,
  TrophyOutlined,
  HistoryOutlined,
  FilterOutlined,
  SyncOutlined,
  TableOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { useBreakpoint } = Grid;

const MemberList = () => {
  const [isAddMembershipModalVisible, setIsAddMembershipModalVisible] =
    useState(false);
  const [isTopAttendeeModalVisible, setIsTopAttendeeModalVisible] =
    useState(false);
  const [topAttendee, setTopAttendee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipData, setMembershipData] = useState({
    months: "",
    price: "",
  });
  const [members, setMembers] = useState([]);
  const [today] = useState(dayjs().format("YYYY-MM-DD"));
  const [isMarkingAbsent, setIsMarkingAbsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    attendanceRate: 0,
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const theme = {
    primary: "#1890ff",
    secondary: "#f0f2f5",
    text: "rgba(0, 0, 0, 0.85)",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    border: "#d9d9d9",
  };

  const columns = [
    { title: "Index", width: 80, dataIndex: "index" },
    { title: "Member's Name", width: 200, dataIndex: "name" },
    { title: "Address", width: 200, dataIndex: "address" },
    { title: "Phone Number", width: 150, dataIndex: "phoneNumber" },
    { title: "Today's Attendance", width: 250, dataIndex: "attendance" },
    { title: "Expiring Date", width: 150, dataIndex: "expireDate" },
    { title: "Actions", width: 150, dataIndex: "actions" },
  ];

  useEffect(() => {
    // Automatically switch to card view on mobile
    if (screens.xs && viewMode === "table") {
      setViewMode("card");
    }
  }, [screens, viewMode]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:4000/members/all-members",
          { withCredentials: true }
        );

        const totalMembers = response.data.members.length;
        const activeMembers = response.data.members.filter(
          (m) => m.status === "Active"
        ).length;
        const attendanceRate = calculateAttendanceRate(response.data.members);

        setStats({
          totalMembers,
          activeMembers,
          attendanceRate,
        });

        let filteredMembers = applyFilters(response.data.members);

        const now = new Date();
        const cutoffHour = 20;
        const shouldMarkAbsent = now.getHours() >= cutoffHour;

        if (shouldMarkAbsent) {
          await markAbsentMembers(filteredMembers);
          const updatedResponse = await axios.get(
            "http://localhost:4000/members/all-members",
            { withCredentials: true }
          );
          filteredMembers = applyFilters(updatedResponse.data.members);
        }

        setMembers(filteredMembers);
      } catch (error) {
        toast.error("Error fetching members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [filterStatus]);

  const applyFilters = (members) => {
    let filtered = [...members];

    if (filterStatus === "active") {
      filtered = filtered.filter((m) => m.status === "Active");
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((m) => m.status !== "Active");
    }

    return filtered;
  };

  const calculateAttendanceRate = (members) => {
    if (members.length === 0) return 0;

    const activeMembers = members.filter((m) => m.status === "Active");
    if (activeMembers.length === 0) return 0;

    const totalPossibleAttendance = activeMembers.length;
    let totalPresent = 0;

    activeMembers.forEach((member) => {
      const todayRecord = member.attendance?.find(
        (record) => dayjs(record.date).format("YYYY-MM-DD") === today
      );
      if (todayRecord?.status === "present") {
        totalPresent++;
      }
    });

    return Math.round((totalPresent / totalPossibleAttendance) * 100);
  };

  const markAbsentMembers = async (members) => {
    const membersToMarkAbsent = members.filter((member) => {
      const todayRecord = member.attendance?.find(
        (record) => dayjs(record.date).format("YYYY-MM-DD") === today
      );
      return !todayRecord || todayRecord.status === "hasnt checked in";
    });

    if (membersToMarkAbsent.length > 0) {
      await Promise.all(
        membersToMarkAbsent.map(async (member) => {
          try {
            await axios.post(
              `http://localhost:4000/members/mark-attendance/${member._id}`,
              { status: "absent", date: today },
              { withCredentials: true }
            );
          } catch (error) {
            console.error(`Failed to mark ${member.name} as absent:`, error);
          }
        })
      );
    }
  };

  const fetchTopAttendee = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/members/analyze-top-attendee-renewal",
        { withCredentials: true }
      );
      if (response.data.topAttendee) {
        setTopAttendee(response.data.topAttendee);
        setIsTopAttendeeModalVisible(true);
      } else {
        toast.info("No top attendee found based on recent activity");
      }
    } catch (error) {
      toast.error("Error fetching top attendee: " + error.message);
    }
  };

  const markYesterdayAbsent = async () => {
    setIsMarkingAbsent(true);
    try {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const response = await axios.get(
        "http://localhost:4000/members/all-members",
        { withCredentials: true }
      );

      const activeMembers = response.data.members.filter(
        (member) => member.status === "Active"
      );

      const membersToMarkAbsent = activeMembers.filter((member) => {
        const yesterdayRecord = member.attendance?.find(
          (record) => dayjs(record.date).format("YYYY-MM-DD") === yesterday
        );
        return (
          !yesterdayRecord || yesterdayRecord.status === "hasnt checked in"
        );
      });

      if (membersToMarkAbsent.length === 0) {
        message.info(
          "All active members have attendance records for yesterday"
        );
        return;
      }

      await Promise.all(
        membersToMarkAbsent.map(async (member) => {
          try {
            await axios.post(
              `http://localhost:4000/members/mark-attendance/${member._id}`,
              { status: "absent", date: yesterday },
              { withCredentials: true }
            );
          } catch (error) {
            console.error(`Failed to mark ${member.name} as absent:`, error);
          }
        })
      );

      const updatedResponse = await axios.get(
        "http://localhost:4000/members/all-members",
        { withCredentials: true }
      );

      setMembers(applyFilters(updatedResponse.data.members));
      toast.success(
        `Successfully marked ${membersToMarkAbsent.length} members as absent for yesterday`
      );
    } catch (error) {
      toast.error("Error marking yesterday's absentees: " + error.message);
    } finally {
      setIsMarkingAbsent(false);
    }
  };

  const handleViewMember = (id) => {
    navigate(`/member/${id}`);
  };

  const handleAddMember = () => {
    setIsAddMembershipModalVisible(true);
  };

  const handleMembershipSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/plans/add-membership",
        membershipData,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAddMembershipModalVisible(false);
    } catch (error) {
      toast.error(
        "Error adding membership: " +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

  const getAttendanceStatus = (member) => {
    const todayRecord = member.attendance?.find(
      (record) => dayjs(record.date).format("YYYY-MM-DD") === today
    );
    return todayRecord?.status || "hasnt checked in";
  };

  const toggleAttendance = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "present" ? "absent" : "present";

      await axios.post(
        `http://localhost:4000/members/mark-attendance/${id}`,
        { status: newStatus, date: today },
        { withCredentials: true }
      );

      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member._id === id) {
            const todayRecordIndex =
              member.attendance?.findIndex(
                (record) => dayjs(record.date).format("YYYY-MM-DD") === today
              ) ?? -1;

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
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Define reusable styles
  const cellStyle = {
    display: "table-cell",
    padding: "12px 16px",
    verticalAlign: "middle",
    textAlign: "center",
    borderBottom: `1px solid ${theme.border}`,
  };

  const ellipsisStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
    maxWidth: "100%",
  };

  const renderTableView = () => (
    <div
      style={{
        overflowX: "auto",
        width: "100%",
        border: `1px solid ${theme.border}`,
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: theme.cardBg,
      }}
    >
      <div
        style={{
          display: "table",
          width: "100%",
          minWidth: "800px", // Set a minimum width to ensure all columns are visible
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "table-row",
            backgroundColor: theme.headerBg,
            fontWeight: "bold",
          }}
        >
          {columns.map((col, index) => (
            <div
              key={`header-${index}`}
              style={{
                display: "table-cell",
                padding: "12px 16px",
                borderBottom: `1px solid ${theme.border}`,
                minWidth: col.width,
                textAlign: "center",
              }}
            >
              {col.title}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {filteredMembers.map((member, index) => {
          const todayAttendance = getAttendanceStatus(member);
          const isExpiringSoon =
            member.nextBillDate &&
            dayjs(member.nextBillDate).diff(dayjs(), "day") <= 7;

          return (
            <div
              key={member._id}
              style={{
                display: "table-row",
                ":hover": {
                  backgroundColor: "#fafafa",
                },
              }}
            >
              {/* Index */}
              <div style={cellStyle}>{index + 1}</div>

              {/* Name */}
              <div style={cellStyle}>{member.name}</div>

              {/* Address */}
              <div style={cellStyle}>
                <span style={ellipsisStyle}>{member.address}</span>
              </div>

              {/* Phone */}
              <div style={cellStyle}>{member.phoneNumber}</div>

              {/* Attendance */}
              <div style={cellStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Tag
                    color={
                      todayAttendance === "present"
                        ? "green"
                        : todayAttendance === "absent"
                        ? "red"
                        : "orange"
                    }
                  >
                    {todayAttendance.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Tag>
                  <Switch
                    checked={todayAttendance === "present"}
                    onChange={() =>
                      toggleAttendance(member._id, todayAttendance)
                    }
                    size="default"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div
                style={{
                  ...cellStyle,
                  color: isExpiringSoon ? "#f5222d" : "inherit",
                }}
              >
                {member.nextBillDate
                  ? dayjs(member.nextBillDate).format("DD/MM/YYYY")
                  : "N/A"}
                {isExpiringSoon && <Badge dot style={{ marginLeft: 8 }} />}
              </div>

              {/* Actions */}
              <div style={cellStyle}>
                <Button
                  onClick={() => handleViewMember(member._id)}
                  type="link"
                  style={{ color: theme.primary }}
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
      {filteredMembers.map((member, index) => {
        const todayAttendance = getAttendanceStatus(member);
        const isExpiringSoon =
          member.nextBillDate &&
          dayjs(member.nextBillDate).diff(dayjs(), "day") <= 7;

        return (
          <Card
            key={member._id}
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{member.name}</span>
                <Tag color={member.status === "Active" ? "green" : "red"}>
                  {member.status.toUpperCase()}
                </Tag>
              </div>
            }
            extra={
              <Button
                onClick={() => handleViewMember(member._id)}
                type="link"
                size="small"
                style={{ padding: 0 }}
              >
                View Details
              </Button>
            }
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden",
            }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {isExpiringSoon && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "#f5222d",
                  color: "white",
                  padding: "2px 8px",
                  fontSize: "12px",
                  borderBottomLeftRadius: "8px",
                }}
              >
                Expiring Soon
              </div>
            )}

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Phone">
                {member.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {member.email || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Today's Status">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Tag color={todayAttendance === "present" ? "green" : "red"}>
                    {todayAttendance.toUpperCase()}
                  </Tag>
                  <Switch
                    checked={todayAttendance === "present"}
                    onChange={() =>
                      toggleAttendance(member._id, todayAttendance)
                    }
                    size="small"
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Membership">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{member.membershipType}</span>
                  <Tag color="#108ee9">
                    {member.nextBillDate
                      ? `Expires ${dayjs(member.nextBillDate).format(
                          "DD/MM/YYYY"
                        )}`
                      : "No expiry"}
                  </Tag>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Attendance Score">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Progress
                    percent={member.attendanceScore || 0}
                    size="small"
                    strokeColor={
                      (member.attendanceScore || 0) > 80
                        ? "#52c41a"
                        : (member.attendanceScore || 0) > 50
                        ? "#faad14"
                        : "#f5222d"
                    }
                    format={(percent) => `${Math.round(percent)}%`}
                    style={{ margin: 0, flex: 1 }}
                  />
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {member.attendanceCount || 0}/
                    {member.daysInAnalysisPeriod || 0} days
                  </span>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Tenure">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CalendarOutlined style={{ color: "#1890ff" }} />
                  <span>
                    {member.daysSinceJoining
                      ? `${member.daysSinceJoining} days`
                      : "New member"}
                  </span>
                </div>
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
          className="text-3xl my-2 font-semibold"
          style={{ color: theme.text }}
        >
          Member Dashboard
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
            <Statistic
              title="Today's Attendance"
              value={`${stats.attendanceRate}%`}
              valueStyle={{
                color:
                  stats.attendanceRate > 70
                    ? "#52c41a"
                    : stats.attendanceRate > 40
                    ? "#faad14"
                    : "#f5222d",
              }}
            />
          </Space>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Input
              placeholder="Search members..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: screens.xs ? "100%" : "300px" }}
              allowClear
            />

            <Select
              placeholder="Filter by status"
              style={{ width: screens.xs ? "100%" : 150 }}
              value={filterStatus}
              onChange={setFilterStatus}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Members</Option>
              <Option value="active">Active Only</Option>
              <Option value="inactive">Inactive Only</Option>
            </Select>

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
              type="primary"
              onClick={handleAddMember}
              icon={<UserAddOutlined />}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              }}
            >
              {screens.xs ? "Add" : "Add Membership"}
            </Button>

            {!screens.xs && (
              <>
                <Button
                  type="primary"
                  onClick={fetchTopAttendee}
                  icon={<TrophyOutlined />}
                  style={{
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  }}
                >
                  Top Attendee
                </Button>

                <Button
                  type="primary"
                  onClick={markYesterdayAbsent}
                  icon={<HistoryOutlined />}
                  loading={isMarkingAbsent}
                  style={{
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  }}
                >
                  Mark Absentees
                </Button>
              </>
            )}

            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                setIsLoading(true);
                axios
                  .get("http://localhost:4000/members/all-members", {
                    withCredentials: true,
                  })
                  .then((response) => {
                    const totalMembers = response.data.members.length;
                    const activeMembers = response.data.members.filter(
                      (m) => m.status === "Active"
                    ).length;
                    const attendanceRate = calculateAttendanceRate(
                      response.data.members
                    );

                    setStats({
                      totalMembers,
                      activeMembers,
                      attendanceRate,
                    });

                    setMembers(applyFilters(response.data.members));
                  })
                  .catch((error) => {
                    toast.error("Error refreshing members");
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
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

      {isLoading ? (
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
          renderTableView()
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
              setFilterStatus("all");
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

      {/* Add Membership Modal */}
      <Modal
        title="Add Membership Plan"
        open={isAddMembershipModalVisible}
        onOk={handleMembershipSubmit}
        onCancel={() => setIsAddMembershipModalVisible(false)}
        okText="Add Membership"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          },
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Duration (months)" required>
            <Input
              type="number"
              value={membershipData.months}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  months: e.target.value,
                }))
              }
              placeholder="e.g. 1, 3, 6, 12"
            />
          </Form.Item>
          <Form.Item label="Price ($)" required>
            <Input
              type="number"
              value={membershipData.price}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
              prefix="$"
              placeholder="e.g. 50, 120, 200"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Top Attendee Modal */}
      <Modal
        title="Top Performing Member"
        open={isTopAttendeeModalVisible}
        onCancel={() => setIsTopAttendeeModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsTopAttendeeModalVisible(false)}
          >
            Close
          </Button>,
          topAttendee && (
            <Button
              key="view"
              type="primary"
              onClick={() => {
                setIsTopAttendeeModalVisible(false);
                handleViewMember(topAttendee.memberId);
              }}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              }}
            >
              View Full Profile
            </Button>
          ),
        ]}
        width={800}
      >
        {topAttendee ? (
          <Card
            bordered={false}
            cover={
              <div
                style={{
                  height: "100px",
                  background: `linear-gradient(135deg, ${theme.primary} 0%, #40a9ff 100%)`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TrophyOutlined
                  style={{ fontSize: "48px", color: "#ffd700" }}
                />
              </div>
            }
          >
            <Descriptions title="Member Details" bordered column={2}>
              <Descriptions.Item label="Name">
                <strong>{topAttendee.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {topAttendee.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {topAttendee.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Membership Plan">
                <Tag color="blue">{topAttendee.membershipType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Attendance Rate">
                {topAttendee.attendanceRate}%
              </Descriptions.Item>
              <Descriptions.Item label="Attendance Count">
                <Badge
                  count={topAttendee.attendanceCount}
                  style={{ backgroundColor: theme.primary }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Renewal Consistency">
                <Tag
                  color={
                    topAttendee.renewalConsistency === "Consistent"
                      ? "green"
                      : "orange"
                  }
                >
                  {topAttendee.renewalConsistency}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Renewal">
                {topAttendee.lastRenewalDate
                  ? dayjs(topAttendee.lastRenewalDate).format("MMMM D, YYYY")
                  : "No renewal history"}
              </Descriptions.Item>
              <Descriptions.Item label="Next Bill Date">
                {topAttendee.nextBillDate
                  ? dayjs(topAttendee.nextBillDate).format("MMMM D, YYYY")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    topAttendee.membershipStatus === "Active" ? "green" : "red"
                  }
                >
                  {topAttendee.membershipStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20 }}>
              <h4>Performance Analysis</h4>
              <p>
                This member has demonstrated exceptional commitment with an
                attendance rate of{" "}
                <strong>{topAttendee.attendanceRate}%</strong> over the last 3
                months, making them the most consistent attendee in our gym.
              </p>
              {topAttendee.renewalConsistency && (
                <p>
                  Their renewal behavior is{" "}
                  <strong>
                    {topAttendee.renewalConsistency.toLowerCase()}
                  </strong>
                  .
                  {topAttendee.daysLate && topAttendee.daysLate > 0 ? (
                    <span>
                      {" "}
                      They were typically {topAttendee.daysLate} days late with
                      renewals.
                    </span>
                  ) : (
                    <span> They consistently renew on time.</span>
                  )}
                </p>
              )}
            </div>
          </Card>
        ) : (
          <p>No top attendee data available</p>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default MemberList;
