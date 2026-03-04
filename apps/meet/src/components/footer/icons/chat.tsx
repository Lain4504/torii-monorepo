import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import { store, useAppDispatch, useAppSelector } from '@/store';
import { MessageSquare } from 'lucide-react';
import { setActiveSidePanel } from '@/store/slices/bottomIconsActivitySlice';

const ChatIcon = () => {
  const dispatch = useAppDispatch();
  const { showTooltip } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
    };
  }, []);

  const isActiveChatPanel = useAppSelector(
    (state) => state.bottomIconsActivity.activeSidePanel === 'CHAT',
  );
  const totalUnreadChatMsgs = useAppSelector(
    (state) => state.bottomIconsActivity.totalUnreadChatMsgs,
  );

  const toggleChatPanel = useCallback(() => {
    dispatch(setActiveSidePanel('CHAT'));
  }, [dispatch]);

  const wrapperClasses = clsx(
    'message relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25': isActiveChatPanel,
      'border-transparent': !isActiveChatPanel,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActiveChatPanel,
      'bg-card': !isActiveChatPanel,
    },
  );

  return (
    <div className={wrapperClasses} onClick={toggleChatPanel}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActiveChatPanel
            ? 'Ẩn bảng chat'
            : 'Hiển thị bảng chat'}
        </span>
        <MessageSquare className="w-auto h-4 md:h-5 3xl:h-6" />
        {!isActiveChatPanel && totalUnreadChatMsgs > 0 && (
          <div className="unseen-message-count bg-primary w-4 3xl:w-5 h-4 3xl:h-5 rounded-full text-[10px] 3xl:text-xs text-primary-foreground absolute -top-2 -right-1 flex justify-center items-center">
            {totalUnreadChatMsgs}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatIcon;
