import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Modal,
  Form,
  Input,
  Button,
  Switch,
  Tag,
  Card,
  Descriptions,
  message,
} from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

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
  const navigate = useNavigate();
  const location = useLocation();

  // Column configuration
  const columns = [
    { title: "Index", width: 80 },
    { title: "Member's Name", width: 200 },
    { title: "Address", width: 200 },
    { title: "Phone Number", width: 150 },
    { title: "Today's Attendance", width: 250 },
    { title: "Expiring Date", width: 150 },
    { title: "Actions", width: 150 },
  ];

  const showActiveMembers = location.state?.filter === "active";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/members/all-members",
          { withCredentials: true }
        );
        let filteredMembers = showActiveMembers
          ? response.data.members.filter((member) => member.status === "Active")
          : response.data.members;

        // Check if any members need to be marked as absent
        const now = new Date();
        const cutoffHour = 20; // 8 PM cutoff time
        const shouldMarkAbsent = now.getHours() >= cutoffHour;

        if (shouldMarkAbsent) {
          // Filter members who haven't checked in today
          const membersToMarkAbsent = filteredMembers.filter((member) => {
            const todayRecord = member.attendance?.find(
              (record) => dayjs(record.date).format("YYYY-MM-DD") === today
            );
            return !todayRecord || todayRecord.status === "hasnt checked in";
          });

          // Mark them as absent in the database
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
                  console.error(
                    `Failed to mark ${member.name} as absent:`,
                    error
                  );
                }
              })
            );

            // Refetch members to get updated attendance records
            const updatedResponse = await axios.get(
              "http://localhost:4000/members/all-members",
              { withCredentials: true }
            );
            filteredMembers = showActiveMembers
              ? updatedResponse.data.members.filter(
                  (member) => member.status === "Active"
                )
              : updatedResponse.data.members;
          }
        }

        setMembers(filteredMembers);
      } catch (error) {
        toast.error("Error fetching members");
      }
    };
    fetchMembers();
  }, [showActiveMembers]);

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

      // Get all active members
      const response = await axios.get(
        "http://localhost:4000/members/all-members",
        { withCredentials: true }
      );

      const activeMembers = response.data.members.filter(
        (member) => member.status === "Active"
      );

      // Filter members who didn't check in yesterday
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

      // Mark them as absent in the database
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

      // Refetch members to get updated attendance records
      const updatedResponse = await axios.get(
        "http://localhost:4000/members/all-members",
        { withCredentials: true }
      );

      const filteredMembers = showActiveMembers
        ? updatedResponse.data.members.filter(
            (member) => member.status === "Active"
          )
        : updatedResponse.data.members;

      setMembers(filteredMembers);
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

  const handleCancel = () => {
    setIsAddMembershipModalVisible(false);
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

    // If no record exists, default to "hasnt checked in"
    if (!todayRecord) return "hasnt checked in";

    return todayRecord.status;
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
            const todayRecordIndex = member.attendance.findIndex(
              (record) => dayjs(record.date).format("YYYY-MM-DD") === today
            );

            const updatedAttendance = [...member.attendance];
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
    <div className="flex-1 flex-row px-4 pb-4">
      <h1 className="text-black text-3xl my-5 font-semibold">Member List</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "60%" }}
        />
        <Button
          type="primary"
          onClick={handleAddMember}
          style={{ backgroundColor: "#1e2837", borderColor: "#1e2837" }}
        >
          Add Membership
        </Button>
        <Button
          type="primary"
          onClick={fetchTopAttendee}
          style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
        >
          Show Top Attendee
        </Button>
        <Button
          type="primary"
          onClick={markYesterdayAbsent}
          style={{ backgroundColor: "#f39c12", borderColor: "#f39c12" }}
          loading={isMarkingAbsent}
        >
          Mark Yesterday's Absentees
        </Button>
      </div>

      {/* Header Row */}
      <Row
        style={{
          backgroundColor: "#1e2837",
          color: "white",
          fontWeight: "bold",
          padding: "12px 0",
          margin: 0,
          width: "100%",
          display: "flex",
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
            }}
          >
            {col.title}
          </Col>
        ))}
      </Row>

      {/* Member Rows */}
      {filteredMembers.length > 0 ? (
        filteredMembers.map((item, index) => {
          const todayAttendance = getAttendanceStatus(item);

          return (
            <ListCard
              key={item._id}
              index={index + 1}
              name={item.name}
              address={item.address}
              phoneNumber={item.phoneNumber}
              expireDate={
                item.nextBillDate
                  ? new Date(item.nextBillDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
              memberDetail={() => handleViewMember(item._id)}
              attendanceStatus={todayAttendance}
              onToggleAttendance={() =>
                toggleAttendance(item._id, todayAttendance)
              }
              colWidths={columns.map((col) => col.width)}
            />
          );
        })
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#EAF1F1",
            borderBottom: "1px solid lightgray",
          }}
        >
          No members available
        </div>
      )}

      {/* Add Membership Modal */}
      <Modal
        title="Add Membership"
        open={isAddMembershipModalVisible}
        onOk={handleMembershipSubmit}
        onCancel={handleCancel}
        okText="Add Membership"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Month">
            <Input
              value={membershipData.months}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  months: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Price">
            <Input
              value={membershipData.price}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
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
            >
              View Full Profile
            </Button>
          ),
        ]}
        width={800}
      >
        {topAttendee ? (
          <Card>
            <Descriptions title="Member Details" bordered column={2}>
              <Descriptions.Item label="Name">
                {topAttendee.name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {topAttendee.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {topAttendee.email}
              </Descriptions.Item>
              <Descriptions.Item label="Membership Plan">
                {topAttendee.membershipType}
              </Descriptions.Item>
              <Descriptions.Item label="Attendance Rate">
                {topAttendee.attendanceRate}%
              </Descriptions.Item>
              <Descriptions.Item label="Attendance Count">
                {topAttendee.attendanceCount} days
              </Descriptions.Item>
              <Descriptions.Item label="Renewal Consistency">
                {topAttendee.renewalConsistency}
              </Descriptions.Item>
              <Descriptions.Item label="Last Renewal">
                {topAttendee.lastRenewalDate
                  ? dayjs(topAttendee.lastRenewalDate).format("MMMM D, YYYY")
                  : "No renewal history"}
              </Descriptions.Item>
              <Descriptions.Item label="Next Bill Date">
                {topAttendee.nextBillDate
                  ? dayjs(topAttendee.nextBillDate)
                      .add(1, "day")
                      .format("MMMM D, YYYY")
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
                This member has the highest attendance rate (
                {topAttendee.attendanceRate}%) among all active members in the
                last 3 months.
              </p>
              {topAttendee.renewalConsistency && (
                <p>
                  Their renewal behavior is{" "}
                  {topAttendee.renewalConsistency.toLowerCase()}.
                  {topAttendee.daysLate && topAttendee.daysLate > 0 && (
                    <span>
                      {" "}
                      They were {topAttendee.daysLate} days late in their last
                      renewal.
                    </span>
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
