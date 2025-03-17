import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Divider,
  Popconfirm,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const TrainerDetail = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [trainer, setTrainer] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedContact, setEditedContact] = useState("");
  const [editedExperience, setEditedExperience] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedJoiningDate, setEditedJoiningDate] = useState(dayjs());

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTrainerDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/trainer/trainer-detail/${id}`,
          { withCredentials: true }
        );
        setTrainer(response.data.trainer);
        setEditedJoiningDate(dayjs(response.data.trainer.joiningDate)); // Set the joining date for editing
      } catch (error) {
        console.error("Error fetching trainer details:", error);
        toast.error("Failed to fetch trainer details");
      }
    };
    fetchTrainerDetails();
  }, [id]);

  const showEditModal = () => {
    if (trainer) {
      setEditedName(trainer.name);
      setEditedContact(trainer.contact);
      setEditedExperience(trainer.experience);
      setEditedDescription(trainer.description);
      setEditedJoiningDate(dayjs(trainer.joiningDate)); // Set the joining date for editing
    }
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/trainer/edit-trainer/${id}`,
        {
          name: editedName,
          contact: editedContact,
          experience: editedExperience,
          description: editedDescription,
          joiningDate: editedJoiningDate.toISOString(), // Send the updated joining date
        },
        { withCredentials: true }
      );

      setTrainer({
        ...trainer,
        name: editedName,
        contact: editedContact,
        experience: editedExperience,
        description: editedDescription,
        joiningDate: editedJoiningDate.toISOString(), // Update the joining date in local state
      });

      // Show success toast
      toast.success("Trainer details updated successfully");

      // Close the modal after a short delay
      setTimeout(() => {
        setIsEditModalVisible(false);
      }, 1000); // 1 second delay
    } catch (error) {
      console.error("Error updating trainer details:", error);
      toast.error("Failed to update trainer details");
    }
  };

  const handleDeleteTrainer = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/trainer/delete-trainer/${id}`,
        { withCredentials: true }
      );

      // Show success toast
      toast.success("Trainer deleted successfully");

      // Navigate to the trainer list after a short delay
      setTimeout(() => {
        navigate("/trainerList");
      }, 2000); // 2 seconds delay
    } catch (error) {
      console.error("Error deleting trainer:", error);
      toast.error("Failed to delete trainer");
    }
  };

  const goToTrainerList = () => {
    navigate("/trainerList");
  };

  if (!trainer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-5/6 mx-auto p-5">
      <Button onClick={goToTrainerList} className="mb-4 bg-gray-300">
        ← Back to Trainer List
      </Button>
      <Card className="shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-52 h-52 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-lg">Profile Image</span>
          </div>

          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">{trainer.name}</h2>
            <p className="text-xl text-gray-700">Contact: {trainer.contact}</p>
            <p className="text-xl text-gray-700">
              Experience: {trainer.experience}
            </p>
            <p className="text-xl text-gray-700">
              Description: {trainer.description}
            </p>
            <p className="text-xl text-gray-700">
              Join Date:{" "}
              {new Date(trainer.joiningDate).toLocaleDateString("en-GB")}{" "}
              {/* Updated */}
            </p>
          </div>
        </div>

        <Divider />

        <div className="flex justify-center gap-4">
          <Button
            type="default"
            onClick={showEditModal}
            className="border-gray-400"
          >
            Edit Details
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this trainer?"
            onConfirm={handleDeleteTrainer}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete Trainer
            </Button>
          </Popconfirm>
        </div>

        <Modal
          title="Edit Trainer Details"
          open={isEditModalVisible}
          onOk={handleEditSave}
          onCancel={handleEditCancel}
          okText="Save"
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Contact">
              <Input
                value={editedContact}
                onChange={(e) => setEditedContact(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Experience">
              <Input
                value={editedExperience}
                onChange={(e) => setEditedExperience(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Joining Date">
              <DatePicker
                value={editedJoiningDate}
                onChange={(date) => setEditedJoiningDate(date)}
                format="YYYY-MM-DD"
                className="w-full"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
      <ToastContainer
        position="top-right"
        autoClose={2000} // Close toast after 2 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default TrainerDetail;
