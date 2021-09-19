import { useState, useEffect } from "react";
import Loading from "./Loading";

const GroupMembers = ({ client, groupId, groupName, close }) => {
  const [members, setMembers] = useState();

  useEffect(() => {
    const loadMembers = async () => {
      const groupUsers = await client.getGroupUsers(groupId);
      setMembers(groupUsers.chunk);
    };

    loadMembers();
  }, [client, groupId]);

  let membersList = <Loading />;

  if (members)
    membersList = members.map((member) => <p>{member.displayname}</p>);

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
