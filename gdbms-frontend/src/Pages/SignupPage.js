import React, { useState } from "react";
import signupImage from "../assets/Images/tom.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const SignupPage = () => {
  const navigate = useNavigate();
  const gymRoute = process.env.REACT_APP_GYM_ROUTE;
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [signupInfo, setSignupInfo] = useState({
    gymName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleOnChange = (event, name) => {
    setSignupInfo({ ...signupInfo, [name]: event.target.value });
  };
  const handleSignup = async () => {
    if (isButtonDisabled) return; // Prevents multiple clicks

    setIsButtonDisabled(true); // Disable button
    try {
      await axios.post(`${gymRoute}/register`, signupInfo).then((response) => {
        const successMsg = response.data.message;
        toast.success(successMsg);
      });

      // Delay navigation after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed!");
      console.error("Signup Error:", error.response?.data || error.message);
    } finally {
      // Re-enable button after 5 seconds
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[100vh] bg-gray-900">
      {/* Left Section */}
      <div className="relative md:w-1/2 w-full h-[80vh] md:h-full flex flex-col">
        <div className="absolute top-[60%] left-[60%] transform -translate-x-1/2 text-center md:left-[55%] md:top-[20%] md:text-left">
          <h1 className="text-2xl md:text-5xl text-white shadow-gray-700 shadow-xl font-bold ">
            New Here?
          </h1>
        </div>
        <img
          src={signupImage}
          alt="signup-image"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 w-full bg-gray-700 flex flex-col p-6 md:p-20 justify-between">
        {/* Input Fields */}
        <div className="w-full flex flex-col gap-5">
          <div className="w-full flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4 text-white ">
              Signup
            </h2>
            <p className="text-sm text-white">
              Enter your details to get started!
            </p>
          </div>
          <input
            type="text"
            name="gymName"
            placeholder="Gym Name"
            value={signupInfo.gymName}
            onChange={(e) => handleOnChange(e, "gymName")}
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={signupInfo.userName}
            onChange={(e) => handleOnChange(e, "username")}
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupInfo.email}
            onChange={(e) => handleOnChange(e, "email")}
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupInfo.password}
            onChange={(e) => handleOnChange(e, "password")}
            className="w-full bg-white text-black py-3 px-4 md:py-4 md:px-5 bg-transparent border-b border-black focus:outline-blue rounded-lg"
          />

          {/* Signup Button */}
          <div className="w-full flex my-4">
            <button
              onClick={handleSignup}
              className="w-full text-white font-semibold bg-[#1c1a1ae6] rounded-md py-3 md:py-4 hover:bg-red-900 hover:text-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Signup
            </button>
          </div>

          {/* Login Section */}
          <div className="w-full flex flex-col items-center">
            <span className="text-sm text-white mb-2">
              Already have an account?
            </span>
            <p
              className="text-sm font-medium underline cursor-pointer text-white hover:text-blue-300"
              onClick={() => navigate("/")}
            >
              Login
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignupPage;
