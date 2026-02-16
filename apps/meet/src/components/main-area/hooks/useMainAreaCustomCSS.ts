import { useMemo } from 'react';

interface IUseMainAreaCustomCSS {
  isActiveScreenSharingView: boolean;
  hasScreenShareSubscribers: boolean;
  isActiveWhiteboard: boolean;
  isActiveExternalMediaPlayer: boolean | undefined;
  isActiveDisplayExternalLink: boolean | undefined;
  isRecorder: boolean | undefined;
}

export const useMainAreaCustomCSS = ({
  isActiveScreenSharingView,
  hasScreenShareSubscribers,
  isActiveWhiteboard,
  isActiveExternalMediaPlayer,
  isActiveDisplayExternalLink,
  isRecorder,
}: IUseMainAreaCustomCSS) => {
  return useMemo(() => {
    const css: Array<string> = [];

    if (isActiveScreenSharingView && hasScreenShareSubscribers) {
      css.push('showScreenShare fullWidthMainArea');
    } else {
      css.push('hideScreenShare');
    }

    if (isActiveWhiteboard) {
      css.push('showWhiteboard fullWidthMainArea');
    } else {
      css.push('hideWhiteboard');
    }

    if (isActiveExternalMediaPlayer) {
      css.push('showExternalMediaPlayer fullWidthMainArea');
    } else {
      css.push('hideExternalMediaPlayer');
    }

    if (isActiveDisplayExternalLink) {
      css.push('showDisplayExternalLink fullWidthMainArea');
    } else {
      css.push('hideDisplayExternalLink');
    }

    if (isRecorder) {
      css.push('isRecorder');
    }

    return css.join(' ');
  }, [
    isActiveScreenSharingView,
    hasScreenShareSubscribers,
    isActiveWhiteboard,
    isActiveExternalMediaPlayer,
    isActiveDisplayExternalLink,
    isRecorder,
  ]);
};
