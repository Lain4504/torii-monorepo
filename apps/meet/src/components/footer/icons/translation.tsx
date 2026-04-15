import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import { MessageSquareQuote } from 'lucide-react';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { updateDisplaySpeechSettingOptionsModal } from '@/store/slices/bottom-icons-activity-slice';
import { Button } from '@workspace/ui/components/button';

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

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleModal}
      className={clsx(
        'translationIcon footer-icon relative hidden h-11 w-11 rounded-full border-border bg-card shadow-sm hover:bg-muted md:inline-flex 3xl:h-[52px] 3xl:w-[52px]',
        {
          'has-tooltip': showTooltip,
          'bg-muted': isActiveDisplaySpeechSettingOptionsModal,
        },
      )}
    >
      <span className="tooltip">
        {isActiveDisplaySpeechSettingOptionsModal
          ? 'Ẩn cài đặt dịch'
          : 'Hiển thị cài đặt dịch'}
      </span>
      <MessageSquareQuote className="h-5 w-5 3xl:h-6 3xl:w-6" />
    </Button>
  );
};

export default Translation;
