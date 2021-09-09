import { useState, useEffect } from "react";
import Room from "./Room";

const Rooms = ({ client }) => {
  const [rooms, setRooms] = useState();
  const [newRoomName, setNewRoomName] = useState("");
  const [roomSelected, setRoomSelected] = useState("no room selected");

  console.log(rooms);

  useEffect(() => {
    const loadRooms = async () => {
      setRooms(await client.getRooms());
    };

    loadRooms();
  }, [client]);

  const createRoom = async () => {
    if (newRoomName.length > 0) {
      const newRoom = await client.createRoom({
        visibility: "private",
        invite: [],
        name: newRoomName,
      });

      await client.setRoomEncryption(newRoom.room_id, {
        algorithm: "m.megolm.v1.aes-sha2",
      });

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
      <div key={roomDisplay.length}>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="new room name"
        ></input>
        <button className="App-link" onClick={createRoom}>
          Create room
        </button>
      </div>
    );
  }

  return (
    <div>
      {roomDisplay}
      {roomSelected !== "no room selected" && (
        <Room
          client={client}
          id={roomSelected}
          closeRoom={() => setRoomSelected("no room selected")}
        />
      )}
    </div>
  );
};

export default Rooms;
