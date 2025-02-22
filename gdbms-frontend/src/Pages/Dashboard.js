import React from "react";
import Avatar from "@mui/material/Avatar";
import CardComponent from "../Components/Card";
import { Row } from "antd";
import {
  PeopleAlt as PeopleAltIcon,
  BarChart as BarChartIcon,
  NotificationImportant as NotificationImportantIcon,
  AccessAlarms as AccessAlarmsIcon,
  Report as ReportIcon,
  AcUnit as SevereColdIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const cardData = [
    { title: "Joined Members", ImageIcon: PeopleAltIcon, path: "/memberList" },
    {
      title: "Joined This Month",
      ImageIcon: BarChartIcon,
      path: "/specific/monthly",
      value: "monthly",
    },
    {
      title: "Expiring in 3 Days",
      ImageIcon: NotificationImportantIcon,
      path: "/specific/expiring-within-3days",
      value: "threeDays",
    },
    {
      title: "Expiring This Week",
      ImageIcon: AccessAlarmsIcon,
      path: "/specific/expiring-this-week",
      value: "thisWeek",
    },
    {
      title: "Expired Memberships",
      ImageIcon: ReportIcon,
      path: "/specific/expired",
      value: "expired",
    },
    {
      title: "Inactive Members",
      ImageIcon: SevereColdIcon,
      path: "/specific/inactive",
      value: "inactive",
    },
  ];

  const handleCardClick = (path, value) => {
    // If path starts with '/specific', set sessionStorage
    if (path.startsWith("/specific") && value) {
      handleOnClickMenu(value);
    }
    navigate(path);
  };

  const handleOnClickMenu = (value) => {
    sessionStorage.setItem("func", value);
  };

  return (
    <div className="w-5/6 text-black p-5 relative">
      {/* Header Section */}
      <div className="w-full bg-slate-800 text-white rounded-lg flex p-3 justify-between items-center">
        <div className="font-normal text-xl">Hello Admin!</div>
        <div className="w-10 h-10 rounded-3xl border-1 bg-white">
          <Avatar />
        </div>
      </div>

      {/* Cards Section (3 Per Row) */}
      <Row gutter={[16, 16]} className="mt-4">
        {cardData.map((card, index) => (
          <CardComponent
            key={index}
            title={card.title}
            onClick={() => handleCardClick(card.path, card.value)}
            ImageIcon={(props) => (
              <card.ImageIcon {...props} className="font-50px text-gray-700" />
            )}
          />
        ))}
      </Row>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full md:w-auto text-black text-center border rounded-lg p-3 bg-white shadow-md">
        Contact us at: 98735456732 for any inquiries
      </div>
    </div>
  );
};

export default Dashboard;
