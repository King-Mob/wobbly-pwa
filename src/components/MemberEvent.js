const MemberEvent = ({ event }) => {
  console.log(event);

  return (
    <div>
      <p>
        {event.event.content.displayname}
        {event.event.content.membership === "invite"
          ? " was invited"
          : " joined the chat"}
      </p>
    </div>
  );
};

export default MemberEvent;
