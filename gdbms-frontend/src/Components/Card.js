import React from "react";
import { Card, Col } from "antd";

const CardComponent = ({ title, ImageIcon, onClick }) => {
  return (
    <Col span={8} className="p-2">
      <div
        className="bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
        onClick={onClick} // Handle click here
      >
        {/* Title Section */}
        <div className="bg-slate-600 text-white text-center py-2 rounded-t-xl">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Card Body */}
        <Card className="border-none p-6 flex justify-center items-center">
          {ImageIcon && (
            <ImageIcon className="text-gray-700" style={{ fontSize: 40 }} />
          )}
        </Card>
      </div>
    </Col>
  );
};

export default CardComponent;
