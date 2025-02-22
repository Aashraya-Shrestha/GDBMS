import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const MemberDetail = () => {
  const [status, setStatus] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [membershipType, setMembershipType] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleRenewClick = () => {
    if (status) setIsRenewing(true);
  };

  const handleMembershipChange = (value) => {
    setMembershipType(value);
  };

  const handleSave = () => {
    console.log("Membership renewed to:", membershipType);
    setIsRenewing(false);
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
            <h2 className="text-3xl font-bold">John Doe</h2>
            <p className="text-xl text-gray-700">Address: New York</p>
            <p className="text-xl text-gray-700">Phone: 123-456-7890</p>
            <p className="text-xl text-gray-700">Membership Type: 2 Month</p>
            <p className="text-xl text-gray-700">Join Date: 2023-05-20</p>
            <p className="text-xl text-gray-700">Expires On: 2024-05-20</p>

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
                style={{ width: 200 }}
                onChange={handleMembershipChange}
              >
                <Option value="1 Month">1 Month</Option>
                <Option value="3 Months">3 Months</Option>
                <Option value="6 Months">6 Months</Option>
                <Option value="1 Year">1 Year</Option>
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
              <Input defaultValue="John Doe" />
            </Form.Item>
            <Form.Item label="Address">
              <Input defaultValue="New York" />
            </Form.Item>
            <Form.Item label="Phone">
              <Input defaultValue="123-456-7890" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default MemberDetail;
