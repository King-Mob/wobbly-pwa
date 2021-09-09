import { useState, useEffect } from "react";
import GroupRoom from "./GroupRoom";

const GroupRooms = ({ client, groupId, close }) => {
  const [group, setGroup] = useState();
  const [invitee, setInvitee] = useState("");
  const [rooms, setRooms] = useState();
  const [newRoomName, setNewRoomName] = useState("");
  const [roomSelected, setRoomSelected] = useState("no room selected");

  console.log(rooms);

  /*
  const loadGroupAndRooms = async () => {
    console.log(await client.getGroupRooms(groupId));

    setGroup(await client.getGroup(groupId));
    setRooms((await client.getGroupRooms(groupId)).chunk);
  };
  */

  useEffect(() => {
    const loadGroupAndRooms = async () => {
      setGroup(await client.getGroup(groupId));
      setRooms((await client.getGroupRooms(groupId)).chunk);
    };

    loadGroupAndRooms();
  }, [client, groupId]);

  const joinGroup = async () => {
    await client.acceptGroupInvite(groupId);
    setRooms((await client.getGroupRooms(groupId)).chunk);
  };

  const inviteUser = async () => {
    if (invitee.length > 0) {
      await client.inviteUserToGroup(groupId, invitee);
      rooms.forEach((room) => {
        client.invite(room.room_id, invitee);
      });
      setInvitee("");
    }
  };

  const setGroupName = async () => {
    console.log(await client.getGroupProfile(groupId));
  };

  const createRoom = async () => {
    if (newRoomName.length > 0) {
      const newRoom = await client.createRoom({
        visibility: "private",
        invite: [],
        name: newRoomName,
      });

      await client.addRoomToGroup(groupId, newRoom.room_id, false);

      const groupUsers = await client.getGroupUsers(groupId);

      groupUsers.chunk.forEach((user) => {
        client.invite(newRoom.room_id, user.user_id);
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
      <p key={i} onClick={() => setRoomSelected(room.room_id)}>
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
        <button className="App-link" onClick={setGroupName}>
          Change group name
        </button>
        <p onClick={close}>back to groups</p>
      </div>
    );
  }

  if (group && group.myMembership === "invite")
    roomDisplay = <p onClick={joinGroup}>join group</p>;

  return (
    <div>
      <h2>{groupId}</h2>
      {roomSelected === "no room selected" && (
        <>
          <input
            type="text"
            value={invitee}
            onChange={(e) => setInvitee(e.target.value)}
            placeholder="user id to invite"
          ></input>
          <button onClick={inviteUser}>Invite</button>
        </>
      )}
      {roomDisplay}
      {roomSelected !== "no room selected" && (
        <GroupRoom
          client={client}
          id={roomSelected}
          closeRoom={() => setRoomSelected("no room selected")}
        />
      )}
      {/*<button onClick={loadGroupAndRooms}>Refresh group rooms</button>*/}
    </div>
  );
};

export default GroupRooms;
