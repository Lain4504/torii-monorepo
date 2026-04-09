import React, { useCallback, useMemo } from 'react';

import FooterMenuItem from '@/components/footer/icons/menus/menuItem';
import { store, useAppDispatch } from '@/store';

import usePolls from '@/components/footer/icons/menus/hooks/usePolls';
import useMuteAll from '@/components/footer/icons/menus/hooks/useMuteAll';
import useExternalMediaPlayer from '@/components/footer/icons/menus/hooks/useExternalMediaPlayer';
import {
  updateDisplayInsightsAISettingsModal,
  updateDisplaySpeechSettingsModal,
  updateShowLockSettingsModal,
  updateShowManageBreakoutRoomModal,
  updateShowManageWaitingRoomModal,
} from '@/store/slices/bottomIconsActivitySlice';
import { BarChart2, LayoutGrid, Bot, Play, Captions, Lock as LockIcon, MicOff, UserPlus } from 'lucide-react';

const AdminMenus = () => {
  const dispatch = useAppDispatch();

  const { roomFeatures } = useMemo(() => {
    return {
      roomFeatures:
        store.getState().session.currentRoom?.metadata?.roomFeatures,
    };
  }, []);

  const { togglePolls, isActivePoll } = usePolls();
  const { muteAllUsers } = useMuteAll();
  const { toggleExternalMediaPlayer, isActiveExternalMediaPlayer } =
    useExternalMediaPlayer();

  const openLockSettingsModal = useCallback(() => {
    dispatch(updateShowLockSettingsModal(true));
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
            text="Cài đặt AI"
          />
        )}
      {roomFeatures?.insightsFeatures?.isAllow &&
        roomFeatures?.insightsFeatures?.transcriptionFeatures?.isAllow && (
          <FooterMenuItem
            onClick={openSpeechServiceSettingsModal}
            icon={<Captions className="w-6" />}
            text="Cài đặt chuyển giọng nói thành văn bản"
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
              ? 'Tắt bình chọn'
              : 'Bật bình chọn'
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
              ? 'Dừng trình phát đa phương tiện bên ngoài'
              : 'Chạy trình phát đa phương tiện bên ngoài'
          }
        />
      )}
      <div className="divider h-1 w-[110%] bg-muted -ml-3 my-0.5"></div>
      <FooterMenuItem
        onClick={muteAllUsers}
        icon={<MicOff className="w-5 h-5" />}
        text="Tắt micro tất cả người dùng"
      />
      <FooterMenuItem
        onClick={openLockSettingsModal}
        icon={<LockIcon className="w-5 h-5" />}
        text="Cài đặt khóa phòng"
      />
      {roomFeatures?.waitingRoomFeatures?.isActive && (
        <FooterMenuItem
          onClick={openManageWaitingRoomModal}
          icon={<UserPlus className="w-5 h-5" />}
          text="Quản lý phòng chờ"
        />
      )}
      {roomFeatures?.breakoutRoomFeatures?.isAllow && (
        <FooterMenuItem
          onClick={openManageBreakoutRoomModal}
          icon={<LayoutGrid className="w-6 h-auto" />}
          text="Quản lý phòng thảo luận nhóm"
        />
      )}
    </>
  );
};

export default AdminMenus;
