import { Button, Col, Row, Switch, Tag } from "antd";

const ListCard = ({
  index,
  name,
  address,
  phoneNumber,
  expireDate,
  memberDetail,
  attendanceStatus,
  onToggleAttendance,
}) => {
  const ColStyles = {
    padding: 12,
    borderBottom: "1px solid lightgray",
    backgroundColor: "#EAF1F1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    flex: 1,
  };

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

  return (
    <Row style={{ display: "flex", width: "100%" }}>
      <Col style={ColStyles}>{index}</Col>
      <Col style={ColStyles}>{name}</Col>
      <Col style={ColStyles}>{address}</Col>
      <Col style={ColStyles}>{phoneNumber}</Col>
      <Col style={ColStyles}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tag color={getAttendanceTagColor(attendanceStatus)}>
            {attendanceStatus}
          </Tag>
          <Switch
            checked={attendanceStatus === "present"}
            onChange={onToggleAttendance}
          />
        </div>
      </Col>
      <Col style={ColStyles}>{expireDate}</Col>
      <Col style={ColStyles}>
        <Button onClick={memberDetail}>View</Button>
      </Col>
    </Row>
  );
};

export default ListCard;
