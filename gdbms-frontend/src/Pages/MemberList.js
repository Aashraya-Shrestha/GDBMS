import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
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
} from "antd";
import ListCard from "../Components/ListCard";
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
} from "@ant-design/icons";

const { Option } = Select;

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
  const navigate = useNavigate();

  const theme = {
    primary: "#1890ff",
    secondary: "#f0f2f5",
    text: "rgba(0, 0, 0, 0.85)",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    border: "#d9d9d9",
  };

  const columns = [
    { title: "Index", width: 80 },
    { title: "Member's Name", width: 200 },
    { title: "Address", width: 200 },
    { title: "Phone Number", width: 150 },
    { title: "Today's Attendance", width: 250 },
    { title: "Expiring Date", width: 150 },
    { title: "Actions", width: 150 },
  ];

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

  return (
    <div
      className="flex-1 flex-col px-4 pb-4"
      style={{ backgroundColor: theme.secondary }}
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
              style={{ width: "300px" }}
              allowClear
            />

            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={setFilterStatus}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Members</Option>
              <Option value="active">Active Only</Option>
              <Option value="inactive">Inactive Only</Option>
            </Select>

            <Button
              type="primary"
              onClick={handleAddMember}
              icon={<UserAddOutlined />}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              }}
            >
              Add Membership
            </Button>

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
        filteredMembers.map((item, index) => {
          const todayAttendance = getAttendanceStatus(item);
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
              attendanceStatus={todayAttendance}
              onToggleAttendance={() =>
                toggleAttendance(item._id, todayAttendance)
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
