import { useState, useEffect } from "react";
import Room from "./Room";
import Loading from "./Loading";

const Rooms = ({ client, close }) => {
  const [rooms, setRooms] = useState();
  const [newRoomName, setNewRoomName] = useState("");
  const [roomSelected, setRoomSelected] = useState("no room selected");
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  console.log(rooms);

  useEffect(() => {
    const loadRooms = async () => {
      setRooms(await client.getRooms());
    };

    loadRooms();
  }, [client, creating]);

  const createRoom = async () => {
    if (newRoomName.length > 0) {
      setCreating(true);

      const newRoom = await client.createRoom({
        visibility: "private",
        invite: [],
        name: newRoomName,
      });

      await client.setRoomEncryption(newRoom.room_id, {
        algorithm: "m.megolm.v1.aes-sha2",
      });

      setCreating(false);
      setNewRoomName("");
    }
  };

  let roomDisplay = [];

  if (!rooms || rooms.length === 0)
    roomDisplay.push(<p key={0}>no rooms loaded</p>);

  if (rooms && rooms.length > 0 && roomSelected === "no room selected") {
    roomDisplay = rooms.map((room, i) => (
      <p key={i} onClick={() => setRoomSelected(room.roomId)}>
        {room.name}
      </p>
    ));
  }

  if (roomSelected === "no room selected") {
    roomDisplay.push(
      <div key={roomDisplay.length} className="invite-container">
        <button
          className="invite-button"
          onClick={() => setNewPostVisible(!newPostVisible)}
        >
          ✏️
        </button>
        {creating ? (
          <Loading />
        ) : (
          <p
            onClick={createRoom}
            className={
              newPostVisible
                ? newRoomName.length > 0
                  ? "group-button"
                  : "group-button inactive"
                : "invisible"
            }
          >
            Create
          </p>
        )}
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="new post title"
          className={newPostVisible ? "input half" : "invisible"}
        ></input>
      </div>
    );
  }

  return (
    <>
      {roomSelected === "no room selected" && (
        <p onClick={close} className="back">
          back to groups
        </p>
      )}
      {roomDisplay}
      {roomSelected !== "no room selected" && (
        <Room
          client={client}
          id={roomSelected}
          closeRoom={() => setRoomSelected("no room selected")}
        />
      )}
    </>
  );
};

export default Rooms;
