import React, { Dispatch, useMemo } from 'react';
import { useAppSelector } from '@/store';
import { selectBasicParticipants } from '@/store/slices/participantSlice';
import Dropdown, { ISelectOption } from '@/helpers/ui/dropdown';

interface SpeechUsersSelectorProps {
  selectedSpeechUsers: Array<string>;
  setSelectedSpeechUsers: Dispatch<Array<string>>;
}

const SpeechUsersSelector = ({
  selectedSpeechUsers,
  setSelectedSpeechUsers,
}: SpeechUsersSelectorProps) => {
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
          id="speech-users"
          label="Chọn thành viên để dịch lời thoại"
          value={selectedSpeechUsers}
          onChange={setSelectedSpeechUsers}
          multiple={true}
          options={userOptions}
        />
      </div>
    );
  }, [participants, selectedSpeechUsers, setSelectedSpeechUsers]);
};

export default SpeechUsersSelector;
