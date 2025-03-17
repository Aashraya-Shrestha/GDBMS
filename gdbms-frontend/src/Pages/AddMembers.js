import React, { useState, useEffect } from "react";
import { Select, Button, DatePicker } from "antd"; // Import DatePicker from Ant Design
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import axios from "axios";
import "../Styles/AddMemberForm.css"; // Import a CSS file for the floating shapes

const { RangePicker } = DatePicker;

const AddMemberForm = () => {
  const [memberInfo, setMemberInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    joiningDate: dayjs(), // Default to today's date
    memberType: "Add membership type",
  });

  const [membershipOptions, setMembershipOptions] = useState([]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/plans/get-membership",
          { withCredentials: true }
        );
        const memberships = response.data.membership.map((m) => ({
          label: `${m.months} Month Membership - $${m.price}`,
          value: m._id, // Use membership ID here
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setMemberInfo((prev) => ({ ...prev, memberType: value }));
  };

  // Handle joining date change
  const handleJoiningDateChange = (date) => {
    setMemberInfo((prev) => ({ ...prev, joiningDate: date }));
  };

  const handleSubmit = async () => {
    try {
      const { name, phoneNumber, address, memberType, joiningDate } =
        memberInfo;

      // Format the joiningDate to ISO string
      const formattedJoiningDate = joiningDate.toISOString();

      const memberData = {
        name,
        phoneNumber,
        address,
        membership: memberType,
        joiningDate: formattedJoiningDate, // Include joiningDate in the request
      };

      const response = await axios.post(
        "http://localhost:4000/members/add-members",
        memberData,
        { withCredentials: true }
      );
      toast.success(response.data.message);

      // Reset form fields
      setMemberInfo({
        name: "",
        phoneNumber: "",
        address: "",
        joiningDate: dayjs(), // Reset to today's date
        memberType: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "A member with this number already exists"
      );
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100 p-6 relative overflow-hidden">
      {/* Floating Shapes */}
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

        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={memberInfo.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Number Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={memberInfo.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={memberInfo.address}
            onChange={handleChange}
            placeholder="Enter address"
            className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Joining Date Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Joining Date
          </label>
          <DatePicker
            value={memberInfo.joiningDate}
            onChange={handleJoiningDateChange}
            className="w-full"
            format="YYYY-MM-DD" // Format the date display
          />
        </div>

        {/* Membership Type Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Membership Type
          </label>
          <Select
            placeholder="Select membership type"
            options={membershipOptions}
            value={memberInfo.memberType}
            onChange={handleSelectChange}
            className="w-full"
            dropdownStyle={{ backgroundColor: "white" }}
            style={{ width: "100%" }}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Add Member
        </Button>
      </div>
    </div>
  );
};

export default AddMemberForm;
