import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  TextField,
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import { Modal } from "antd"; // Import Ant Design Modal
import "../Styles/ProfilePage.css"; // Import a CSS file for the floating shapes

const ProfilePage = () => {
  const [gym, setGym] = useState(null); // State to store gym details
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(""); // State to handle errors
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // State for delete confirmation modal
  const [formData, setFormData] = useState({
    gymName: "",
    username: "",
    email: "",
  });
  const navigate = useNavigate();

  // Fetch gym details when the component mounts
  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from local storage
        if (!token) {
          navigate("/login"); // Redirect to login if no token is found
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_GYM_ROUTE}/gymInfo`,
          {
            withCredentials: true,
          }
        );

        setGym(response.data.gym); // Set the gym details in state
        setFormData({
          gymName: response.data.gym.gymName,
          username: response.data.gym.username,
          email: response.data.gym.email,
        });
        setLoading(false); // Set loading to false
      } catch (err) {
        setError("Failed to fetch gym details. Please try again.");
        setLoading(false);
        toast.error("Failed to fetch gym details"); // Error toast
        console.error(err);
      }
    };

    fetchGymDetails();
  }, [navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_GYM_ROUTE}/editInfo`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setGym(response.data.gym); // Update the gym details in state
        toast.success("Gym details updated successfully"); // Success toast
        setIsEditing(false); // Exit edit mode
      }
    } catch (err) {
      // Handle errors
      if (err.response) {
        toast.error(
          err.response.data.message || "Failed to update gym details"
        ); // Error toast
      } else if (err.request) {
        toast.error("No response from the server. Please try again."); // Error toast
      } else {
        toast.error("An unexpected error occurred. Please try again."); // Error toast
      }
      console.error("Failed to update gym details:", err);
    }
  };

  // Show the delete confirmation modal
  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_GYM_ROUTE}/deleteGym`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Gym account deleted successfully"); // Success toast
        localStorage.clear(); // Clear the token
        setTimeout(() => {
          navigate("/login"); // Redirect to login page after 2 seconds
        }, 2000); // 2000 milliseconds = 2 seconds
      }
    } catch (err) {
      console.error("Error deleting gym account:", err);
      toast.error("Failed to delete gym account"); // Error toast
    } finally {
      setIsDeleteModalVisible(false); // Close the modal
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false); // Close the modal
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        minHeight: "100vh", // Ensure the container spans the full height of the page
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        p: 4, // Add padding to the container
      }}
    >
      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          p: 3,
          position: "relative",
          zIndex: 10,
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent background
          backdropFilter: "blur(10px)", // Add a blur effect
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Avatar
            sx={{ bgcolor: "primary.main", width: 80, height: 80, mb: 2 }}
          >
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Gym Profile
          </Typography>
        </Box>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              label="Gym Name"
              name="gymName"
              value={formData.gymName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}
            >
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save Changes
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <strong>Gym Name:</strong> {gym.gymName}
              </Typography>
              <Typography variant="h6" gutterBottom>
                <strong>Username:</strong> {gym.username}
              </Typography>
              <Typography variant="h6" gutterBottom>
                <strong>Email:</strong> {gym.email}
              </Typography>
              <Typography variant="h6" gutterBottom>
                <strong>Joined On:</strong>{" "}
                {new Date(gym.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                color="error" // Red color for delete button
                onClick={showDeleteModal} // Show delete confirmation modal
              >
                Delete Account
              </Button>
            </Box>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Account"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }} // Make the delete button red
      >
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
      </Modal>

      {/* Toast Container */}
      <ToastContainer />
    </Container>
  );
};

export default ProfilePage;
