import React, { useState } from "react";
import { Row, Col, Modal, Form, Input, Select, Button } from "antd";
import ListCard from "../Components/ListCard";

const dummyMembers = [
  {
    _id: "1",
    name: "John Doe",
    email: "NewYork",
    phoneNumber: "123-456-7890",
    memberType: "2 month",
    joinDate: "2023-05-20",
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "Jawalakhel",
    phoneNumber: "987-654-3210",
    memberType: "1 month",
    joinDate: "2022-11-15",
  },
];

const ColStyles = {
  padding: "10px",
  borderLeft: "1px solid white",
  textAlign: "center",
};

const MemberList = ({ members = dummyMembers, memberTypeOptions }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddMembershipModalVisible, setIsAddMembershipModalVisible] =
    useState(false);
  const [editMemberData, setEditMemberData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipData, setMembershipData] = useState({
    month: "",
    price: "",
  });

  const showEditModal = (member) => {
    setEditMemberData(member);
    setIsEditModalVisible(true);
  };

  const showDeleteConfirmation = (id) => {
    setIsDeleteModalVisible(true);
  };

  const handleEditMember = () => {
    setIsEditModalVisible(false);
  };

  const handleDeleteMember = () => {
    setIsDeleteModalVisible(false);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
    setIsAddMembershipModalVisible(false);
  };

  const handleAddMember = () => {
    setIsAddMembershipModalVisible(true);
  };

  const handleMembershipSubmit = () => {
    console.log("New Membership Added: ", membershipData);
    setIsAddMembershipModalVisible(false);
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
          "Edit Member",
          "Delete Member",
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
            email={item.email}
            phoneNumber={item.phoneNumber}
            memberType={item.memberType}
            joinDate={new Date(item.joinDate).toLocaleDateString()}
            editMember={() => showEditModal(item)}
            deleteMember={() => showDeleteConfirmation(item._id)}
          />
        ))
      ) : (
        <p>No members available</p>
      )}

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member"
        open={isEditModalVisible}
        onOk={handleEditMember}
        onCancel={handleCancel}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input
              value={editMemberData.name}
              onChange={(e) =>
                setEditMemberData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={editMemberData.email}
              onChange={(e) =>
                setEditMemberData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Phone Number">
            <Input
              value={editMemberData.phoneNumber}
              onChange={(e) =>
                setEditMemberData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>

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
              value={membershipData.month}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  month: e.target.value,
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
    </div>
  );
};

export default MemberList;
