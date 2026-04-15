import React, { Dispatch, useMemo } from 'react';

import { useAppSelector } from '@/store';
import { selectBasicParticipants } from '@/store/slices/participant-slice';
import Dropdown, { ISelectOption } from '@/helpers/ui/dropdown';

interface UsersSelectorProps {
  selectedUsers: Array<string>;
  setSelectedUsers: Dispatch<Array<string>>;
}

const UsersSelector = ({
  selectedUsers,
  setSelectedUsers,
}: UsersSelectorProps) => {
  const participants = useAppSelector(selectBasicParticipants);

  return useMemo(() => {
    const users = participants.filter(
      (p) =>
        p.name !== '' && p.userId !== 'RECORDER_BOT' && p.userId !== 'RTMP_BOT',
    );

    const userOptions: ISelectOption[] = users.map((u) => ({
      value: u.userId,
      text: u.name,
    }));

    return (
      <div className="">
        <Dropdown
          id="allowed-users"
          label="Người dùng được phép"
          value={selectedUsers}
          onChange={setSelectedUsers}
          multiple={true}
          options={userOptions}
        />
      </div>
    );
  }, [participants, selectedUsers, setSelectedUsers]);
};

export default UsersSelector;
