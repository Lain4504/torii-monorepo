import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import { MessageSquareQuote } from 'lucide-react';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { updateDisplaySpeechSettingOptionsModal } from '@/store/slices/bottomIconsActivitySlice';

const Translation = () => {
  const dispatch = useAppDispatch();

  const { showTooltip } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
    };
  }, []);

  const isActiveDisplaySpeechSettingOptionsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showSpeechSettingOptionsModal,
  );
  const isEnabled = useAppSelector(
    (state) =>
      !!state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.transcriptionFeatures?.isEnabled,
  );

  const toggleModal = useCallback(() => {
    dispatch(
      updateDisplaySpeechSettingOptionsModal(
        !isActiveDisplaySpeechSettingOptionsModal,
      ),
    );
  }, [dispatch, isActiveDisplaySpeechSettingOptionsModal]);

  if (!isEnabled) {
    return null;
  }

  const wrapperClasses = clsx(
    'translationIcon hidden md:block relative footer-icon cursor-pointer w-11 3xl:w-[52px] h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25':
        isActiveDisplaySpeechSettingOptionsModal,
      'border-transparent': !isActiveDisplaySpeechSettingOptionsModal,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground bg-card',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActiveDisplaySpeechSettingOptionsModal,
      'bg-card': !isActiveDisplaySpeechSettingOptionsModal,
    },
  );

  return (
    <div className={wrapperClasses} onClick={toggleModal}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActiveDisplaySpeechSettingOptionsModal
            ? 'Ẩn cài đặt dịch'
            : 'Hiển thị cài đặt dịch'}
        </span>
        <MessageSquareQuote className="h-6 w-auto" />
      </div>
    </div>
  );
};

export default Translation;
