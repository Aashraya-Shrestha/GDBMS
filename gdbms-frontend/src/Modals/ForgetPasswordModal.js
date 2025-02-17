import React, { useState } from "react";
import { Modal, Input, Form, Button } from "antd";

const ForgetPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);

  const handleSendOTP = () => {
    console.log("Sending OTP to", email);
    setIsOtpSent(true);
  };

  const handleValidateOTP = () => {
    console.log("Validating OTP", otp);
    setIsOtpValidated(true);
  };

  const handleResetPassword = () => {
    console.log("Resetting password to", password);
    onClose();
  };

  return (
    <Modal
      title="Forget Password"
      visible={true}
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
            <Button type="primary" onClick={handleSendOTP} block>
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
            <Button type="primary" onClick={handleValidateOTP} block>
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
            <Button type="primary" onClick={handleResetPassword} block>
              Reset Password
            </Button>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ForgetPasswordModal;
