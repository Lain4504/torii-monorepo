import React from 'react';


import { useWhiteboard } from '@/components/main-area/hooks/use-whiteboard';
import { useExternalMediaPlayer } from '@/components/main-area/hooks/use-external-media-player';
import { useDisplayExternalLink } from '@/components/main-area/hooks/use-display-external-link';
import { useVideosComponent } from '@/components/main-area/hooks/use-videos-component';
import { useScreenShareElements } from '@/components/main-area/hooks/use-screen-share-elements';
import { useTranslationTranscription } from '@/components/main-area/hooks/use-translation-transcription';
import { useVideoLayout } from '@/components/main-area/hooks/use-video-layout';

import AudioElements from '@/components/media-elements/audios';
import LayoutWrapper from '@/components/main-area/layout-wrapper';
import { useInsightsAiTextChat } from '@/components/main-area/hooks/use-insights-ai-text-chat';

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
