import React, { useState } from "react";
import {
  DesktopOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = [
    { label: "Dashboard", path: "/dashboard", icon: <PieChartOutlined /> },
    { label: "Add Members", path: "/addMember", icon: <DesktopOutlined /> },
    { label: "Member List", path: "/memberList", icon: <TeamOutlined /> },
    { label: "Profile", path: "/profileScreen", icon: <UserOutlined /> },
  ];

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      className={`h-screen bg-gray-900 text-white ${
        collapsed ? "w-16" : "w-1/6"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 text-center mh-4 text-lg font-bold border-b border-gray-700">
        {collapsed ? "G." : "G. Fitness"}
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
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        className="flex items-center gap-4 px-4 py-3 text-left hover:bg-red-700 transition-all mt-auto bg-gray-700"
        onClick={handleLogout}
      >
        <span className="text-xl text-red-400">
          <LogoutOutlined />
        </span>
        {!collapsed && <span className="text-sm text-red-400">Logout</span>}
      </button>

      {/* Collapse Button */}
      <button
        className="p-3 bg-gray-800 text-center hover:bg-gray-700"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "»" : "«"}
      </button>
    </div>
  );
};

export default SideBar;
