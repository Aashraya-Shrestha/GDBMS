import React from "react";
import {
  DesktopOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const SideBar = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = [
    { label: "Dashboard", path: "/dashboard", icon: <PieChartOutlined /> },
    { label: "Add Members", path: "/addMember", icon: <DesktopOutlined /> },
    { label: "Member List", path: "/memberList", icon: <TeamOutlined /> },
    { label: "Trainer List", path: "/trainerList", icon: <TeamOutlined /> },
    { label: "Profile", path: "/profile", icon: <UserOutlined /> },
  ];

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      className={`${className} bg-gray-900 text-white w-1/6 flex flex-col min-h-screen`}
    >
      {/* Sidebar Header */}
      <div className="p-4 text-center mh-4 text-lg font-bold border-b border-gray-700">
        G. Fitness
      </div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col flex-grow">
        {items.map((item) => (
          <button
            key={item.path}
            className={`flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-700 transition-all ${
              currentPath === item.path ? "bg-gray-800" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        className="flex items-center gap-4 px-4 py-3 text-left hover:bg-red-700 transition-all bg-gray-700"
        onClick={handleLogout}
      >
        <span className="text-xl text-red-400">
          <LogoutOutlined />
        </span>
        <span className="text-sm text-red-400">Logout</span>
      </button>
    </div>
  );
};

export default SideBar;
