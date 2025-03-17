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
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const TrainerDetail = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [trainer, setTrainer] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedContact, setEditedContact] = useState("");
  const [editedExperience, setEditedExperience] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedJoiningDate, setEditedJoiningDate] = useState(dayjs());
  const [editedImageFile, setEditedImageFile] = useState(null); // For file upload
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [form] = Form.useForm(); // Form instance for validation

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
        setEditedJoiningDate(dayjs(response.data.trainer.joiningDate));
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
      setEditedJoiningDate(dayjs(trainer.joiningDate));
      form.setFieldsValue({
        name: trainer.name,
        contact: trainer.contact,
        experience: trainer.experience,
        description: trainer.description,
        joiningDate: dayjs(trainer.joiningDate),
      });
    }
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditedImageFile(null); // Clear the file input on cancel
    form.resetFields(); // Reset form fields
  };

  const handleImageUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "gym-management"); // Replace with your Cloudinary upload preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dilliqjeq/image/upload", // Replace with your Cloudinary cloud name
        data
      );
      return response.data.secure_url; // Return the uploaded image URL
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Error uploading image");
      return null;
    }
  };

  const handleEditSave = async () => {
    setIsLoading(true); // Start loading
    try {
      // Validate form fields
      await form.validateFields();

      let imageUrl = trainer.imageUrl; // Default to the existing image URL

      // If a new image file is uploaded, upload it to Cloudinary
      if (editedImageFile) {
        imageUrl = await handleImageUpload(editedImageFile);
        if (!imageUrl) {
          toast.error("Failed to upload image");
          setIsLoading(false); // Stop loading on error
          return;
        }
      }

      const response = await axios.put(
        `http://localhost:4000/trainer/edit-trainer/${id}`,
        {
          name: editedName,
          contact: editedContact,
          experience: editedExperience,
          description: editedDescription,
          joiningDate: editedJoiningDate.toISOString(),
          imageUrl: imageUrl, // Use the new or existing image URL
        },
        { withCredentials: true }
      );

      setTrainer({
        ...trainer,
        name: editedName,
        contact: editedContact,
        experience: editedExperience,
        description: editedDescription,
        joiningDate: editedJoiningDate.toISOString(),
        imageUrl: imageUrl, // Update the image URL in local state
      });

      toast.success("Trainer details updated successfully");
      setIsEditModalVisible(false);
      setEditedImageFile(null); // Clear the file input after saving
    } catch (error) {
      console.error("Error updating trainer details:", error);
      toast.error("Failed to update trainer details");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDeleteTrainer = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/trainer/delete-trainer/${id}`,
        { withCredentials: true }
      );
      toast.success("Trainer deleted successfully");
      navigate("/trainerList");
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
          <div className="w-52 h-52 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
            {trainer.imageUrl ? (
              <img
                src={trainer.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg">Profile Image</span>
            )}
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
              {new Date(trainer.joiningDate).toLocaleDateString("en-GB")}
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
            onCancel={() => setIsDeleteModalVisible(false)}
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
          confirmLoading={isLoading} // Show loading indicator in the modal
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
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Contact"
              name="contact"
              rules={[
                {
                  required: true,
                  message: "Please enter the trainer's contact",
                },
                {
                  pattern: /^\d{10}$/,
                  message: "Contact must be exactly 10 digits",
                },
              ]}
            >
              <Input
                value={editedContact}
                onChange={(e) => setEditedContact(e.target.value)}
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
                value={editedExperience}
                onChange={(e) => setEditedExperience(e.target.value)}
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
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
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
                value={editedJoiningDate}
                onChange={(date) => setEditedJoiningDate(date)}
                format="YYYY-MM-DD"
                className="w-full"
              />
            </Form.Item>
            <Form.Item label="Profile Image" name="image">
              <Input
                type="file"
                onChange={(e) => setEditedImageFile(e.target.files[0])}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default TrainerDetail;
