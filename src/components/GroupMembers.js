import { useState, useEffect } from "react";
import Loading from "./Loading";

const GroupMembers = ({ client, groupId, groupName, close }) => {
  const [members, setMembers] = useState();

  useEffect(() => {
    const loadMembers = async () => {
      const { joined } = await client.getJoinedRoomMembers(groupId);
      let users = [];
      for (let user in joined) {
        users.push(joined[user]);
      }
      setMembers(users);
    };

    loadMembers();
  }, [client, groupId]);

  let membersList = <Loading />;

  if (members)
    membersList = members.map((member) => (
      <p key={member.display_name}>{member.display_name}</p>
    ));

  return (
    <>
      <p onClick={close} className="back">
        back to {groupName}
      </p>
      <h2>Members</h2>
      {membersList}
    </>
  );
};

export default GroupMembers;
