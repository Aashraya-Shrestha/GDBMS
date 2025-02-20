import React, { useState } from "react";
import { Select, Button, DatePicker } from "antd";
import dayjs from "dayjs";

const AddMemberForm = ({ handleAddMember }) => {
  const [memberInfo, setMemberInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    joinDate: dayjs(),
    memberType: "1 Month",
  });

  const membershipOptions = [
    { label: "1 Month Membership", value: "1 Month" },
    { label: "2 Month Membership", value: "2 Month" },
    { label: "3 Month Membership", value: "3 Month" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setMemberInfo((prev) => ({ ...prev, memberType: value }));
  };

  const handleDateChange = (date) => {
    setMemberInfo((prev) => ({ ...prev, joinDate: date }));
  };

  const handleSubmit = () => {
    const { name, phoneNumber, address, memberType } = memberInfo;
    if (!name || !phoneNumber || !address || !memberType) {
      return;
    }
    handleAddMember(memberInfo);

    setMemberInfo({
      name: "",
      phoneNumber: "",
      address: "",
      joinDate: dayjs(),
      memberType: "1 Month",
    });
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-500 p-10">
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
          className="w-full text-white py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          type="tel"
          name="phoneNumber"
          value={memberInfo.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full text-white py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="address"
          value={memberInfo.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full text-white py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <DatePicker
          value={memberInfo.joinDate}
          onChange={handleDateChange}
          className="w-full  py-4 px-5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <Select
          placeholder="Select Membership Type"
          options={membershipOptions}
          value={memberInfo.memberType}
          onChange={handleSelectChange}
          className="w-full bg-gray-700 text-white rounded-lg"
          dropdownStyle={{ backgroundColor: "#1f2937", color: "white" }}
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
