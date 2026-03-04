import React from 'react';


import { useWhiteboard } from '@/components/main-area/hooks/useWhiteboard';
import { useExternalMediaPlayer } from '@/components/main-area/hooks/useExternalMediaPlayer';
import { useDisplayExternalLink } from '@/components/main-area/hooks/useDisplayExternalLink';
import { useVideosComponent } from '@/components/main-area/hooks/useVideosComponent';
import { useScreenShareElements } from '@/components/main-area/hooks/useScreenShareElements';
import { useTranslationTranscription } from '@/components/main-area/hooks/useTranslationTranscription';
import { useVideoLayout } from '@/components/main-area/hooks/useVideoLayout';

import AudioElements from '@/components/media-elements/audios';
import LayoutWrapper from '@/components/main-area/layoutWrapper';
import { useInsightsAiTextChat } from '@/components/main-area/hooks/useInsightsAiTextChat';

interface IMainViewProps {
  isRecorder: boolean;
  isActiveWhiteboard: boolean;
  isActiveExternalMediaPlayer: boolean;
  isActiveDisplayExternalLink: boolean;
  isActiveScreenSharingView: boolean;
  hasScreenShareSubscribers: boolean;
  isActiveWebcamsView: boolean;
  hasVideoSubscribers: boolean;
}

const MainView = ({
  isRecorder,
  isActiveWhiteboard,
  isActiveExternalMediaPlayer,
  isActiveDisplayExternalLink,
  isActiveScreenSharingView,
  hasScreenShareSubscribers,
  isActiveWebcamsView,
  hasVideoSubscribers,
}: IMainViewProps) => {
  const { showVerticalVideoView, showVideoElms, pinCamUserId } = useVideoLayout(
    {
      hasScreenShareSubscribers,
      isActiveWhiteboard,
      isActiveExternalMediaPlayer,
      isActiveDisplayExternalLink,
      isActiveWebcamsView,
      hasVideoSubscribers,
    },
  );


  const insightsAiTextChatElm = useInsightsAiTextChat();
  const whiteboardElm = useWhiteboard(
    isActiveWhiteboard,
    hasScreenShareSubscribers,
    showVideoElms,
  );
  const externalMediaPlayerElm = useExternalMediaPlayer(
    isActiveExternalMediaPlayer,
    hasScreenShareSubscribers,
    isActiveWhiteboard,
    isRecorder,
  );
  const displayExternalLinkElm = useDisplayExternalLink(
    isActiveDisplayExternalLink,
    hasScreenShareSubscribers,
    isActiveWhiteboard,
    isActiveExternalMediaPlayer,
    isRecorder,
  );

  const videosComponentElm = useVideosComponent(
    isActiveWebcamsView,
    showVerticalVideoView,
  );
  const screenShareElementsElm = useScreenShareElements(
    isActiveScreenSharingView,
  );
  const translationTranscriptionElm = useTranslationTranscription();

  return (
    <>
      <LayoutWrapper
        isActiveScreenShare={
          isActiveScreenSharingView && hasScreenShareSubscribers
        }
        showVideoElms={showVideoElms}
        showVerticalVideoView={showVerticalVideoView}
        pinCamUserId={pinCamUserId}
      >
        {videosComponentElm}
        {screenShareElementsElm}

        {insightsAiTextChatElm}
        {whiteboardElm}
        {translationTranscriptionElm}
        {externalMediaPlayerElm}
        {displayExternalLinkElm}
      </LayoutWrapper>
      <AudioElements />
    </>
  );
};

export default MainView;
