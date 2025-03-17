import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Form, Input, Button, DatePicker } from "antd";
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
    joiningDate: dayjs(), // Initialize with the current date
  });
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
  };

  const handleAddTrainer = () => {
    setIsAddTrainerModalVisible(true);
  };

  const handleTrainerSubmit = async () => {
    try {
      // Format the joining date to ISO string before sending
      const formattedData = {
        ...trainerData,
        joiningDate: trainerData.joiningDate.toISOString(),
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
        joiningDate: dayjs(), // Reset to current date
      });
      // Refresh the trainer list
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
    }
  };

  // Filter trainers based on search query
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
      {/* Header Row */}
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
      {/* Data Rows */}
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
      {/* Add Trainer Modal */}
      <Modal
        title="Add Trainer"
        open={isAddTrainerModalVisible}
        onOk={handleTrainerSubmit}
        onCancel={handleCancel}
        okText="Add Trainer"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input
              value={trainerData.name}
              onChange={(e) =>
                setTrainerData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Contact">
            <Input
              value={trainerData.contact}
              onChange={(e) =>
                setTrainerData((prev) => ({
                  ...prev,
                  contact: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Experience">
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
          <Form.Item label="Joining Date">
            <DatePicker
              value={trainerData.joiningDate}
              onChange={(date) =>
                setTrainerData((prev) => ({
                  ...prev,
                  joiningDate: date,
                }))
              }
              format="YYYY-MM-DD" // Format the date display
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default TrainerList;
