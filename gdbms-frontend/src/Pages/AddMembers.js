import React, { useState, useEffect } from "react";
import { Select, Button, DatePicker, Form, Input } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import axios from "axios";
import "../Styles/AddMemberForm.css";

const { RangePicker } = DatePicker;

const AddMemberForm = () => {
  const [form] = Form.useForm();
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/plans/get-membership",
          { withCredentials: true }
        );
        const memberships = response.data.membership.map((m) => ({
          label: `${m.months} Month Membership - $${m.price}`,
          value: m._id,
        }));
        setMembershipOptions(memberships);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load memberships"
        );
      }
    };

    fetchMemberships();
  }, []);

  const handleSubmit = async (values) => {
    setIsSubmitting(true); // Start loading
    try {
      const { name, email, phoneNumber, address, memberType, joiningDate } =
        values;

      const formattedJoiningDate = joiningDate.toISOString();

      const memberData = {
        name,
        email,
        phoneNumber,
        address,
        membership: memberType,
        joiningDate: formattedJoiningDate,
      };

      const response = await axios.post(
        "http://localhost:4000/members/add-members",
        memberData,
        { withCredentials: true }
      );

      toast.success(response.data.message);
      form.resetFields();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add member"
      );
    } finally {
      setIsSubmitting(false); // End loading regardless of success/error
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100 p-6 relative overflow-hidden">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full flex flex-col gap-6 max-w-2xl bg-white p-8 rounded-lg shadow-md relative z-10">
        <div className="w-full text-center">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Add a Member
          </h2>
          <p className="text-sm text-gray-600">
            Please enter the member details below.
          </p>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {/* Name Input */}
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the member's name" },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Name should only contain letters and spaces",
              },
            ]}
          >
            <Input
              placeholder="Enter full name"
              className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          {/* Email Input */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter the member's email" },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              placeholder="Enter email address"
              className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          {/* Phone Number Input */}
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter the phone number" },
              {
                pattern: /^\d{10}$/,
                message: "Phone number must be exactly 10 digits",
              },
            ]}
          >
            <Input
              placeholder="Enter phone number"
              className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          {/* Address Input */}
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please enter the address" }]}
          >
            <Input
              placeholder="Enter address"
              className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          {/* Joining Date Input */}
          <Form.Item
            label="Joining Date"
            name="joiningDate"
            rules={[
              { required: true, message: "Please select the joining date" },
            ]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          {/* Membership Type Select */}
          <Form.Item
            label="Membership Type"
            name="memberType"
            rules={[
              { required: true, message: "Please select a membership type" },
            ]}
          >
            <Select
              placeholder="Select membership type"
              options={membershipOptions}
              className="w-full"
              dropdownStyle={{ backgroundColor: "white" }}
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              loading={isSubmitting} // Add loading state to button
              disabled={isSubmitting} // Disable button when loading
            >
              {isSubmitting ? "Adding Member..." : "Add Member"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddMemberForm;
