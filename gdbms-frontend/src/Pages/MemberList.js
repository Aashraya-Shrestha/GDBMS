import React, { useState } from "react";
import { Row, Col, Modal, Form, Input, Button } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const dummyMembers = [
  {
    _id: "1",
    name: "John Doe",
    address: "NewYork",
    phoneNumber: "123-456-7890",
    memberType: "2 month",
    joinDate: "2023-05-20",
    expireDate: "2023-08-20",
  },
  {
    _id: "2",
    name: "Jane Smith",
    address: "Jawalakhel",
    phoneNumber: "987-654-3210",
    memberType: "1 month",
    joinDate: "2022-11-15",
    expireDate: "2022-12-15",
  },
];

const ColStyles = {
  padding: "10px",
  borderLeft: "1px solid white",
  textAlign: "center",
};

const MemberList = ({ members = dummyMembers, memberTypeOptions }) => {
  const [isAddMembershipModalVisible, setIsAddMembershipModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipData, setMembershipData] = useState({
    months: "",
    price: "",
  });
  const navigate = useNavigate();

  const handleViewMember = () => {
    navigate("/member/123");
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
        membershipData, // Pass membershipData correctly
        { withCredentials: true }
      );
      toast.success(response.data.message); // Use the success message from the response
      setIsAddMembershipModalVisible(false); // Close the modal after success
    } catch (error) {
      toast.error(
        "Error adding membership: " +
          (error.response ? error.response.data.error : error.message)
      );
    }
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 flex-row bg-slate-100 px-4">
      <h1 className="text-black text-3xl my-5 font-semibold">Member List</h1>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "60%" }}
        />
        <Button
          type="primary"
          onClick={handleAddMember}
          style={{
            backgroundColor: "#1e2837",
            borderColor: "#1e2837",
          }}
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
          "Membership Type",
          "Join Date",
          "Expiring Date",
          "Member Details",
        ].map((header, index) => (
          <Col key={index} span={3} style={ColStyles}>
            {header}
          </Col>
        ))}
      </Row>

      {filteredMembers.length > 0 ? (
        filteredMembers.map((item, index) => (
          <ListCard
            key={item._id}
            index={index}
            name={item.name}
            address={item.address}
            phoneNumber={item.phoneNumber}
            memberType={item.memberType}
            joinDate={new Date(item.joinDate).toLocaleDateString()}
            expireDate={item.expireDate}
            memberDetail={() => handleViewMember(item._id)}
          />
        ))
      ) : (
        <p>No members available</p>
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
      <ToastContainer />
    </div>
  );
};

export default MemberList;
