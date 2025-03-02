import { Button, Col, Row } from "antd";

const ListCard = ({
  index,
  name,
  address,
  phoneNumber,
  expireDate,
  memberDetail,
}) => {
  const ColStyles = {
    padding: 12,
    borderBottom: "1px solid lightgray",
    backgroundColor: "#EAF1F1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100, // Ensures columns don't shrink too much
    flex: 1, // Makes columns flexible
  };

  return (
    <Row style={{ display: "flex", width: "100%" }}>
      <Col style={ColStyles}>{index}</Col>
      <Col style={ColStyles}>{name}</Col>
      <Col style={ColStyles}>{address}</Col>
      <Col style={ColStyles}>{phoneNumber}</Col>
      <Col style={ColStyles}>{expireDate}</Col>
      <Col style={ColStyles}>
        <Button onClick={memberDetail}>View</Button>
      </Col>
    </Row>
  );
};

export default ListCard;
