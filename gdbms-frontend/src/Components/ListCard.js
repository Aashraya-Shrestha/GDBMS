import { Button, Tag, Badge, Tooltip, Card, Descriptions, Switch } from "antd";
import PropTypes from "prop-types";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

const ListCard = ({
  index = 0,
  name = "",
  address = "",
  phoneNumber = "",
  expireDate = "N/A",
  memberDetail = () => {},
  attendanceStatus = "hasnt checked in",
  onToggleAttendance = () => {},
  isExpiringSoon = false,
}) => {
  const screens = useBreakpoint();

  const getAttendanceTagColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      default:
        return "orange";
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "absent":
        return <ClockCircleOutlined style={{ color: "#f5222d" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
    }
  };

  if (screens.xs || screens.sm) {
    return (
      <Card
        title={name}
        extra={
          <Button onClick={memberDetail} type="link" size="small">
            View
          </Button>
        }
        style={{
          marginBottom: 16,
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Address">{address}</Descriptions.Item>
          <Descriptions.Item label="Phone">{phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              icon={getAttendanceIcon(attendanceStatus)}
              color={getAttendanceTagColor(attendanceStatus)}
              style={{ display: "flex", alignItems: "center" }}
            >
              {attendanceStatus.replace(/\b\w/g, (l) => l.toUpperCase())}
            </Tag>
            <Switch
              checked={attendanceStatus === "present"}
              onChange={onToggleAttendance}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Expiry Date">
            <Tooltip title={isExpiringSoon ? "Membership expiring soon!" : ""}>
              <span
                style={{
                  color: isExpiringSoon ? "#f5222d" : "inherit",
                  fontWeight: isExpiringSoon ? 500 : "normal",
                }}
              >
                {expireDate}
                {isExpiringSoon && <Badge dot style={{ marginLeft: 8 }} />}
              </span>
            </Tooltip>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <div
      className="table-row"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, auto)",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fff",
        transition: "all 0.3s",
        ":hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <div
        style={{
          minWidth: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {index}
      </div>
      <div
        style={{
          minWidth: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
          fontWeight: 500,
        }}
      >
        {name}
      </div>
      <div
        style={{
          minWidth: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        <Tooltip title={address}>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              display: "inline-block",
            }}
          >
            {address}
          </span>
        </Tooltip>
      </div>
      <div
        style={{
          minWidth: 150,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {phoneNumber}
      </div>
      <div
        style={{
          minWidth: 250,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          padding: "0 8px",
        }}
      >
        <Tag
          icon={getAttendanceIcon(attendanceStatus)}
          color={getAttendanceTagColor(attendanceStatus)}
          style={{ display: "flex", alignItems: "center" }}
        >
          {attendanceStatus.replace(/\b\w/g, (l) => l.toUpperCase())}
        </Tag>
        <Switch
          checked={attendanceStatus === "present"}
          onChange={onToggleAttendance}
          checkedChildren="Present"
          unCheckedChildren="Absent"
        />
      </div>
      <div
        style={{
          minWidth: 150,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        <Tooltip title={isExpiringSoon ? "Membership expiring soon!" : ""}>
          <span
            style={{
              color: isExpiringSoon ? "#f5222d" : "inherit",
              fontWeight: isExpiringSoon ? 500 : "normal",
            }}
          >
            {expireDate}
            {isExpiringSoon && <Badge dot style={{ marginLeft: 8 }} />}
          </span>
        </Tooltip>
      </div>
      <div
        style={{
          minWidth: 150,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        <Button onClick={memberDetail} type="link" style={{ color: "#1890ff" }}>
          View
        </Button>
      </div>
    </div>
  );
};

ListCard.propTypes = {
  index: PropTypes.number,
  name: PropTypes.string,
  address: PropTypes.string,
  phoneNumber: PropTypes.string,
  expireDate: PropTypes.string,
  memberDetail: PropTypes.func,
  attendanceStatus: PropTypes.string,
  onToggleAttendance: PropTypes.func,
  isExpiringSoon: PropTypes.bool,
};

ListCard.defaultProps = {
  isExpiringSoon: false,
};

export default ListCard;
