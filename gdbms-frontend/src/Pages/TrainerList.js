import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Form, Input, Button, DatePicker, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TrainerCard from "../Components/TrainerCard"; // Ensure this component exists
import dayjs from "dayjs"; // For date handling

const TrainerList = () => {
  const [isAddTrainerModalVisible, setIsAddTrainerModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [trainerData, setTrainerData] = useState({
    name: "",
    contact: "",
    experience: "",
    description: "", // Add description to the state
    joiningDate: dayjs(), // Initialize with the current date
    imageUrl: "", // Add imageUrl to the state
    imageFile: null, // Add imageFile to the state
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [form] = Form.useForm(); // Form instance for validation
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/trainer/all-trainers",
          { withCredentials: true }
        );
        setTrainers(response.data.trainers);
      } catch (error) {
        toast.error("Error fetching trainers");
      }
    };
    fetchTrainers();
  }, []);

  const handleViewTrainer = (id) => {
    navigate(`/trainerDetail/${id}`);
  };

  const handleCancel = () => {
    setIsAddTrainerModalVisible(false);
    form.resetFields(); // Reset form fields when modal is closed
  };

  const handleAddTrainer = () => {
    setIsAddTrainerModalVisible(true);
  };

  const handleImageUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "gym-management");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dilliqjeq/image/upload",
        data
      );
      return response.data.secure_url;
    } catch (err) {
      console.log(err);
      toast.error("Error uploading image");
      return null;
    }
  };

  const handleTrainerSubmit = async () => {
    setIsLoading(true); // Start loading
    try {
      // Validate form fields
      await form.validateFields();

      let imageUrl = trainerData.imageUrl; // Default to the existing image URL (if any)

      // If a new image file is uploaded, upload it to Cloudinary
      if (trainerData.imageFile) {
        imageUrl = await handleImageUpload(trainerData.imageFile);
        if (!imageUrl) {
          toast.error("Failed to upload image");
          setIsLoading(false); // Stop loading on error
          return;
        }
      }

      const formattedData = {
        ...trainerData,
        joiningDate: trainerData.joiningDate.toISOString(), // Include joiningDate
        imageUrl: imageUrl, // Use the new or existing image URL
      };

      const response = await axios.post(
        "http://localhost:4000/trainer/addTrainer",
        formattedData,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAddTrainerModalVisible(false);
      setTrainerData({
        name: "",
        contact: "",
        experience: "",
        description: "", // Reset description
        joiningDate: dayjs(),
        imageUrl: "",
        imageFile: null, // Reset image file
      });
      form.resetFields(); // Reset form fields after submission

      const fetchResponse = await axios.get(
        "http://localhost:4000/trainer/all-trainers",
        { withCredentials: true }
      );
      setTrainers(fetchResponse.data.trainers);
    } catch (error) {
      toast.error(
        "Error adding trainer: " +
          (error.response ? error.response.data.error : error.message)
      );
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const filteredTrainers = trainers.filter((trainer) =>
    Object.values(trainer).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex-1 flex-row px-4">
      <h1 className="text-black text-3xl my-5 font-semibold">Trainer List</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <Input
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "60%" }}
        />
        <Button
          type="primary"
          onClick={handleAddTrainer}
          style={{ backgroundColor: "#1e2837", borderColor: "#1e2837" }}
        >
          Add Trainer
        </Button>
      </div>
      <Row
        style={{
          display: "flex",
          width: "100%",
          backgroundColor: "#1e2837",
          color: "white",
          fontWeight: "bold",
          padding: "10px",
        }}
      >
        {["Index", "Trainer Name", "Contact", "Experience", "Actions"].map(
          (header, index) => (
            <Col
              key={index}
              style={{
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minWidth: 100,
              }}
            >
              {header}
            </Col>
          )
        )}
      </Row>
      {filteredTrainers.length > 0 ? (
        filteredTrainers.map((item, index) => (
          <TrainerCard
            key={item._id}
            index={index + 1}
            name={item.name}
            contact={item.contact || "N/A"}
            experience={item.experience || "N/A"}
            trainerDetail={() => handleViewTrainer(item._id)}
          />
        ))
      ) : (
        <p>No trainers available</p>
      )}
      <Modal
        title="Add Trainer"
        open={isAddTrainerModalVisible}
        onOk={handleTrainerSubmit}
        onCancel={handleCancel}
        okText={isLoading ? "Adding..." : "Add Trainer"} // Show loading text
        okButtonProps={{ disabled: isLoading }} // Disable button when loading
        cancelText="Cancel"
        confirmLoading={isLoading} // Show spinner in the modal
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the trainer's name" },
            ]}
          >
            <Input
              value={trainerData.name}
              onChange={(e) =>
                setTrainerData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Contact"
            name="contact"
            rules={[
              { required: true, message: "Please enter the trainer's contact" },
              {
                pattern: /^\d{10}$/,
                message: "Contact must be exactly 10 digits",
              },
            ]}
          >
            <Input
              value={trainerData.contact}
              onChange={(e) =>
                setTrainerData((prev) => ({ ...prev, contact: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Experience"
            name="experience"
            rules={[
              {
                required: true,
                message: "Please enter the trainer's experience",
              },
              {
                pattern: /^\d+$/,
                message: "Experience must be a number",
              },
            ]}
          >
            <Input
              value={trainerData.experience}
              onChange={(e) =>
                setTrainerData((prev) => ({
                  ...prev,
                  experience: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter the trainer's description",
              },
            ]}
          >
            <Input
              value={trainerData.description}
              onChange={(e) =>
                setTrainerData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item
            label="Joining Date"
            name="joiningDate"
            rules={[
              {
                required: true,
                message: "Please select the trainer's joining date",
              },
            ]}
          >
            <DatePicker
              value={trainerData.joiningDate}
              onChange={(date) =>
                setTrainerData((prev) => ({ ...prev, joiningDate: date }))
              }
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Image" name="image">
            <Input
              type="file"
              onChange={(e) =>
                setTrainerData((prev) => ({
                  ...prev,
                  imageFile: e.target.files[0],
                }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default TrainerList;
