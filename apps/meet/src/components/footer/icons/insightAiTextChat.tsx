import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { updateIsActiveInsightsAiTextChat } from '../../../store/slices/bottomIconsActivitySlice';
import { Bot } from 'lucide-react';

const InsightsAiTextChatIcon = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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

  const wrapperClasses = clsx(
    'message relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25':
        isActiveAiTextChat,
      'border-transparent': !isActiveAiTextChat,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActiveAiTextChat,
      'bg-card': !isActiveAiTextChat,
    },
  );

  return (
    <div className={wrapperClasses} onClick={togglePanel}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActiveAiTextChat
            ? t('footer.icons.hide-ai-chat-panel')
            : t('footer.icons.show-ai-chat-panel')}
        </span>
        <Bot className="h-auto w-4 3xl:w-5" />
      </div>
    </div>
  );
};

export default InsightsAiTextChatIcon;
