import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { participantsSelector } from '../../../store/slices/participantSlice';
import { ParticipantsIconSVG } from '../../../assets/Icons/ParticipantsIconSVG';
import { setActiveSidePanel } from '../../../store/slices/bottomIconsActivitySlice';

const ParticipantIcon = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { showTooltip } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
    };
  }, []);

  const isActiveParticipantsPanel = useAppSelector(
    (state) => state.bottomIconsActivity.activeSidePanel === 'PARTICIPANTS',
  );
  const participantsTotal = useAppSelector(participantsSelector.selectTotal);

  const toggleParticipantsPanel = useCallback(() => {
    dispatch(setActiveSidePanel('PARTICIPANTS'));
  }, [dispatch]);

  const wrapperClasses = clsx(
    'participants relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25':
        isActiveParticipantsPanel,
      'border-transparent': !isActiveParticipantsPanel,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActiveParticipantsPanel,
      'bg-card': !isActiveParticipantsPanel,
    },
  );

  return (
    <div className={wrapperClasses} onClick={toggleParticipantsPanel}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActiveParticipantsPanel
            ? t('footer.icons.hide-users-list')
            : t('footer.icons.show-users-list')}
        </span>
        <ParticipantsIconSVG />
        {!isActiveParticipantsPanel && (
          <div className="unseen-message-count bg-primary w-4 3xl:w-5 h-4 3xl:h-5 rounded-full text-[10px] 3xl:text-xs text-primary-foreground absolute -top-2 -right-1 flex justify-center items-center">
            {participantsTotal}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantIcon;
