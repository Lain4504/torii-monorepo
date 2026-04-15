import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import { store, useAppDispatch, useAppSelector } from '@/store';
import { updateIsActiveInsightsAiTextChat } from '@/store/slices/bottom-icons-activity-slice';
import { Bot } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

const InsightsAiTextChatIcon = () => {
  const dispatch = useAppDispatch();
  const { showTooltip } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
    };
  }, []);

  const isEnabled = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.aiFeatures?.aiTextChatFeatures?.isEnabled,
  );

  const isActiveAiTextChat = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveInsightsAiTextChat,
  );

  const togglePanel = useCallback(() => {
    dispatch(updateIsActiveInsightsAiTextChat(!isActiveAiTextChat));
  }, [dispatch, isActiveAiTextChat]);

  if (!isEnabled) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={togglePanel}
      className={clsx(
        'message footer-icon relative h-10 w-10 rounded-full border-border bg-card shadow-sm hover:bg-muted md:h-11 md:w-11 3xl:h-[52px] 3xl:w-[52px]',
        {
          'has-tooltip': showTooltip,
          'bg-muted': isActiveAiTextChat,
        },
      )}
    >
      <span className="tooltip">
        {isActiveAiTextChat ? 'Ẩn bảng chat AI' : 'Hiển thị bảng chat AI'}
      </span>
      <Bot className="h-4 w-4 3xl:h-5 3xl:w-5" />
    </Button>
  );
};

export default InsightsAiTextChatIcon;
