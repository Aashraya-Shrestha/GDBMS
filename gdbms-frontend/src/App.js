import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import SideBar from "./Components/sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberList from "./Pages/MemberList";
import AddMemberForm from "./Pages/AddMembers";
import GeneralUser from "./Pages/GeneralUser";
import MemberDetail from "./Pages/MemberDetail";
import "react-toastify/dist/ReactToastify.css";
import ProfilePage from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import LandingPage from "./Pages/LandingPage";
import TrainerList from "./Pages/TrainerList";
import TrainerDetail from "./Pages/TrainerDetail";
import MemberDashboard from "./Pages/Dashboard";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [gymName, setGymName] = useState("Gym"); // Default name
  const [loadingGymName, setLoadingGymName] = useState(false);

  // Fetch gym name when logged in
  const fetchGymName = async () => {
    try {
      setLoadingGymName(true);
      const response = await axios.get(
        `${process.env.REACT_APP_GYM_ROUTE}/gymInfo`,
        {
          withCredentials: true,
        }
      );
      setGymName(response.data.gym.gymName);
    } catch (error) {
      console.error("Failed to fetch gym name:", error);
      // Keep the default name if fetch fails
    } finally {
      setLoadingGymName(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLogin");
    if (isLoggedIn) {
      setIsLogin(true);
      fetchGymName(); // Fetch gym name when logged in
      navigate("/dashboard");
    } else {
      setIsLogin(false);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem("isLogin")]);

  return (
    <div className="App">
      {isLogin && <SideBar className="sidebar" gymName={gymName} />}
      <div className={`main-content ${isLogin ? "with-sidebar" : ""}`}>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/memberList" element={<MemberList />} />
          <Route path="/addMember" element={<AddMemberForm />} />
          <Route path="/trainerList" element={<TrainerList />} />
          <Route path="/specific/:page" element={<GeneralUser />} />
          <Route path="/member/:id" element={<MemberDetail />} />
          <Route path="/trainerDetail/:id" element={<TrainerDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
