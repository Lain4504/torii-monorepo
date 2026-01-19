import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { setActiveSidePanel } from '../../../store/slices/bottomIconsActivitySlice';
import { BarChart2 } from 'lucide-react';

const PollsIcon = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const showTooltip = useMemo(
    () => store.getState().session.userDeviceType === 'desktop',
    [],
  );

  const isActive = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.pollsFeatures?.isActive,
  );
  const isActivePollsPanel = useAppSelector(
    (state) => state.bottomIconsActivity.activeSidePanel === 'POLLS',
  );

  useEffect(() => {
    if (!isActive && isActivePollsPanel) {
      dispatch(setActiveSidePanel('POLLS'));
    }
    //eslint-disable-next-line
  }, [isActive]);

  const togglePollsPanel = useCallback(() => {
    dispatch(setActiveSidePanel('POLLS'));
  }, [dispatch]);

  const wrapperClasses = clsx(
    'pollsIcon hidden md:block relative footer-icon cursor-pointer w-11 3xl:w-[52px] h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25':
        isActivePollsPanel,
      'border-transparent': !isActivePollsPanel,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActivePollsPanel,
      'bg-card': !isActivePollsPanel,
    },
  );

  if (!isActive) {
    return null;
  }

  return (
    <div className={wrapperClasses} onClick={togglePollsPanel}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActivePollsPanel
            ? t('footer.icons.hide-polls-panel')
            : t('footer.icons.show-polls-panel')}
        </span>
        <BarChart2 className="w-auto h-4 3xl:h-5" />
      </div>
    </div>
  );
};

export default PollsIcon;
