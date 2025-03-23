import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Form, Input, Button } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const ColStyles = {
  padding: "10px",
  borderLeft: "1px solid white",
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
          color: "white",
          fontWeight: "bold",
          padding: "10px",
        }}
      >
        {[
          "Index",
          "Members Name",
          "Address",
          "Phone Number",
          "Expiring Date",
          "Member Details",
        ].map((header, index) => (
          <Col key={index} span={4} style={ColStyles}>
            {header}
          </Col>
        ))}
      </Row>
      {filteredMembers.length > 0 ? (
        filteredMembers.map((item, index) => (
          <ListCard
            key={item._id}
            index={index + 1} // Start indexing from 1
            name={item.name}
            address={item.address}
            phoneNumber={item.phoneNumber}
            expireDate={
              item.nextBillDate
                ? new Date(item.nextBillDate).toLocaleDateString("en-GB")
                : "N/A"
            }
            memberDetail={() => handleViewMember(item._id)}
          />
        ))
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
