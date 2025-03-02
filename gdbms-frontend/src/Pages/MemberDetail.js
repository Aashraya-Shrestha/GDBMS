import React, { useState, useEffect } from "react";
import {
  Card,
  Switch,
  Button,
  Select,
  Divider,
  Modal,
  Form,
  Input,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const MemberDetail = () => {
  const [status, setStatus] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [membershipType, setMembershipType] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [member, setMember] = useState(null); // State for storing member details
  const [membershipOptions, setMembershipOptions] = useState([]); // State for membership options
  const navigate = useNavigate();
  const { id } = useParams(); // Get the member ID from the URL

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/members/member-detail/${id}`,
          { withCredentials: true }
        );
        setMember(response.data.member); // Set member data from API response
        setStatus(response.data.status); // Set the status (active or inactive)
      } catch (error) {
        console.error("Error fetching member details:", error);
      }
    };
    fetchMemberDetails();
  }, [id]); // Re-fetch when the memberId changes

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/plans/get-membership",
          { withCredentials: true }
        );
        const memberships = response.data.membership.map((m) => ({
          label: `${m.months} Month Membership - ${m.price}`,
          value: m._id, // Use membership ID here
        }));
        setMembershipOptions(memberships); // Set membership options
      } catch (error) {
        console.error("Error fetching membership options:", error);
      }
    };

    fetchMemberships();
  }, []); // Fetch memberships only once

  const handleRenewClick = () => {
    if (status) setIsRenewing(true);
  };

  const handleMembershipChange = (value) => {
    setMembershipType(value);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/members/renew-membership",
        { memberId: id, membership: membershipType },
        { withCredentials: true }
      );
      setIsRenewing(false);
      setStatus(true); // Assuming status is active after renewal
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error("Error renewing membership:", error);
      alert("Failed to renew membership");
    }
  };

  const showEditModal = () => {
    setIsEditModalVisible(true);
  };

  const handleEditOk = () => {
    setIsEditModalVisible(false);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const goToMemberList = () => {
    navigate("/memberList");
  };

  if (!member) {
    return <div>Loading...</div>; // Render loading state while member data is being fetched
  }

  return (
    <div className="w-5/6 mx-auto p-5">
      <Button onClick={goToMemberList} className="mb-4 bg-gray-300">
        ← Back to Member List
      </Button>
      <Card className="shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-52 h-52 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-lg">Profile Image</span>
          </div>

          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">{member.name}</h2>
            <p className="text-xl text-gray-700">Address: {member.address}</p>
            <p className="text-xl text-gray-700">Phone: {member.phoneNumber}</p>
            <p className="text-xl text-gray-700">
              Membership Type: {member.membershipType}
            </p>
            <p className="text-xl text-gray-700">
              Join Date:{" "}
              {new Date(member.createdAt).toLocaleDateString("en-GB")}
            </p>
            <p className="text-xl text-gray-700">
              Expires On:{" "}
              {new Date(member.nextBillDate).toLocaleDateString("en-GB")}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-xl">Status:</span>
              <Switch checked={status} onChange={() => setStatus(!status)} />
              <span className="text-xl">{status ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex justify-center gap-4">
          {!isRenewing ? (
            <>
              <Button
                type="primary"
                onClick={handleRenewClick}
                className={status ? "bg-blue-600" : "bg-gray-400"}
                disabled={!status}
              >
                Renew Membership
              </Button>
              <Button
                type="default"
                onClick={showEditModal}
                className="border-gray-400"
              >
                Edit Details
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Select
                placeholder="Select Membership Type"
                style={{
                  width: 300, // Making the select box bigger
                  display: "flex", // Align label and price using flex
                  justifyContent: "space-between", // Ensures both label and price are shown clearly
                }}
                onChange={handleMembershipChange}
                size="large"
              >
                {membershipOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div className="flex justify-between w-full">
                      <span>{option.label.split(" - ")[0]}</span>
                      <span className="font-semibold">
                        ${option.label.split(" - ")[1]}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                onClick={handleSave}
                className="bg-green-600"
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <Modal
          title="Edit Member Details"
          open={isEditModalVisible}
          onOk={handleEditOk}
          onCancel={handleEditCancel}
          okText="Save"
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input defaultValue={member.name} />
            </Form.Item>
            <Form.Item label="Address">
              <Input defaultValue={member.address} />
            </Form.Item>
            <Form.Item label="Phone">
              <Input defaultValue={member.phoneNumber} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default MemberDetail;
