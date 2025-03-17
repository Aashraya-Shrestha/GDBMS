import { Button, Col, Row } from "antd";

const TrainerCard = ({ index, name, contact, experience, trainerDetail }) => {
  const ColStyles = {
    padding: 12,
    borderBottom: "1px solid lightgray",
    backgroundColor: "#EAF1F1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Makes columns flexible
    minWidth: 100, // Ensures columns don't shrink too much
  };

  return (
    <Row style={{ display: "flex", width: "100%" }}>
      <Col style={ColStyles}>{index}</Col>
      <Col style={ColStyles}>{name}</Col>
      <Col style={ColStyles}>{contact}</Col>
      <Col style={ColStyles}>{experience}</Col>
      <Col style={ColStyles}>
        <Button onClick={trainerDetail}>View</Button>
      </Col>
    </Row>
  );
};

export default TrainerCard;
