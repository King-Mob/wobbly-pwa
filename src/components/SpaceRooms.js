import { useState, useEffect } from "react";
import GroupRoom from "./GroupRoom";
import GroupMembers from "./GroupMembers";
import Loading from "./Loading";

const GroupRooms = ({ client, groupId, close }) => {
  const [group, setGroup] = useState();
  const [groupDescription, setGroupDescription] = useState("");
  const [rooms, setRooms] = useState();
  const [roomSelected, setRoomSelected] = useState("no room selected");
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [invitee, setInvitee] = useState("");

  const loadGroupAndRooms = async () => {
    const group = await client.getRoom(groupId);
    setGroup(group);

    const { rooms } = await client.getRoomHierarchy(groupId);
    let posts = [];

    for (let room of rooms[0].children_state) {
      const post = await client.getRoom(room.state_key);
      posts.push(post);
    }

    setRooms(posts);
  };

  useEffect(() => {
    const loadGroupAndRooms = async () => {
      const group = await client.getRoom(groupId);
      setGroup(group);

      const { rooms } = await client.getRoomHierarchy(groupId);
      let posts = [];

      for (let room of rooms[0].children_state) {
        const post = await client.getRoom(room.state_key);
        posts.push(post);
      }

      setRooms(posts);

      posts.forEach((post) => {
        if (post.selfMembership === "invite") client.joinRoom(post.roomId);
      });

      await client.paginateEventTimeline(group.timelineSets[0].liveTimeline, {
        backwards: true,
      });

      for (let event of group.timeline) {
        if (event.event.type === "m.room.topic")
          setGroupDescription(event.event.content.topic);
      }
    };

    loadGroupAndRooms();
  }, [client, groupId]);

  const joinGroup = async () => {
    await client.joinRoom(groupId);
    const { rooms } = await client.getRoomHierarchy(groupId);
    for (let room of rooms[0].children_state) {
      await client.joinRoom(room.state_key);
    }
    loadGroupAndRooms();
  };

  const setPowerLevel = async (user, level) => {
    let lastPowerEvent;

    const searchTimeline = () => {
      for (let i = group.timeline.length - 1; i >= 0; i--) {
        const event = group.timeline[i];
        if (event.event.type === "m.room.power_levels") lastPowerEvent = event;
      }
    };

    while (!lastPowerEvent) {
      searchTimeline();
      if (!lastPowerEvent)
        await client.paginateEventTimeline(group.timelineSets[0].liveTimeline, {
          backwards: true,
        });
    }

    await client.setPowerLevel(groupId, user, level, lastPowerEvent);
  };

  const inviteUser = async () => {
    if (invitee.length > 0) {
      await client.invite(groupId, invitee);
      await setPowerLevel(invitee, 50);
      rooms.forEach((room) => {
        client.invite(room.roomId, invitee);
      });
      setInvitee("");
    }
  };

  const createRoom = async () => {
    if (newRoomName.length > 0) {
      setCreating(true);

      const { joined } = await client.getJoinedRoomMembers(groupId);
      delete joined[client.getUserId()];

      let users = Object.keys(joined);

      const newRoom = await client.createRoom({
        visibility: "private",
        invite: users,
        name: newRoomName,
      });

      client.setRoomEncryption(groupId, {
        algorithm: "m.megolm.v1.aes-sha2",
      });

      await client.sendStateEvent(
        groupId,
        "m.space.child",
        {
          via: ["matrix.org"],
        },
        newRoom.room_id
      );

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

  if (
    rooms &&
    rooms.length > 0 &&
    group.selfMembership === "join" &&
    roomSelected === "no room selected"
  ) {
    roomDisplay = rooms.map((room, i) => {
      console.log(room);
      return (
        <p
          key={i}
          onClick={() => setRoomSelected(room.roomId)}
          className="post"
        >
          {room.name}
        </p>
      );
    });
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

  if (group && group.selfMembership === "invite")
    roomDisplay = (
      <p className="group-button gap" onClick={joinGroup}>
        join group
      </p>
    );

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
              <p className="group-long-description">{groupDescription}</p>
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
      {/*
        <p className="group-button gap" onClick={setPowerLevel}>
          set power level
        </p>*/}
    </>
  );
};

export default GroupRooms;
