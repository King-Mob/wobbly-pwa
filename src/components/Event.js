import Message from "./Message";

const Event = ({ event }) => {
  switch (event.event.type) {
    case "m.room.encrypted":
      return <Message message={event} />;
    default:
      return <p>{event.event.type.split("m.room.")[1]}</p>;
  }
};

export default Event;
