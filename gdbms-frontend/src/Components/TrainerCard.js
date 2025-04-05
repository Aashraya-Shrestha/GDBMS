import { Button, Card, Descriptions } from "antd";

const TrainerCard = ({ name, contact, experience, trainerDetail }) => {
  return (
    <Card
      title={name}
      extra={
        <Button onClick={trainerDetail} type="link" size="small">
          View Details
        </Button>
      }
      style={{
        marginBottom: 16,
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Contact">
          {contact || "Not provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Experience">
          {experience ? `${experience} years` : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default TrainerCard;
