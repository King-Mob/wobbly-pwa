const Message = ({ message }) => {
  let body = "body encrypted";

  if (message.clearEvent) body = message.clearEvent.content.body;

  return (
    <div>
      <p>{body}</p>
      <p>{message.event.sender}</p>
    </div>
  );
};

export default Message;
