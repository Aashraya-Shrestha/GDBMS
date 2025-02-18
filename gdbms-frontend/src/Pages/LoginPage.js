import React, { useState } from "react";
import mainImage from "../assets/Images/Deadpool.jpeg";
import { useNavigate } from "react-router-dom";
import ForgetPasswordModal from "../Modals/ForgetPasswordModal";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleLogin = () => {
    sessionStorage.setItem("isLogin", true);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[100vh] min-h-screen bg-gray-800">
      {/* Left Section */}
      <div className="relative md:w-1/2 w-full h-[80vh] md:h-full flex flex-col">
        <div className="absolute top-[65%] left-[52%] transform -translate-x-1/2 text-center md:left-[45%] md:top-[85%] md:text-left">
          <h1 className="text-2xl md:text-4xl text-white shadow-gray-700 shadow-xl font-bold ">
            ONE DAY OR DAY ONE
          </h1>
        </div>
        <img
          src={mainImage}
          alt="login-image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 w-full bg-gray-700 flex flex-col p-6 md:p-20 justify-between">
        {/* Input Fields */}
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4 text-white ">
              Login
            </h2>
            <p className="text-sm  text-white">
              Welcome Back! Please enter your details
            </p>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />
          <div className="w-full flex items-center justify-between mt-4">
            <p
              className="text-sm font-medium underline cursor-pointer text-white"
              onClick={() => setShowModal(true)}
            >
              Forgot Password?
            </p>
          </div>

          {/* Login Button */}
          <div className="w-full flex my-4 ">
            <button
              className="w-full text-white font-semibold bg-[#1c1a1ae6] rounded-md py-3 md:py-4 hover:bg-red-900 hover:text-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={() => handleLogin()}
            >
              Login
            </button>
          </div>

          {/* Signup Section */}
          <div className="w-full flex flex-col items-center ">
            <span className="text-sm text-white mb-2">
              Don't have an account?
            </span>
            <p
              className="text-sm font-medium underline cursor-pointer text-white hover:text-blue-300"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </p>
          </div>
        </div>
      </div>
      {/* Forget Password Modal */}
      {showModal && <ForgetPasswordModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default LoginPage;
