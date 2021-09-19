const Message = ({ message, client }) => {
  let body = "body encrypted";

  const sender = client.getUser(message.event.sender);
  const ownId = client.getUserId();

  if (message.clearEvent) body = message.clearEvent.content.body;

  return (
    <div
      className={
        ownId === sender.userId
          ? "self message-container"
          : "other message-container"
      }
    >
      <p className="message">{body}</p>
      <p className="sender">{sender.displayName}</p>
    </div>
  );
};

export default Message;
