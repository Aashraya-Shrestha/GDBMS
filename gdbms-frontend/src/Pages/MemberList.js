import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Form, Input, Button, Switch, Tag } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

const ColStyles = {
  padding: "10px",

  textAlign: "center",
};

const MemberList = () => {
  const [isAddMembershipModalVisible, setIsAddMembershipModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipData, setMembershipData] = useState({
    months: "",
    price: "",
  });
  const [members, setMembers] = useState([]);
  const [today] = useState(dayjs().format("YYYY-MM-DD"));
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the filter is set to "active"
  const showActiveMembers = location.state?.filter === "active";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/members/all-members",
          {
            withCredentials: true,
          }
        );
        // Filter out inactive members if showActiveMembers is true
        const filteredMembers = showActiveMembers
          ? response.data.members.filter((member) => member.status === "Active")
          : response.data.members;
        setMembers(filteredMembers);
      } catch (error) {
        toast.error("Error fetching members");
      }
    };
    fetchMembers();
  }, [showActiveMembers]);

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

  const toggleAttendance = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "present" ? "absent" : "present";

      await axios.post(
        `http://localhost:4000/members/mark-attendance/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      // Update local state
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member._id === id) {
            // Find today's attendance record
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

  // Filter members based on search query
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
      </div>
      <Row
        style={{
          backgroundColor: "#1e2837",
          textAlign: "center",
          color: "white",
          fontWeight: "bold",
          padding: "10px",
          gap: "16px",
        }}
      >
        {[
          "Index",
          "Members Name",
          "Address",
          "Phone Number",
          "Today's Attendance",
          "Expiring Date",
          "Member Details",
        ].map((header, index) => (
          <Col key={index} span={index === 4 ? 4 : 3} style={ColStyles}>
            {header}
          </Col>
        ))}
      </Row>
      {filteredMembers.length > 0 ? (
        filteredMembers.map((item, index) => {
          // Find today's attendance record
          const todayAttendance = item.attendance?.find(
            (record) => dayjs(record.date).format("YYYY-MM-DD") === today
          ) || { status: "hasnt checked in" };

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
              attendanceStatus={todayAttendance.status}
              onToggleAttendance={() =>
                toggleAttendance(item._id, todayAttendance.status)
              }
            />
          );
        })
      ) : (
        <p>No members available</p>
      )}
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
      <ToastContainer />
    </div>
  );
};

export default MemberList;
