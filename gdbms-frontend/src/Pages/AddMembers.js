import React, { useState, useEffect } from "react";
import { Select, Button, DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import axios from "axios";

const AddMemberForm = () => {
  const [memberInfo, setMemberInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    joiningDate: dayjs(),
    memberType: "",
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

  const handleDateChange = (date) => {
    setMemberInfo((prev) => ({ ...prev, joiningDate: date }));
  };

  const handleSubmit = async () => {
    try {
      const { name, phoneNumber, address, memberType, joiningDate } =
        memberInfo;
      const memberData = {
        name,
        phoneNumber,
        address,
        membership: memberType, // Send the membership ID selected
        joiningDate: joiningDate.format("YYYY-MM-DD"),
      };

      const response = await axios.post(
        "http://localhost:4000/members/add-members",
        memberData,
        { withCredentials: true }
      );
      toast.success(response.data.message); // Success toast
      setMemberInfo({
        name: "",
        phoneNumber: "",
        address: "",
        joiningDate: dayjs(),
        memberType: "",
      });
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "A memebr with this number already exists"
      ); // Error toast
    }
  };

  return (
    <div className="flex items-center justify-center w-5/6 min-h-screen bg-gray-500 p-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full flex flex-col gap-6 max-w-2xl bg-gray-800 p-12 rounded-lg shadow-lg">
        <div className="w-full text-center">
          <h2 className="text-4xl font-semibold mb-2 text-white">
            Add a Member
          </h2>
          <p className="text-md text-gray-400">
            Please enter the member details
          </p>
        </div>
        <input
          type="text"
          name="name"
          value={memberInfo.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full text-black py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          type="tel"
          name="phoneNumber"
          value={memberInfo.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full text-black py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="address"
          value={memberInfo.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full text-black py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <DatePicker
          value={memberInfo.joiningDate}
          onChange={handleDateChange}
          className="w-full py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <Select
          placeholder="Select Membership Type"
          options={membershipOptions}
          value={memberInfo.memberType}
          onChange={handleSelectChange}
          className="w-full bg-white text-black rounded-lg"
          dropdownStyle={{ backgroundColor: "white", color: "black" }}
          style={{ backgroundColor: "white", color: "black" }}
        />
        <Button
          type="primary"
          onClick={handleSubmit}
          style={{
            width: "100%",
            backgroundColor: "#2563eb",
            borderColor: "#2563eb",
          }}
        >
          Add Member
        </Button>
      </div>
    </div>
  );
};

export default AddMemberForm;
