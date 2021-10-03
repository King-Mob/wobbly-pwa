import { useEffect, useState, useCallback } from "react";
import Event from "./Event";

const GroupRoom = ({ client, id, closeRoom, groupName }) => {
  const [room, setRoom] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  console.log(room);

  const initRoom = useCallback(async () => {
    setRoom(client.getRoom(id));
    client.setRoomEncryption(id, {
      algorithm: "m.megolm.v1.aes-sha2",
    });
    setLoaded(true);
  }, [client, id]);

  useEffect(() => {
    if (loaded && room) {
      client.paginateEventTimeline(room.timelineSets[0].liveTimeline, {
        backwards: true,
      });
      setRoom(client.getRoom(id));
    } else initRoom();
  }, [loaded, client, id, initRoom, room]);

  const joinRoom = async () => {
    const result = await client.joinRoom(id);
    console.log(result);
    initRoom();
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

  if (room && room.selfMembership === "invite") joinRoom();

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
