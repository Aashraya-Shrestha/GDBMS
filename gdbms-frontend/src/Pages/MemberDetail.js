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
  DatePicker,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const { Option } = Select;

const MemberDetail = () => {
  const [status, setStatus] = useState(true); // Default to true (Active)
  const [isRenewing, setIsRenewing] = useState(false);
  const [membershipType, setMembershipType] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [member, setMember] = useState(null);
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedJoiningDate, setEditedJoiningDate] = useState(dayjs()); // For editing joining date

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/members/member-detail/${id}`,
          { withCredentials: true }
        );
        setMember(response.data.member);
        // Set the status based on the member's status from the backend
        setStatus(response.data.member.status === "Active");
        // Set the edited joining date
        setEditedJoiningDate(dayjs(response.data.member.joiningDate));
      } catch (error) {
        console.error("Error fetching member details:", error);
      }
    };
    fetchMemberDetails();
  }, [id]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/plans/get-membership",
          { withCredentials: true }
        );
        const memberships = response.data.membership.map((m) => ({
          label: `${m.months} Month Membership - ${m.price}`,
          value: m._id,
        }));
        setMembershipOptions(memberships);
      } catch (error) {
        console.error("Error fetching membership options:", error);
      }
    };

    fetchMemberships();
  }, []);

  const handleRenewClick = () => {
    if (status) setIsRenewing(true);
  };

  const handleCancelRenew = () => {
    setIsRenewing(false); // Reset the renewing state
    setMembershipType(null); // Clear the selected membership type
  };

  const handleMembershipChange = (value) => {
    setMembershipType(value);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/members/updatePlan/${id}`,
        { memberId: id, membership: membershipType },
        { withCredentials: true }
      );

      toast.success("Membership has been renewed");

      setTimeout(() => {
        navigate("/memberList");
      }, 2000);
    } catch (error) {
      console.error("Error renewing membership:", error);
      toast.error("Failed to renew membership", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const showEditModal = () => {
    if (member) {
      setEditedName(member.name);
      setEditedPhone(member.phoneNumber);
      setEditedAddress(member.address);
      setEditedJoiningDate(dayjs(member.joiningDate)); // Set the joining date for editing
    }
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const goToMemberList = () => {
    navigate("/memberList");
  };

  const handleStatusChange = async (checked) => {
    try {
      const newStatus = checked ? "Active" : "Inactive";
      const response = await axios.put(
        `http://localhost:4000/members/changeStatus/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      toast.success("Status updated successfully");
      setStatus(checked); // Update local state
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/members/editMember/${id}`,
        {
          name: editedName,
          phoneNumber: editedPhone,
          address: editedAddress,
          joiningDate: editedJoiningDate.toISOString(), // Send the updated joining date
        },
        { withCredentials: true }
      );

      setMember({
        ...member,
        name: editedName,
        phoneNumber: editedPhone,
        address: editedAddress,
        joiningDate: editedJoiningDate.toISOString(), // Update the joining date in local state
      });

      toast.success("Member details updated successfully");
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating member details:", error);
      toast.error("Failed to update member details");
    }
  };

  if (!member) {
    return <div>Loading...</div>;
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
              {new Date(member.joiningDate).toLocaleDateString("en-GB")}{" "}
              {/* Updated */}
            </p>
            <p className="text-xl text-gray-700">
              Expires On:{" "}
              {new Date(member.nextBillDate).toLocaleDateString("en-GB")}{" "}
              {/* Updated */}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-xl">Status:</span>
              <Switch checked={status} onChange={handleStatusChange} />
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
                  width: 300,
                  display: "flex",
                  justifyContent: "space-between",
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
              <div className="flex gap-4">
                <Button
                  type="primary"
                  onClick={handleSave}
                  className="bg-green-600"
                >
                  Save
                </Button>
                <Button
                  type="default"
                  onClick={handleCancelRenew}
                  className="border-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <Modal
          title="Edit Member Details"
          open={isEditModalVisible}
          onOk={handleEditSave}
          onCancel={handleEditCancel}
          okText="Save"
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Address">
              <Input
                value={editedAddress}
                onChange={(e) => setEditedAddress(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Phone">
              <Input
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Joining Date">
              <DatePicker
                value={editedJoiningDate}
                onChange={(date) => setEditedJoiningDate(date)}
                format="YYYY-MM-DD"
                className="w-full"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default MemberDetail;
