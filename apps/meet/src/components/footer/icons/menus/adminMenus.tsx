import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import FooterMenuItem from './menuItem';
import { store, useAppDispatch, useAppSelector } from '../../../../store';
import useSharedNotepad from './hooks/useSharedNotepad';
import usePolls from './hooks/usePolls';
import useMuteAll from './hooks/useMuteAll';
import useExternalMediaPlayer from './hooks/useExternalMediaPlayer';
import useDisplayExternalLink from './hooks/useDisplayExternalLink';
import {
  updateDisplayInsightsAISettingsModal,
  updateDisplaySpeechSettingsModal,
  updateShowLockSettingsModal,
  updateShowManageBreakoutRoomModal,
  updateShowManageWaitingRoomModal,
  updateShowRtmpModal,
} from '../../../../store/slices/bottomIconsActivitySlice';
import { BarChart2, LayoutGrid, Bot, Radio, Play, MonitorPlay, NotebookPen, Captions, Lock } from 'lucide-react';

const AdminMenus = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const isActiveRtmpBroadcasting = useAppSelector(
    (state) => state.session.isActiveRtmpBroadcasting,
  );

  const { roomFeatures } = useMemo(() => {
    return {
      roomFeatures:
        store.getState().session.currentRoom?.metadata?.roomFeatures,
    };
  }, []);

  const { toggleSharedNotepad, sharedNotepadStatus } = useSharedNotepad();
  const { togglePolls, isActivePoll } = usePolls();
  const { muteAllUsers } = useMuteAll();
  const { toggleExternalMediaPlayer, isActiveExternalMediaPlayer } =
    useExternalMediaPlayer();
  const { toggleDisplayExternalLinkModal, isActiveDisplayExternalLink } =
    useDisplayExternalLink();

  const openLockSettingsModal = useCallback(() => {
    dispatch(updateShowLockSettingsModal(true));
  }, [dispatch]);

  const openRtmpModal = useCallback(() => {
    dispatch(updateShowRtmpModal(true));
  }, [dispatch]);

  const openManageWaitingRoomModal = useCallback(() => {
    dispatch(updateShowManageWaitingRoomModal(true));
  }, [dispatch]);

  const openSpeechServiceSettingsModal = useCallback(() => {
    dispatch(updateDisplaySpeechSettingsModal(true));
  }, [dispatch]);

  const openManageBreakoutRoomModal = useCallback(() => {
    dispatch(updateShowManageBreakoutRoomModal(true));
  }, [dispatch]);

  const openInsightsAISettingsModal = useCallback(() => {
    dispatch(updateDisplayInsightsAISettingsModal(true));
  }, [dispatch]);

  return (
    <>
      {roomFeatures?.insightsFeatures?.isAllow &&
        roomFeatures?.insightsFeatures?.aiFeatures?.isAllow && (
          <FooterMenuItem
            onClick={openInsightsAISettingsModal}
            icon={<Bot className="w-6" />}
            text={t('footer.menus.ai-settings')}
          />
        )}
      {roomFeatures?.allowRtmp && (
        <FooterMenuItem
          onClick={openRtmpModal}
          isActive={isActiveRtmpBroadcasting}
          icon={<Radio />}
          text={
            isActiveRtmpBroadcasting
              ? t('footer.icons.stop-rtmp-broadcasting')
              : t('footer.icons.start-rtmp-broadcasting')
          }
        />
      )}
      {roomFeatures?.insightsFeatures?.isAllow &&
        roomFeatures?.insightsFeatures?.transcriptionFeatures?.isAllow && (
          <FooterMenuItem
            onClick={openSpeechServiceSettingsModal}
            icon={<Captions className="w-6" />}
            text={t('footer.menus.speech-to-text-settings')}
          />
        )}
      <div className="divider h-1 w-[110%] bg-muted -ml-3 my-0.5"></div>
      {roomFeatures?.pollsFeatures?.isAllow && (
        <FooterMenuItem
          onClick={togglePolls}
          isActive={isActivePoll}
          icon={<BarChart2 className="w-6" />}
          text={
            isActivePoll
              ? t('footer.menus.disable-polls')
              : t('footer.menus.enable-polls')
          }
        />
      )}
      {roomFeatures?.externalMediaPlayerFeatures?.isAllow && (
        <FooterMenuItem
          onClick={toggleExternalMediaPlayer}
          isActive={isActiveExternalMediaPlayer}
          icon={<Play />}
          text={
            isActiveExternalMediaPlayer
              ? t('footer.menus.stop-external-media-player')
              : t('footer.menus.start-external-media-player')
          }
        />
      )}
      {roomFeatures?.displayExternalLinkFeatures?.isAllow && (
        <FooterMenuItem
          onClick={toggleDisplayExternalLinkModal}
          isActive={isActiveDisplayExternalLink}
          icon={<MonitorPlay />}
          text={
            isActiveDisplayExternalLink
              ? t('footer.menus.stop-display-external-link')
              : t('footer.menus.start-display-external-link')
          }
        />
      )}
      {roomFeatures?.sharedNotePadFeatures?.isAllow && (
        <FooterMenuItem
          onClick={toggleSharedNotepad}
          isActive={sharedNotepadStatus}
          icon={<NotebookPen />}
          text={
            sharedNotepadStatus
              ? t('footer.menus.disable-shared-notepad')
              : t('footer.menus.enable-shared-notepad')
          }
        />
      )}
      <div className="divider h-1 w-[110%] bg-muted -ml-3 my-0.5"></div>
      <FooterMenuItem
        onClick={muteAllUsers}
        icon={<i className="wajlc-mic-mute" />}
        text={t('footer.menus.mute-all-users')}
      />
      <FooterMenuItem
        onClick={openLockSettingsModal}
        icon={<Lock />}
        text={t('footer.menus.room-lock-settings')}
      />
      {roomFeatures?.waitingRoomFeatures?.isActive && (
        <FooterMenuItem
          onClick={openManageWaitingRoomModal}
          icon={<i className="wajlc-waiting-room" />}
          text={t('footer.menus.manage-waiting-room')}
        />
      )}
      {roomFeatures?.breakoutRoomFeatures?.isAllow && (
        <FooterMenuItem
          onClick={openManageBreakoutRoomModal}
          icon={<LayoutGrid className="w-6 h-auto" />}
          text={t('footer.menus.manage-breakout-room')}
        />
      )}
    </>
  );
};

export default AdminMenus;
