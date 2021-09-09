import { useEffect, useState } from "react";
import Event from "./Event";

const GroupRoom = ({ client, id, closeRoom }) => {
  const [room, setRoom] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  console.log("hello this is group room");
  console.log(loaded);
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
    timeline = room.timeline.map((event, i) => <Event key={i} event={event} />);

  if (room && room.selfMembership === "invite")
    timeline = <p onClick={joinRoom}>join room</p>;

  if (!room) joinRoom();

  return (
    <div>
      {room && <h3>{room.name}</h3>}
      {timeline}
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        ></input>
        <button onClick={sendMessage}>Send</button>
        <p onClick={closeRoom}>close room</p>
      </div>
    </div>
  );
};

export default GroupRoom;
