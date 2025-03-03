import React, { useEffect, useState } from "react";
import { Row, Col, Input } from "antd";
import ListCard from "../Components/ListCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GeneralUser = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [header, setHeader] = useState("General Users");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const func = sessionStorage.getItem("func");
    functionCall(func);
    fetchMembers(func);
  }, []);

  const functionCall = (func) => {
    const headers = {
      monthly: "Joined This Month",
      threeDays: "Expiring Within Three Days",
      thisWeek: "Expiring Within This Week",
      expired: "Expired Memberships",
      inactive: "Inactive Memberships",
    };
    setHeader(headers[func] || "General Users");
  };

  const fetchMembers = async (func) => {
    const endpoints = {
      monthly: "http://localhost:4000/members/monthly-members",
      threeDays: "http://localhost:4000/members/expiring-within-3-days",
      thisWeek: "http://localhost:4000/members/expiring-within-4to7-days",
      expired: "http://localhost:4000/members/expiredMemberships",
      inactive: "http://localhost:4000/members/inactiveMembers",
    };

    const endpoint =
      endpoints[func] || "http://localhost:4000/members/all-members";
    try {
      const response = await axios.get(endpoint, { withCredentials: true });
      setMembers(response.data.members);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleViewMember = (id) => {
    navigate(`/member/${id}`);
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 bg-slate-100 px-6 py-4">
      <h1 className="text-black text-3xl font-semibold mb-6 text-center">
        {header}
      </h1>
      <div className="flex justify-center mb-6">
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "50%", padding: "10px" }}
        />
      </div>
      <div className="bg-gray-800 text-white font-bold text-lg rounded-t-md overflow-hidden">
        <Row className="p-3 text-center gap-14">
          {[
            "Index",
            "Member Name",
            "Address",
            "Phone Number",
            "Expiring Date",
            "Details",
          ].map((header, index) => (
            <Col
              key={index}
              span={3}
              className="px-2 py-1 border-r last:border-r-0"
            >
              {header}
            </Col>
          ))}
        </Row>
      </div>
      <div className="bg-white divide-y divide-gray-300 rounded-b-md">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((item, index) => (
            <ListCard
              key={item._id}
              index={index + 1} // Start index from 1
              name={item.name}
              address={item.address}
              phoneNumber={item.phoneNumber}
              expireDate={
                item.nextBillDate
                  ? new Date(item.nextBillDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
              memberDetail={() => handleViewMember(item._id)}
            />
          ))
        ) : (
          <p className="text-center py-4">No members available</p>
        )}
      </div>
    </div>
  );
};

export default GeneralUser;
