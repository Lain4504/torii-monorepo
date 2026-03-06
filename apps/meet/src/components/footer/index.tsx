import React, { useMemo } from 'react';

import { store } from '@/store';
import WebcamIcon from '@/components/footer/icons/webcam';
import MicrophoneIcon from '@/components/footer/icons/microphone';
import ChatIcon from '@/components/footer/icons/chat';
import ParticipantIcon from '@/components/footer/icons/participant';
import RaiseHandIcon from '@/components/footer/icons/raisehand';
import ScreenshareIcon from '@/components/footer/icons/screenshare';
import MenusIcon from '@/components/footer/icons/menus';
import WhiteboardIcon from '@/components/footer/icons/whiteboard';
import BreakoutRoomInvitation from '@/components/breakout-room/breakoutRoomInvitation';
import EndMeetingButton from '@/components/footer/icons/endMeeting';
import RecordingIcon from '@/components/footer/icons/recording';
import PollsIcon from '@/components/footer/icons/polls';
import Translation from '@/components/footer/icons/translation';
import InsightsAiTextChatIcon from '@/components/footer/icons/insightAiTextChat';

const Footer = () => {
  const { isAdmin, isRecorder, allowChat } = useMemo(() => {
    const { currentRoom, currentUser } = store.getState().session;
    return {
      isAdmin: !!currentUser?.metadata?.isAdmin,
      isRecorder: !!currentUser?.isRecorder,
      allowChat: !!currentRoom.metadata?.roomFeatures?.chatFeatures?.isAllow,
    };
  }, []);

  return (
    <footer
      id="main-footer"
      className={`px-2 md:px-4 flex items-center justify-between bg-card h-[54px] 3xl:h-[76px] border-t border-border relative z-[100] ${isRecorder ? 'hidden' : ''
        }`}
    >
      <div className="footer-inner flex items-center justify-between w-full rtl:flex-row-reverse">
        <div className="footer-left w-[155px] lg:w-72 flex items-center gap-1 3xl:gap-2 relative z-50 rtl:justify-end">
          <MicrophoneIcon />
          <WebcamIcon />
        </div>

        <div className="footer-middle flex items-center gap-1 3xl:gap-2">
          <ScreenshareIcon />
          <WhiteboardIcon />
          <RaiseHandIcon />
          <PollsIcon />
          <Translation />
          <InsightsAiTextChatIcon />
          <RecordingIcon />
          <div className="icon block md:hidden">
            <ParticipantIcon />
          </div>
          {allowChat && (
            <div className="icon block md:hidden">
              <ChatIcon />
            </div>
          )}
          <MenusIcon isAdmin={isAdmin} />
          <div className="icon block md:hidden">
            <EndMeetingButton />
          </div>
        </div>

        <div className="footer-right w-[155px] lg:w-72 hidden md:flex items-center justify-end gap-2">
          <ParticipantIcon />
          {allowChat && <ChatIcon />}
          <div className="line h-6 w-px bg-border"></div>
          <EndMeetingButton />
        </div>
        <BreakoutRoomInvitation />
      </div>
    </footer>
  );
};

export default React.memo(Footer);
