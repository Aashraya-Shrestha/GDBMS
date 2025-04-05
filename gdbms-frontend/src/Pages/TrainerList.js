import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Card,
  Space,
  Statistic,
  Divider,
  Grid,
  Descriptions,
  Table,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import {
  SearchOutlined,
  UserAddOutlined,
  SyncOutlined,
  AppstoreOutlined,
  TableOutlined,
} from "@ant-design/icons";

const { useBreakpoint } = Grid;

const TrainerList = () => {
  const [isAddTrainerModalVisible, setIsAddTrainerModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [trainerData, setTrainerData] = useState({
    name: "",
    contact: "",
    experience: "",
    description: "",
    joiningDate: dayjs(),
    imageUrl: "",
    imageFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalTrainers: 0,
    avgExperience: 0,
  });
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const theme = {
    primary: "#1890ff",
    secondary: "#f0f2f5",
    text: "rgba(0, 0, 0, 0.85)",
    cardBg: "#ffffff",
    headerBg: "#f8f9fa",
    border: "#e0e0e0",
  };

  const columns = [
    {
      title: "No.",
      dataIndex: "index",
      key: "index",
      width: 100,
      align: "center",
    },
    {
      title: "Trainer Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
    },
    {
      title: "Contact Info",
      dataIndex: "contact",
      key: "contact",
      width: 200,
      align: "center",
      render: (text) => text || "Not provided",
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      width: 150,
      align: "center",
      render: (text) => (text ? `${text} years` : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleViewTrainer(record._id)}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (screens.xs && viewMode === "table") {
      setViewMode("card");
    }
  }, [screens, viewMode]);

  useEffect(() => {
    const fetchTrainers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:4000/trainer/all-trainers",
          { withCredentials: true }
        );

        const totalTrainers = response.data.trainers.length;
        const avgExperience =
          response.data.trainers.reduce((acc, curr) => {
            return acc + (parseInt(curr.experience) || 0);
          }, 0) / totalTrainers || 0;

        setStats({
          totalTrainers,
          avgExperience: avgExperience.toFixed(1),
        });

        setTrainers(response.data.trainers);
      } catch (error) {
        toast.error("Error fetching trainers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const refreshTrainers = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:4000/trainer/all-trainers", {
        withCredentials: true,
      })
      .then((response) => {
        const totalTrainers = response.data.trainers.length;
        const avgExperience =
          response.data.trainers.reduce((acc, curr) => {
            return acc + (parseInt(curr.experience) || 0);
          }, 0) / totalTrainers || 0;

        setStats({
          totalTrainers,
          avgExperience: avgExperience.toFixed(1),
        });

        setTrainers(response.data.trainers);
      })
      .catch((error) => {
        toast.error("Error refreshing trainers");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleViewTrainer = (id) => {
    navigate(`/trainerDetail/${id}`);
  };

  const handleCancel = () => {
    setIsAddTrainerModalVisible(false);
    form.resetFields();
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
    setIsLoading(true);
    try {
      await form.validateFields();

      let imageUrl = trainerData.imageUrl;

      if (trainerData.imageFile) {
        imageUrl = await handleImageUpload(trainerData.imageFile);
        if (!imageUrl) {
          toast.error("Failed to upload image");
          setIsLoading(false);
          return;
        }
      }

      const formattedData = {
        ...trainerData,
        joiningDate: trainerData.joiningDate.toISOString(),
        imageUrl: imageUrl,
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
        description: "",
        joiningDate: dayjs(),
        imageUrl: "",
        imageFile: null,
      });
      form.resetFields();

      refreshTrainers();
    } catch (error) {
      toast.error(
        "Error adding trainer: " +
          (error.response ? error.response.data.error : error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainers = trainers
    .filter((trainer) =>
      Object.values(trainer).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .map((trainer, index) => ({
      ...trainer,
      index: index + 1,
      key: trainer._id,
    }));

  const renderCardView = () => (
    <div
      className="card-container"
      style={{
        display: "grid",
        gridTemplateColumns: screens.md ? "repeat(2, 1fr)" : "1fr",
        gap: "16px",
        padding: "16px 0",
      }}
    >
      {filteredTrainers.map((trainer) => (
        <Card
          key={trainer._id}
          title={trainer.name}
          extra={
            <Button
              onClick={() => handleViewTrainer(trainer._id)}
              type="link"
              size="small"
            >
              View Details
            </Button>
          }
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Contact">
              {trainer.contact || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Experience">
              {trainer.experience ? `${trainer.experience} years` : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Joined On">
              {dayjs(trainer.joiningDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ))}
    </div>
  );

  return (
    <div
      className="flex-1 flex-col px-4 pb-4"
      style={{ backgroundColor: theme.secondary, minHeight: "100vh" }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          className="text-3xl my-4 font-semibold"
          style={{ color: theme.text }}
        >
          Trainer Management
        </h1>

        <Card
          bordered={false}
          style={{
            marginBottom: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            borderRadius: 8,
          }}
        >
          <Space size="large" style={{ marginBottom: "20px", width: "100%" }}>
            <Statistic
              title="Total Trainers"
              value={stats.totalTrainers}
              valueStyle={{
                color: theme.primary,
                fontSize: 24,
                fontWeight: 500,
              }}
            />
            <Divider type="vertical" style={{ height: 40 }} />
            <Statistic
              title="Avg Experience"
              value={`${stats.avgExperience} yrs`}
              valueStyle={{
                color: "#faad14",
                fontSize: 24,
                fontWeight: 500,
              }}
            />
          </Space>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search trainers..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: screens.xs ? "100%" : "400px",
                height: 40,
                borderRadius: 6,
              }}
              allowClear
            />

            {!screens.xs && (
              <Button
                icon={
                  viewMode === "table" ? (
                    <AppstoreOutlined />
                  ) : (
                    <TableOutlined />
                  )
                }
                onClick={() =>
                  setViewMode(viewMode === "table" ? "card" : "table")
                }
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                  color: "#fff",
                  height: 40,
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {viewMode === "table" ? "Card View" : "Table View"}
              </Button>
            )}

            <Button
              type="primary"
              onClick={handleAddTrainer}
              icon={<UserAddOutlined />}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                height: 40,
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              {screens.xs ? "Add" : "Add New Trainer"}
            </Button>

            <Button
              icon={<SyncOutlined />}
              onClick={refreshTrainers}
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                color: "#fff",
                height: 40,
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              {screens.xs ? "Refresh" : "Refresh Data"}
            </Button>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <SyncOutlined
            spin
            style={{ fontSize: 32, marginBottom: 20, color: theme.primary }}
          />
          <p style={{ fontSize: 16, color: "#666" }}>Loading trainer data...</p>
        </div>
      ) : filteredTrainers.length > 0 ? (
        viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={filteredTrainers}
            pagination={false}
            scroll={{ x: true }}
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          renderCardView()
        )
      ) : (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            backgroundColor: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <p style={{ fontSize: 16, color: "#666", marginBottom: 20 }}>
            No trainers found matching your criteria
          </p>
          <Button
            type="primary"
            onClick={() => setSearchQuery("")}
            style={{
              marginTop: 16,
              backgroundColor: theme.primary,
              borderColor: theme.primary,
              height: 40,
              padding: "0 24px",
              fontWeight: 500,
            }}
          >
            Clear Search Filters
          </Button>
        </div>
      )}

      <Modal
        title="Add New Trainer"
        open={isAddTrainerModalVisible}
        onOk={handleTrainerSubmit}
        onCancel={handleCancel}
        okText={isLoading ? "Adding..." : "Add Trainer"}
        okButtonProps={{
          disabled: isLoading,
          style: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          },
        }}
        cancelText="Cancel"
        confirmLoading={isLoading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Full Name"
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
            label="Contact Number"
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
            label="Experience (years)"
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
            label="Professional Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter the trainer's description",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
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
          <Form.Item label="Profile Photo" name="image">
            <Input
              type="file"
              accept="image/*"
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
