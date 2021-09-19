import { useEffect, useState } from "react";
import Event from "./Event";

const GroupRoom = ({ client, id, closeRoom, groupName }) => {
  const [room, setRoom] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  console.log(room);

  useEffect(() => {
    if (loaded && room)
      client
        .setRoomEncryption(id, {
          algorithm: "m.megolm.v1.aes-sha2",
        })
        .then(() => {
          setRoom(client.getRoom(id));
        });
  });

  const joinRoom = async () => {
    const result = await client.joinRoom(id);
    console.log(result);
    setRoom(client.getRoom(id));
    setLoaded(true);
  };

  const sendMessage = async () => {
    if (newMessage.length > 0) {
      await client.sendTextMessage(id, newMessage);
      setNewMessage("");
    }
  };

  let timeline = <p>loading timeline</p>;

  if (room && room.timeline)
    timeline = room.timeline.map((event, i) => (
      <Event key={i} event={event} client={client} />
    ));

  if (room && room.selfMembership === "invite")
    timeline = <p onClick={joinRoom}>join room</p>;

  if (!room) joinRoom();

  return (
    <>
      <p onClick={closeRoom} className="back">
        back to {groupName}
      </p>
      {room && <h3>{room.name}</h3>}
      <div className="timeline">{timeline}</div>
      <div className="new-message-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="new-message"
        ></input>
        <p
          onClick={sendMessage}
          className={
            newMessage.length > 0 ? "group-button" : "group-button inactive"
          }
        >
          Send
        </p>
      </div>
    </>
  );
};

export default GroupRoom;
