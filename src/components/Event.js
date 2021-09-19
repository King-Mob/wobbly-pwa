import Message from "./Message";
import MemberEvent from "./MemberEvent";

const Event = ({ event, client }) => {
  switch (event.event.type) {
    case "m.room.encrypted":
      return <Message message={event} client={client} />;
    case "m.room.member":
      return <MemberEvent event={event} />;
    default:
      return (
        <p className="event">event: {event.event.type.split("m.room.")[1]}</p>
      );
  }
};

export default Event;
