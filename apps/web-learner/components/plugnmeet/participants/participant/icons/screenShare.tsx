import React from 'react';

import { useAppSelector } from '@/store/plugnmeet';
import IconWrapper from './iconWrapper';
import { participantsSelector } from '@/store/plugnmeet/slices/participantSlice';

interface IScreenShareIconProps {
  userId: string;
}

const ScreenShareIcon = ({ userId }: IScreenShareIconProps) => {
  const screenShareTrack = useAppSelector(
    (state) => participantsSelector.selectById(state, userId)?.screenShareTrack,
  );

  return (
    screenShareTrack > 0 && (
      <IconWrapper>
        <i className="pnm-screen-share text-Gray-950 dark:text-white text-[10px] 3xl:text-sm" />
      </IconWrapper>
    )
  );
};

export default ScreenShareIcon;
