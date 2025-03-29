import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button, Switch, Tag } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

const ColStyles = {
  padding: "10px",
  borderLeft: "1px solid white",
  textAlign: "center",
};

const GeneralUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [header, setHeader] = useState("General Users");
  const [members, setMembers] = useState([]);
  const [today] = useState(dayjs().format("YYYY-MM-DD"));

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
      setMembers(response.data.members || response.data.members);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
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
        { status: newStatus },
        { withCredentials: true }
      );

      // Update local state
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member._id === memberId) {
            // Find today's attendance record
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

  const getAttendanceTagColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      default:
        return "orange";
    }
  };

  return (
    <div className="flex-1 flex-row px-4 pb-4">
      <h1 className="text-black text-3xl my-5 font-semibold text-center">
        {header}
      </h1>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          justifyContent: "center",
        }}
      >
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "60%" }}
        />
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
          "Member Name",
          "Address",
          "Phone Number",
          "Today's Attendance",
          "Expiring Date",
          "Details",
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
        <p className="text-center py-4">No members available</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default GeneralUser;
