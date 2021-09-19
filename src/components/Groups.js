import { useState, useEffect } from "react";
import Rooms from "./Rooms";
import GroupRooms from "./GroupRooms";
import Loading from "./Loading";

const Groups = ({ client }) => {
  const [groups, setGroups] = useState();
  const [createVisible, setCreateVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [groupSelected, setGroupSelected] = useState("no group selected");

  console.log(groups);

  useEffect(() => {
    const prepareGroups = async () => {
      let rawGroups = client.getGroups();
      const groups = [];
      for (let group of rawGroups) {
        let groupInfo = await client.getGroupProfile(group.groupId);
        groupInfo.groupId = group.groupId;
        groups.push(groupInfo);
      }
      setGroups(groups);
    };

    prepareGroups();
  }, [client, newGroupName]);

  const createGroup = async () => {
    if (newGroupName.length > 0) {
      setCreating(true);

      const newGroup = await client.createGroup({
        localpart: newGroupName.replace(" ", "_").toLowerCase(),
      });

      await client.setGroupProfile(newGroup.group_id, {
        name: newGroupName,
        short_description: newGroupDescription,
        avatar_url: "none",
        long_description:
          newGroupDescription + " and that's not the half of it!",
      });

      setNewGroupName("");
      setNewGroupDescription("");
      setCreating(false);
    }
  };

  let groupsDisplay = [];

  if (!groups || groups.length === 0)
    groupsDisplay.push(<p key={0}>no groups to display</p>);

  if (groups && groups.length > 0 && groupSelected === "no group selected") {
    groupsDisplay = groups.map((group, i) => (
      <div
        key={i}
        className="group-info"
        onClick={() => setGroupSelected(group.groupId)}
      >
        <p className="group-name">{group.name}</p>
        <p className="group-short-description">{group.short_description}</p>
      </div>
    ));
  }

  if (groupSelected === "no group selected") {
    groupsDisplay.push(
      <p
        className="all-posts"
        key={groupsDisplay.length}
        onClick={() => setGroupSelected("rooms")}
      >
        All posts
      </p>
    );
  }

  if (groupSelected === "rooms")
    groupsDisplay = (
      <>
        <Rooms
          client={client}
          close={() => setGroupSelected("no group selected")}
        />
      </>
    );

  return (
    <>
      {groupSelected === "no group selected" && <h2>Groups</h2>}
      {groupsDisplay}
      {groupSelected !== "no group selected" && groupSelected !== "rooms" && (
        <GroupRooms
          client={client}
          groupId={groupSelected}
          close={() => setGroupSelected("no group selected")}
        />
      )}
      {groupSelected === "no group selected" && (
        <div className="new-group-container">
          <button
            className="invite-button"
            onClick={() => setCreateVisible(!createVisible)}
          >
            +
          </button>
          {creating ? (
            <Loading />
          ) : (
            <p
              className={
                createVisible
                  ? newGroupName.length > 0 && newGroupDescription.length > 0
                    ? "group-button"
                    : "group-button inactive"
                  : "invisible"
              }
              onClick={createGroup}
            >
              Create
            </p>
          )}
          <div className={createVisible ? "input-container" : "invisible"}>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="new group name"
              className="input full"
            ></input>
            <input
              type="text"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="new group description"
              className="input full"
            ></input>
          </div>
        </div>
      )}
    </>
  );
};

export default Groups;
