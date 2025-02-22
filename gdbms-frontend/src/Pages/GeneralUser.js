import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate } from "react-router-dom";

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

const GeneralUser = ({ members = dummyMembers }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [header, setHeader] = useState("General Users");

  useEffect(() => {
    const func = sessionStorage.getItem("func");
    functionCall(func);
  }, []);

  const functionCall = (func) => {
    switch (func) {
      case "monthly":
        setHeader("Joined this month");
        break;
      case "threeDays":
        setHeader("Expiring within three days");
        break;
      case "thisWeek":
        setHeader("Expiring within this week");
        break;
      case "expired":
        setHeader("Expired Memberships");
        break;
      case "inactive":
        setHeader("Inactive Memberships");
        break;
      default:
        setHeader("General Users");
    }
  };

  const handleViewMember = () => {
    navigate("/member/123");
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 flex-row bg-slate-100 px-4">
      <h1 className="text-black text-3xl my-5 font-semibold">{header}</h1>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "60%" }}
        />
      </div>
      <Row className="bg-gray-800 text-white font-bold p-2">
        {[
          "Index",
          "Member Name",
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
        <p className="text-center mt-4">No members available</p>
      )}
    </div>
  );
};

export default GeneralUser;
