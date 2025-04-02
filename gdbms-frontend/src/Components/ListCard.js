import { Button, Col, Row, Switch, Tag, Badge, Tooltip } from "antd";
import PropTypes from "prop-types";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const ListCard = ({
  index = 0,
  name = "",
  address = "",
  phoneNumber = "",
  expireDate = "N/A",
  memberDetail = () => {},
  attendanceStatus = "hasnt checked in",
  onToggleAttendance = () => {},
  colWidths = [50, 150, 200, 150, 200, 150, 100],
  isExpiringSoon = false,
}) => {
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

  const safeColWidths =
    Array.isArray(colWidths) && colWidths.length === 7
      ? colWidths
      : [50, 150, 200, 150, 200, 150, 100];

  return (
    <Row
      style={{
        display: "flex",
        width: "100%",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fff",
        margin: 0,
        transition: "all 0.3s",
        ":hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Col
        style={{
          flex: `0 0 ${safeColWidths[0]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {index}
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[1]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
          fontWeight: 500,
        }}
      >
        {name}
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[2]}px`,
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
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[3]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {phoneNumber}
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[4]}px`,
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
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[5]}px`,
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
      </Col>
      <Col
        style={{
          flex: `0 0 ${safeColWidths[6]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        <Button onClick={memberDetail} type="link" style={{ color: "#1890ff" }}>
          View
        </Button>
      </Col>
    </Row>
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
  colWidths: PropTypes.arrayOf(PropTypes.number),
  isExpiringSoon: PropTypes.bool,
};

ListCard.defaultProps = {
  colWidths: [50, 150, 200, 150, 200, 150, 100],
  isExpiringSoon: false,
};

export default ListCard;
