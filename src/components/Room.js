import { useEffect, useState } from "react";
import Event from "./Event";

const Room = ({ client, id, closeRoom }) => {
  const [room, setRoom] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [invitee, setInvitee] = useState("");

  console.log(room);

  useEffect(() => {
    client
      .setRoomEncryption(id, {
        algorithm: "m.megolm.v1.aes-sha2",
      })
      .then(() => {
        setRoom(client.getRoom(id));
      });
  });

  const joinRoom = async () => {
    await client.joinRoom(id);
    setRoom(client.getRoom(id));
  };

  const sendMessage = async () => {
    if (newMessage.length > 0) {
      await client.sendTextMessage(id, newMessage);
      setNewMessage("");
    }
  };

  const inviteUser = async () => {
    if (invitee.length > 0) {
      await client.invite(id, invitee);
      setInvitee("");
    }
  };

  let timeline = <p>loading timeline</p>;

  if (room && room.timeline)
    timeline = room.timeline.map((event, i) => (
      <Event key={i} event={event} client={client} />
    ));

  if (room && room.selfMembership === "invite")
    timeline = <p onClick={joinRoom}>join room</p>;

  return (
    <>
      <p onClick={closeRoom} className="back">
        back to all posts
      </p>
      {room && <h3>{room.name}</h3>}
      <input
        type="text"
        value={invitee}
        onChange={(e) => setInvitee(e.target.value)}
        placeholder="user id to invite"
      ></input>
      <button onClick={inviteUser}>Invite</button>
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

export default Room;
