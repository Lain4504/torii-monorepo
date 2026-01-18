import React from 'react';

import { useAppSelector } from '../../../../store';
import { participantsSelector } from '../../../../store/slices/participantSlice';
import IconWrapper from './iconWrapper';
import { Video } from 'lucide-react';

interface WebcamIconProps {
  userId: string;
}

const WebcamIcon = ({ userId }: WebcamIconProps) => {
  const videoTracks = useAppSelector(
    (state) => participantsSelector.selectById(state, userId)?.videoTracks,
  );

  return (
    videoTracks > 0 && (
      <IconWrapper>
        <Video className={'h-3 3xl:h-4 w-auto dark:text-white'} />
      </IconWrapper>
    )
  );
};

export default WebcamIcon;
