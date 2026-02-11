import React, { Fragment } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { createSelector } from '@reduxjs/toolkit';

import { RootState, useAppDispatch, useAppSelector } from '../../store';
import { selectChatKeys } from '../../store/slices/chatMessagesSlice';
import Messages from './messages';
import { participantsSelector } from '../../store/slices/participantSlice';
import {
  updateSelectedChatOption,
  updateUnreadMsgFrom,
} from '../../store/slices/roomSettingsSlice';
import { X, Check, MessageSquareDot } from 'lucide-react';
import { setActiveSidePanel } from '../../store/slices/bottomIconsActivitySlice';
import ChatTranslation from './chatTranslation';

interface IChatOption {
  id: string;
  title: string;
  hasUnread: boolean;
}

const selectChatTabsData = createSelector(
  [
    selectChatKeys,
    participantsSelector.selectEntities,
    (state: RootState) => state.roomSettings.initiatePrivateChat,
    (state: RootState) => state.roomSettings.unreadMsgFrom,
    (state: RootState) => state.roomSettings.selectedChatOption,
  ],
  (
    chatKeys,
    participantEntities,
    initiatePrivateChat,
    unreadMsgFrom,
    selectedChatOption,
  ) => {
    const allKeys = [...chatKeys];
    // let's add user from initiatePrivateChat
    if (
      initiatePrivateChat.userId &&
      !allKeys.includes(initiatePrivateChat.userId)
    ) {
      allKeys.push(initiatePrivateChat.userId);
    }

    const options: IChatOption[] = [];
    allKeys.forEach((k) => {
      if (k === 'public') {
        options.push({
          id: 'public',
          title: 'Trò chuyện công khai',
          hasUnread: unreadMsgFrom.includes('public'),
        });
      } else {
        const participant = participantEntities[k];
        let title = k; // Use key as fallback
        if (participant) {
          title = participant.name;
        } else if (initiatePrivateChat.userId === k) {
          title = initiatePrivateChat.name;
        }

        options.push({
          id: k,
          title: title,
          hasUnread: unreadMsgFrom.includes(k),
        });
      }
    });

    const selected = options.find((o) => o.id === selectedChatOption);
    const selectedTitle = selected?.title ?? 'Trò chuyện công khai';

    return {
      chatOptions: options,
      selectedChatOption,
      selectedTitle,
      hasUnreadMessages: unreadMsgFrom.length > 0,
    };
  },
);

const ChatTabs = () => {
  const dispatch = useAppDispatch();

  const { chatOptions, selectedChatOption, selectedTitle, hasUnreadMessages } =
    useAppSelector(selectChatTabsData);

  const onChange = (id: string) => {
    dispatch(updateSelectedChatOption(id));
    dispatch(
      updateUnreadMsgFrom({
        task: 'DEL',
        id: id,
      }),
    );
  };

  const closePanel = () => {
    dispatch(setActiveSidePanel(null));
  };

  return (
    <div className="h-full">
      <div className="top-chat-header flex items-center gap-2 h-10 px-3 3xl:px-5 justify-between">
        <div className="left flex items-center gap-3">
          <p className="text-sm text-foreground 3xl:font-medium leading-tight">
            {selectedChatOption === 'public'
              ? 'Trò chuyện công khai'
              : 'Trò chuyện riêng tư'}
          </p>
          <ChatTranslation />
        </div>
        <div className="text-muted-foreground cursor-pointer" onClick={closePanel}>
          <X className="w-5 h-5" />
        </div>
      </div>
      <Listbox value={selectedChatOption} onChange={onChange}>
        <div className="relative z-10 chat-tabs">
          <ListboxButton className="flex items-center justify-between border-y border-border h-8 3xl:h-10 w-full outline-hidden px-3 3xl:px-5 text-xs 3xl:text-sm text-muted-foreground cursor-pointer">
            <p className="block truncate">
              To:{' '}
              <span className="font-medium text-foreground">
                {selectedTitle}
              </span>
            </p>
            <span className="pointer-events-none absolute inset-y-0 right-3 3xl:right-5 flex items-center">
              {hasUnreadMessages && (
                <span className="shake pr-1 -mb-1">
                  <MessageSquareDot className="w-4 h-4 text-primary shake" />
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="none"
                className="h-auto w-3 3xl:w-4"
              >
                <path d="M12 6L8 10L4 6" fill="#4D6680" />
                <path
                  d="M12 6L8 10L4 6H12Z"
                  stroke="#4D6680"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 z-90"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute max-h-60 w-[calc(100%-8px)] left-1 border border-border bg-popover shadow-lg rounded-xl overflow-hidden p-2">
              <div className="title h-8 w-full flex items-center text-xs leading-none text-muted-foreground px-3 uppercase">
                Chọn một cuộc trò chuyện
              </div>
              {chatOptions.map((option) => (
                <ListboxOption
                  key={option.id}
                  className={({ focus, selected }) =>
                    `h-8 w-full cursor-pointer flex items-center text-sm gap-2 leading-none 3xl:font-medium text-foreground px-3 rounded-lg transition-all duration-300 hover:bg-muted relative ${focus ? 'bg-muted' : ''
                    } ${selected ? 'bg-muted' : ''}`
                  }
                  value={option.id}
                >
                  {({ selected }) => (
                    <>
                      <span>
                        {option.title}
                        {option.hasUnread && (
                          <span className="shake pl-2">
                            <MessageSquareDot className="w-4 h-4 text-primary shake" />
                          </span>
                        )}
                      </span>
                      {selected && (
                        <span className="right absolute right-3">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      <div className="h-[calc(100%-135px)] 3xl:h-[calc(100%-176px)] chat-messages-container">
        <Messages messageKey={selectedChatOption} />
      </div>
    </div>
  );
};

export default React.memo(ChatTabs);
