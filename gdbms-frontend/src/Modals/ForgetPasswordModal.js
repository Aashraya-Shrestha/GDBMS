import React, { useState } from "react";
import { Modal, Input, Form, Button } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_GYM_ROUTE;

const ForgetPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reset-password/sendOTP`,
        { email }
      );
      toast.success(response.data.message);
      setIsOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleValidateOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reset-password/checkOTP`,
        {
          email,
          otp,
        }
      );
      toast.success(response.data.message);
      setIsOtpValidated(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email,
        newPassword: password,
      });
      toast.success(response.data.message);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Modal
        title="Forget Password"
        open={true}
        onCancel={onClose}
        footer={null}
      >
        <Form layout="vertical">
          {!isOtpSent ? (
            <>
              <Form.Item label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleSendOTP}
                loading={loading}
                block
              >
                Send OTP
              </Button>
            </>
          ) : !isOtpValidated ? (
            <>
              <Form.Item label="OTP">
                <Input
                  type="number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter your OTP"
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleValidateOTP}
                loading={loading}
                block
              >
                Validate OTP
              </Button>
            </>
          ) : (
            <>
              <Form.Item label="New Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleResetPassword}
                loading={loading}
                block
              >
                Reset Password
              </Button>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ForgetPasswordModal;
