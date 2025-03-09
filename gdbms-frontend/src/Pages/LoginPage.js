import React, { useState } from "react";
import mainImage from "../assets/Images/Deadpool.jpeg";
import { useNavigate } from "react-router-dom";
import ForgetPasswordModal from "../Modals/ForgetPasswordModal";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material"; // Import ArrowBack icon
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const LoginPage = () => {
  const gymRoute = process.env.REACT_APP_GYM_ROUTE;
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });

  const handleOnChange = (event, name) => {
    setLoginInfo({ ...loginInfo, [name]: event.target.value });
  };

  const handleLogin = async () => {
    if (isButtonDisabled) return; // Prevents multiple clicks

    setIsButtonDisabled(true); // Disable button
    try {
      const response = await axios.post(`${gymRoute}/login`, loginInfo, {
        withCredentials: true,
      });

      localStorage.setItem("gymName", response.data.gym.gymName);
      localStorage.setItem("isLogin", true);
      localStorage.setItem("token", response.data.token);

      toast.success("Successfully logged in!");

      // Delay navigation after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
      console.error("Login Error:", error.response?.data || error.message);
    } finally {
      // Re-enable button after 3 seconds
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-800">
      {/* Left Section */}
      <div className="relative md:w-1/2 w-full h-[50vh] md:h-screen flex flex-col">
        <div className="absolute top-[65%] left-[52%] transform -translate-x-1/2 text-center md:left-[45%] md:top-[85%] md:text-left">
          <h1 className="text-2xl md:text-4xl text-white shadow-gray-700 shadow-xl font-bold">
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
        {/* Go Back Button (Arrow Icon) */}
        <IconButton
          onClick={() => navigate("/")}
          className="self-start hover:text-blue-300"
          aria-label="go back"
          style={{
            color: "#FFD700",
            fontSize: "2rem",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
            borderRadius: "50%", // Makes it circular
            padding: "8px", // Adds some padding around the icon
          }}
        >
          <ArrowBack />
        </IconButton>
        {/* Input Fields */}
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4 text-white">
              Login
            </h2>
            <p className="text-sm text-white">
              Welcome Back! Please enter your details
            </p>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginInfo.email}
            onChange={(e) => handleOnChange(e, "email")}
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 border-b border-black focus:outline-blue rounded-lg"
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={loginInfo.password}
              onChange={(e) => handleOnChange(e, "password")}
              className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 border-b border-black focus:outline-blue rounded-lg"
            />
            {loginInfo.password && (
              <InputAdornment
                position="end"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-4">
            <p
              className="text-sm font-medium underline cursor-pointer text-white"
              onClick={() => setShowModal(true)}
            >
              Forgot Password?
            </p>
          </div>

          {/* Login Button */}
          <div className="w-full flex my-4">
            <button
              className="w-full text-white font-semibold bg-[#1c1a1ae6] rounded-md py-3 md:py-4 hover:bg-red-900 hover:text-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
              onClick={handleLogin}
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Signup Section */}
          <div className="w-full flex flex-col items-center">
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
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
