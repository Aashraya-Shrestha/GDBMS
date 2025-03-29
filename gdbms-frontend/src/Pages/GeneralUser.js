import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button, Switch, Tag } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

const GeneralUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [header, setHeader] = useState("General Users");
  const [members, setMembers] = useState([]);
  const [today] = useState(dayjs().format("YYYY-MM-DD"));

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
      <ToastContainer />
    </div>
  );
};

export default GeneralUser;
