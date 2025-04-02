import { Button, Col, Row, Tag } from "antd";

const TrainerCard = ({
  index,
  name,
  contact,
  experience,
  trainerDetail,
  colWidths,
}) => {
  const theme = {
    cardBg: "#ffffff",
    border: "#e0e0e0",
    primary: "#1890ff",
    hoverBg: "#f8fafc",
  };

  return (
    <Row
      style={{
        display: "flex",
        width: "100%",
        backgroundColor: theme.cardBg,
        borderBottom: `1px solid ${theme.border}`,
        transition: "all 0.3s ease",
        ":hover": {
          backgroundColor: theme.hoverBg,
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Col
        style={{
          padding: "18px 24px",
          textAlign: "left",
          flex: `0 0 ${colWidths[0]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#555",
          fontSize: 14,
        }}
      >
        {index}
      </Col>
      <Col
        style={{
          padding: "18px 24px",
          textAlign: "left",
          flex: `0 0 ${colWidths[1]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 500,
          color: "#333",
          fontSize: 15,
        }}
      >
        {name}
      </Col>
      <Col
        style={{
          padding: "18px 24px",
          textAlign: "center",
          flex: `0 0 ${colWidths[2]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#555",
          fontSize: 14,
        }}
      >
        {contact || "Not provided"}
      </Col>
      <Col
        style={{
          padding: "18px 24px",
          textAlign: "center",
          flex: `0 0 ${colWidths[3]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#555",
          fontSize: 14,
        }}
      >
        {experience ? `${experience} years` : "N/A"}
      </Col>
      <Col
        style={{
          padding: "18px 24px",
          textAlign: "center",
          flex: `0 0 ${colWidths[4]}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          onClick={trainerDetail}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
            padding: "0 20px",
            height: 36,
            fontWeight: 500,
          }}
        >
          View Details
        </Button>
      </Col>
    </Row>
  );
};

export default TrainerCard;
