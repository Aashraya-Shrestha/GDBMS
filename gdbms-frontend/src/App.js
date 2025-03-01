import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Dashboard from "./Pages/Dashboard";
import SideBar from "./Components/sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberList from "./Pages/MemberList";
import AddMemberForm from "./Pages/AddMembers";
import GeneralUser from "./Pages/GeneralUser";
import MemberDetail from "./Pages/MemberDetail";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    let isLoggedIn = localStorage.getItem("isLogin");
    if (isLoggedIn) {
      setIsLogin(true);
      navigate("/dashboard");
    } else {
      setIsLogin(false);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem("isLogin")]);
  return (
    <div className="flex">
      {isLogin && <SideBar />}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memberList" element={<MemberList />} />
        <Route path="/addMember" element={<AddMemberForm />} />
        <Route path="/specific/:page" element={<GeneralUser />} />
        <Route path="/member/:id" element={<MemberDetail />} />
      </Routes>
    </div>
  );
}

export default App;
