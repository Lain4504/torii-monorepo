import React from 'react';
import { useAppSelector } from '../../../../store';
import IconWrapper from './iconWrapper';
import { participantsSelector } from '../../../../store/slices/participantSlice';

interface VisibilityIconProps {
  userId: string;
}

const VisibilityIcon = ({ userId }: VisibilityIconProps) => {
  const visibility = useAppSelector(
    (state) => participantsSelector.selectById(state, userId)?.visibility,
  );

  return (
    visibility === 'hidden' && (
      <IconWrapper>
        <i className="wajlc-eye-slash text-foreground dark:text-white text-sm 3xl:text-base" />
      </IconWrapper>
    )
  );
};

export default VisibilityIcon;
