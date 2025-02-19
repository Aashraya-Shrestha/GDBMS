import { Button, Col, Row } from "antd";

const ListCard = ({
  index,
  name,
  email,
  phoneNumber,
  memberType,
  joinDate,
  editMember,
  deleteMember,
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
      <Col style={ColStyles}>{email}</Col>
      <Col style={ColStyles}>{phoneNumber}</Col>
      <Col style={ColStyles}>{memberType}</Col>
      <Col style={ColStyles}>{joinDate}</Col>
      <Col style={ColStyles}>
        <Button onClick={editMember}>Edit</Button>
      </Col>
      <Col style={ColStyles}>
        <Button danger onClick={deleteMember}>
          Delete
        </Button>
      </Col>
    </Row>
  );
};

export default ListCard;
