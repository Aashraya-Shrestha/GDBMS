import React, { useState, useEffect } from "react";
import {
  Card,
  Switch,
  Button,
  Select,
  Divider,
  Modal,
  Form,
  Input,
  DatePicker,
  Image,
  Table,
  Tabs,
  Tag,
  Space,
  Statistic,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const { Option } = Select;
const { TabPane } = Tabs;

const MemberDetail = () => {
  const [status, setStatus] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [membershipType, setMembershipType] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [member, setMember] = useState(null);
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedJoiningDate, setEditedJoiningDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [monthFilter, setMonthFilter] = useState(dayjs().month());
  const [yearFilter, setYearFilter] = useState(dayjs().year());
  const [isFreezeModalVisible, setIsFreezeModalVisible] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");
  const [isUnfreezeModalVisible, setIsUnfreezeModalVisible] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [canToggleStatus, setCanToggleStatus] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/members/member-detail/${id}`,
          { withCredentials: true }
        );
        setMember(response.data.member);
        setStatus(response.data.member.status === "Active");
        setEditedJoiningDate(dayjs(response.data.member.joiningDate));

        // Check if membership has expired for more than a month
        const now = new Date();
        const nextBillDate = new Date(response.data.member.nextBillDate);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const expiredOverMonth = nextBillDate < oneMonthAgo;
        setIsExpired(expiredOverMonth);

        // Check if we can toggle the status
        const canToggle =
          !expiredOverMonth ||
          (expiredOverMonth && response.data.member.status === "Inactive");
        setCanToggleStatus(canToggle);

        // If expired over a month and still active, automatically set to inactive
        if (expiredOverMonth && response.data.member.status === "Active") {
          handleAutoInactive();
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
      }
    };
    fetchMemberDetails();
  }, [id]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/plans/get-membership",
          { withCredentials: true }
        );
        const memberships = response.data.membership.map((m) => ({
          label: `${m.months} Month Membership - ${m.price}`,
          value: m._id,
        }));
        setMembershipOptions(memberships);
      } catch (error) {
        console.error("Error fetching membership options:", error);
      }
    };

    fetchMemberships();
  }, []);

  useEffect(() => {
    if (member) {
      fetchAttendanceData();
    }
  }, [member, monthFilter, yearFilter]);

  const handleAutoInactive = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/members/changeStatus/${id}`,
        { status: "Inactive" },
        { withCredentials: true }
      );

      setStatus(false);
      setMember({
        ...member,
        status: "Inactive",
      });
      message.warning(
        "Membership expired for over a month. Status automatically set to Inactive."
      );
    } catch (error) {
      console.error("Error updating status automatically:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/members/attendance/${id}`,
        {
          params: { month: monthFilter, year: yearFilter },
          withCredentials: true,
        }
      );
      setAttendanceData(response.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleFreezeAccount = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/members/freeze-account/${id}`,
        { reason: freezeReason },
        { withCredentials: true }
      );

      toast.success("Account frozen successfully");
      setMember(response.data.member);
      setIsFreezeModalVisible(false);
      setFreezeReason("");
    } catch (error) {
      toast.error("Failed to freeze account");
    }
  };

  const handleUnfreezeAccount = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/members/unfreeze-account/${id}`,
        {},
        { withCredentials: true }
      );

      toast.success("Account unfrozen successfully");
      setMember(response.data.member);
      setIsUnfreezeModalVisible(false);
    } catch (error) {
      console.error("Unfreeze error:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to unfreeze account");
      }
    }
  };

  const handleRenewClick = () => {
    if (status) setIsRenewing(true);
  };

  const handleCancelRenew = () => {
    setIsRenewing(false);
    setMembershipType(null);
  };

  const handleMembershipChange = (value) => {
    setMembershipType(value);
  };

  const handleSave = async () => {
    if (!membershipType) {
      toast.error("Please select a membership type");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/members/updatePlan/${id}`,
        { membership: membershipType }, // Only send membership ID
        { withCredentials: true }
      );

      toast.success("Membership has been renewed");

      // Update local state with the renewed member data
      setMember(response.data.member);
      setStatus(true); // Set status to active
      setIsRenewing(false); // Close the renewal form

      // Optionally refresh the membership options
      const membershipsResponse = await axios.get(
        "http://localhost:4000/plans/get-membership",
        { withCredentials: true }
      );
      const memberships = membershipsResponse.data.membership.map((m) => ({
        label: `${m.months} Month Membership - ${m.price}`,
        value: m._id,
      }));
      setMembershipOptions(memberships);
    } catch (error) {
      console.error("Error renewing membership:", error);
      toast.error(error.response?.data?.error || "Failed to renew membership");
    }
  };

  const showEditModal = () => {
    if (member) {
      setEditedName(member.name);
      setEditedPhone(member.phoneNumber);
      setEditedAddress(member.address);
      setEditedJoiningDate(dayjs(member.joiningDate));
    }
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const goToMemberList = () => {
    navigate("/memberList");
  };

  const handleStatusChange = async (checked) => {
    // Prevent toggling to inactive if membership hasn't expired
    if (!checked && !isExpired) {
      message.warning("Cannot set to Inactive until membership has expired");
      return;
    }

    try {
      const newStatus = checked ? "Active" : "Inactive";
      const response = await axios.put(
        `http://localhost:4000/members/changeStatus/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      toast.success("Status updated successfully");
      setStatus(checked);
      setMember({
        ...member,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/members/editMember/${id}`,
        {
          name: editedName,
          phoneNumber: editedPhone,
          address: editedAddress,
          joiningDate: editedJoiningDate.toISOString(),
        },
        { withCredentials: true }
      );

      setMember({
        ...member,
        name: editedName,
        phoneNumber: editedPhone,
        address: editedAddress,
        joiningDate: editedJoiningDate.toISOString(),
      });

      toast.success("Member details updated successfully");
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating member details:", error);
      toast.error("Failed to update member details");
    }
  };

  const attendanceColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "orange";
        if (status === "present") color = "green";
        if (status === "absent") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Present", value: "present" },
        { text: "Absent", value: "absent" },
        { text: "Not Checked", value: "hasnt checked in" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            onClick={() => updateAttendance(record.date, "present")}
            disabled={dayjs(record.date).isAfter(dayjs(), "day")}
          >
            Mark Present
          </Button>
          <Button
            size="small"
            danger
            onClick={() => updateAttendance(record.date, "absent")}
            disabled={dayjs(record.date).isAfter(dayjs(), "day")}
          >
            Mark Absent
          </Button>
        </Space>
      ),
    },
  ];

  const updateAttendance = async (date, status) => {
    try {
      await axios.post(
        `http://localhost:4000/members/mark-attendance/${id}`,
        { status, date },
        { withCredentials: true }
      );
      toast.success("Attendance updated successfully");
      fetchAttendanceData();
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  const calculateAttendanceStats = () => {
    const filtered = attendanceData.filter(
      (record) =>
        dayjs(record.date).month() === monthFilter &&
        dayjs(record.date).year() === yearFilter
    );

    const presentDays = filtered.filter((a) => a.status === "present").length;
    const absentDays = filtered.filter((a) => a.status === "absent").length;
    const totalDays = filtered.length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      presentDays,
      absentDays,
      totalDays,
      attendanceRate,
    };
  };

  const stats = calculateAttendanceStats();

  if (!member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-5/6 mx-auto p-5">
      <Button onClick={goToMemberList} className="mb-4 bg-gray-300">
        ← Back to Member List
      </Button>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        <TabPane tab="Member Details" key="details">
          <Card className="shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-52 h-52 bg-gray-200 rounded-md flex items-center justify-center">
                {member.qrCodeUrl ? (
                  <Image
                    src={member.qrCodeUrl}
                    alt="QR Code"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <span className="text-gray-500 text-lg">No QR Code</span>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold">{member.name}</h2>
                <p className="text-xl text-gray-700">
                  Address: {member.address}
                </p>
                <p className="text-xl text-gray-700">
                  Phone: {member.phoneNumber}
                </p>
                <p className="text-xl text-gray-700">
                  Membership Type: {member.membershipType}
                </p>
                <p className="text-xl text-gray-700">
                  Join Date:{" "}
                  {new Date(member.joiningDate).toLocaleDateString("en-GB")}
                </p>
                <p className="text-xl text-gray-700">
                  Expires On:{" "}
                  {new Date(member.nextBillDate).toLocaleDateString("en-GB")}
                </p>
                <p className="text-xl text-gray-700">
                  Account Status:{" "}
                  {!status ? (
                    <Tag color="red">INACTIVE</Tag>
                  ) : member.freeze?.isFrozen ? (
                    <Tag color="orange">
                      FROZEN (since{" "}
                      {dayjs(member.freeze.freezeStartDate).format(
                        "DD MMM YYYY"
                      )}
                      )
                    </Tag>
                  ) : (
                    <Tag color="green">ACTIVE</Tag>
                  )}
                  {isExpired && (
                    <Tag color="red" className="ml-2">
                      Expired
                    </Tag>
                  )}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xl">Status:</span>
                  <Switch
                    checked={status}
                    onChange={handleStatusChange}
                    disabled={!canToggleStatus || member?.freeze?.isFrozen}
                  />
                  <span className="text-xl">
                    {status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <Divider />

            <div className="flex justify-center gap-4">
              {!isRenewing ? (
                <>
                  <Button
                    type="primary"
                    onClick={handleRenewClick}
                    className={status ? "bg-blue-600" : "bg-gray-400"}
                    disabled={!status}
                  >
                    Renew Membership
                  </Button>
                  <Button
                    type="default"
                    onClick={showEditModal}
                    className="border-gray-400"
                  >
                    Edit Details
                  </Button>
                  {member.freeze?.isFrozen ? (
                    <Button
                      type="primary"
                      danger
                      onClick={() => setIsUnfreezeModalVisible(true)}
                      disabled={!status}
                    >
                      Unfreeze Account
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      danger
                      onClick={() => setIsFreezeModalVisible(true)}
                      disabled={!status}
                    >
                      Freeze Account
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Select
                    placeholder="Select Membership Type"
                    style={{
                      width: 300,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onChange={handleMembershipChange}
                    size="large"
                  >
                    {membershipOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        <div className="flex justify-between w-full">
                          <span>{option.label.split(" - ")[0]}</span>
                          <span className="font-semibold">
                            ${option.label.split(" - ")[1]}
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                  <div className="flex gap-4">
                    <Button
                      type="primary"
                      onClick={handleSave}
                      className="bg-green-600"
                    >
                      Save
                    </Button>
                    <Button
                      type="default"
                      onClick={handleCancelRenew}
                      className="border-gray-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Attendance Report" key="attendance">
          <Card className="shadow-lg p-6">
            <div className="flex justify-between mb-6">
              <div className="flex gap-4">
                <Select
                  defaultValue={monthFilter}
                  style={{ width: 120 }}
                  onChange={setMonthFilter}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i} value={i}>
                      {dayjs().month(i).format("MMMM")}
                    </Option>
                  ))}
                </Select>
                <Select
                  defaultValue={yearFilter}
                  style={{ width: 120 }}
                  onChange={setYearFilter}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = dayjs().year() - 2 + i;
                    return (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </div>

              <div className="flex gap-6">
                <Statistic
                  title="Present Days"
                  value={stats.presentDays}
                  valueStyle={{ color: "#3f8600" }}
                />
                <Statistic
                  title="Absent Days"
                  value={stats.absentDays}
                  valueStyle={{ color: "#cf1322" }}
                />
                <Statistic
                  title="Attendance Rate"
                  value={stats.attendanceRate.toFixed(1)}
                  suffix="%"
                />
              </div>
            </div>

            <Table
              columns={attendanceColumns}
              dataSource={attendanceData}
              rowKey="date"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member Details"
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
          <Form.Item label="Address">
            <Input
              value={editedAddress}
              onChange={(e) => setEditedAddress(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Phone">
            <Input
              value={editedPhone}
              onChange={(e) => setEditedPhone(e.target.value)}
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

      {/* Freeze Account Modal */}
      <Modal
        title="Freeze Account"
        open={isFreezeModalVisible}
        onOk={handleFreezeAccount}
        onCancel={() => setIsFreezeModalVisible(false)}
        okText="Freeze"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Reason for freezing">
            <Input.TextArea
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
              placeholder="Enter reason for freezing account"
            />
          </Form.Item>
          <p className="text-red-500">
            Note: Freezing will pause the membership expiration count.
          </p>
        </Form>
      </Modal>

      {/* Unfreeze Account Modal */}
      <Modal
        title="Unfreeze Account"
        open={isUnfreezeModalVisible}
        onOk={handleUnfreezeAccount}
        onCancel={() => setIsUnfreezeModalVisible(false)}
        okText="Unfreeze"
        cancelText="Cancel"
      >
        <p>Are you sure you want to unfreeze this account?</p>
        {member.freeze?.freezeStartDate && (
          <p>
            Account frozen since:{" "}
            {dayjs(member.freeze.freezeStartDate).format("DD MMM YYYY")}
          </p>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default MemberDetail;
