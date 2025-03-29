import { Button, Col, Row, Switch, Tag } from "antd";
import PropTypes from "prop-types";

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
        borderBottom: "1px solid lightgray",
        backgroundColor: "#EAF1F1",
        margin: 0,
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
        {address}
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
        <Tag color={getAttendanceTagColor(attendanceStatus)}>
          {attendanceStatus}
        </Tag>
        <Switch
          checked={attendanceStatus === "present"}
          onChange={onToggleAttendance}
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
        {expireDate}
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
        <Button onClick={memberDetail}>View</Button>
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
};

ListCard.defaultProps = {
  colWidths: [50, 150, 200, 150, 200, 150, 100],
};

export default ListCard;
