import { useState, useEffect } from "react";
import Rooms from "./Rooms";
import GroupRooms from "./GroupRooms";

const Groups = ({ client }) => {
  const [groups, setGroups] = useState();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [groupSelected, setGroupSelected] = useState("no group selected");

  console.log(groups);

  useEffect(() => {
    setGroups(client.getGroups());
  }, [client, newGroupName]);

  const createGroup = async () => {
    if (newGroupName.length > 0) {
      await client.createGroup({
        localpart: newGroupName.replace(" ", "-"),
        profile: {
          name: newGroupName,
          short_description: newGroupDescription,
          avatar_url: "none",
          long_description:
            newGroupDescription + " and that's not the half of it!",
        },
      });

      setNewGroupName("");
      setNewGroupDescription("");
    }
  };

  let groupsDisplay = [];

  if (!groups || groups.length === 0)
    groupsDisplay.push(<p key={0}>no groups to display</p>);

  if (groups && groups.length > 0 && groupSelected === "no group selected") {
    groupsDisplay = groups.map((group, i) => (
      <p key={i} onClick={() => setGroupSelected(group.groupId)}>
        {group.groupId}
      </p>
    ));
  }

  if (groupSelected === "no group selected") {
    groupsDisplay.push(
      <div key={groupsDisplay.length}>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="name of new group"
        ></input>
        <input
          type="text"
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
          placeholder="description of new group"
        ></input>
        <p className="App-link" onClick={createGroup}>
          Create group
        </p>
        <p key={groupsDisplay.length} onClick={() => setGroupSelected("rooms")}>
          see all rooms
        </p>
      </div>
    );
  }

  if (groupSelected === "rooms")
    groupsDisplay = (
      <>
        <Rooms client={client} />
        <p onClick={() => setGroupSelected("no group selected")}>
          back to groups
        </p>
      </>
    );

  return (
    <div>
      {groupsDisplay}
      {groupSelected !== "no group selected" && groupSelected !== "rooms" && (
        <GroupRooms
          client={client}
          groupId={groupSelected}
          close={() => setGroupSelected("no group selected")}
        />
      )}
    </div>
  );
};

export default Groups;
