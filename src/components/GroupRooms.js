import { useState, useEffect } from "react";
import GroupRoom from "./GroupRoom";
import GroupMembers from "./GroupMembers";
import Loading from "./Loading";

const GroupRooms = ({ client, groupId, close }) => {
  const [group, setGroup] = useState();
  const [rooms, setRooms] = useState();
  const [roomSelected, setRoomSelected] = useState("no room selected");
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [invitee, setInvitee] = useState("");

  console.log(rooms);

  const loadGroupAndRooms = async () => {
    let groupInfo = await client.getGroupProfile(groupId);
    groupInfo.groupId = groupId;
    setGroup(groupInfo);
    setRooms((await client.getGroupRooms(groupId)).chunk);
  };

  useEffect(() => {
    const loadGroupAndRooms = async () => {
      let groupInfo = await client.getGroupProfile(groupId);
      groupInfo.groupId = groupId;
      setGroup(groupInfo);
      setRooms((await client.getGroupRooms(groupId)).chunk);
    };

    loadGroupAndRooms();
  }, [client, groupId]);

  const joinGroup = async () => {
    await client.acceptGroupInvite(groupId);
    loadGroupAndRooms();
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

  const createRoom = async () => {
    if (newRoomName.length > 0) {
      setCreating(true);

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

      await loadGroupAndRooms();
      setNewRoomName("");
      setNewPostVisible(false);
      setCreating(false);
    }
  };

  let roomDisplay = [];

  if (!rooms || (rooms.length === 0 && roomSelected === "no room selected"))
    roomDisplay.push(<p key={0}>no posts loaded</p>);

  if (rooms && rooms.length > 0 && roomSelected === "no room selected") {
    roomDisplay = rooms.map((room, i) => (
      <p key={i} onClick={() => setRoomSelected(room.room_id)} className="post">
        {room.name}
      </p>
    ));
  }

  if (roomSelected === "no room selected") {
    roomDisplay.push(
      <>
        <div key={roomDisplay.length} className="new-post-container">
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
        <div className="invite-container" key={roomDisplay.length + 1}>
          <button
            onClick={() => setInviteVisible(!inviteVisible)}
            className="invite-button"
          >
            👥
          </button>
          <p
            onClick={inviteUser}
            className={
              inviteVisible
                ? invitee.length > 0
                  ? "group-button"
                  : "group-button inactive"
                : "invisible"
            }
          >
            Invite
          </p>
          <input
            type="text"
            className={inviteVisible ? "input half" : "invisible"}
            value={invitee}
            onChange={(e) => setInvitee(e.target.value)}
            placeholder="user id to invite"
          ></input>
        </div>
      </>
    );
  }

  if (group && group.myMembership === "invite")
    roomDisplay = <p onClick={joinGroup}>join group</p>;

  return (
    <>
      {roomSelected === "no room selected" && (
        <>
          <p onClick={close} className="back">
            back to groups
          </p>
        </>
      )}
      {roomSelected === "no room selected" &&
        (group ? (
          <div className="group-header">
            <div className="group-title">
              <h2>{group.name}</h2>
              <p className="group-long-description">{group.long_description}</p>
            </div>
            <p
              className="group-button"
              onClick={() => setRoomSelected("members")}
            >
              Members
            </p>
          </div>
        ) : (
          <Loading />
        ))}
      {roomDisplay}
      {roomSelected !== "no room selected" && roomSelected !== "members" && (
        <GroupRoom
          client={client}
          id={roomSelected}
          closeRoom={() => setRoomSelected("no room selected")}
          groupName={group.name}
        />
      )}
      {roomSelected === "members" && (
        <GroupMembers
          client={client}
          close={() => setRoomSelected("no room selected")}
          groupId={groupId}
          groupName={group.name}
        />
      )}
    </>
  );
};

export default GroupRooms;
