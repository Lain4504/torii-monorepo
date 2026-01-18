import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { store, useAppDispatch, useAppSelector } from '../../../../store';
import FooterMenuItem from './menuItem';
import {
  setActiveSidePanel,
  updateDisplaySpeechSettingOptionsModal,
  updateIsActiveSharedNotePad,
  updateIsActiveWhiteboard,
} from '../../../../store/slices/bottomIconsActivitySlice';
import { BarChart2, PenTool, NotebookPen, Captions } from 'lucide-react';

const IconsInMenu = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { roomFeatures } = useMemo(() => {
    return {
      roomFeatures:
        store.getState().session.currentRoom?.metadata?.roomFeatures,
    };
  }, []);

  const isActiveWhiteboard = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveWhiteboard,
  );
  const toggleWhiteboard = useCallback(() => {
    // prevent toggling whiteboard during screen sharing
    if (store.getState().bottomIconsActivity.isActiveScreenshare) {
      return;
    }
    dispatch(updateIsActiveWhiteboard(!isActiveWhiteboard));
  }, [dispatch, isActiveWhiteboard]);

  const isActiveSharedNotePad = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveSharedNotePad,
  );
  const toggleSharedNotePad = useCallback(() => {
    dispatch(updateIsActiveSharedNotePad(!isActiveSharedNotePad));
  }, [dispatch, isActiveSharedNotePad]);

  const isActivePoll = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.pollsFeatures?.isActive,
  );
  const isActivePollsPanel = useAppSelector(
    (state) => state.bottomIconsActivity.activeSidePanel === 'PARTICIPANTS',
  );
  const togglePollsPanel = useCallback(() => {
    dispatch(setActiveSidePanel('POLLS'));
  }, [dispatch]);

  const isActiveDisplaySpeechSettingOptionsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showSpeechSettingOptionsModal,
  );
  const isEnabledTranscription = useAppSelector(
    (state) =>
      !!state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.transcriptionFeatures?.isEnabled,
  );
  const toggleSpeechSettingOptionsModal = useCallback(() => {
    dispatch(
      updateDisplaySpeechSettingOptionsModal(
        !isActiveDisplaySpeechSettingOptionsModal,
      ),
    );
  }, [dispatch, isActiveDisplaySpeechSettingOptionsModal]);

  return (
    <>
      {roomFeatures?.whiteboardFeatures?.isAllow && (
        <FooterMenuItem
          onClick={toggleWhiteboard}
          isActive={isActiveWhiteboard}
          icon={<PenTool />}
          text={
            isActiveWhiteboard
              ? t('footer.icons.hide-whiteboard')
              : t('footer.icons.show-whiteboard')
          }
        />
      )}
      {roomFeatures?.sharedNotePadFeatures?.isActive && (
        <FooterMenuItem
          onClick={toggleSharedNotePad}
          isActive={isActiveSharedNotePad}
          icon={<NotebookPen />}
          text={
            isActiveSharedNotePad
              ? t('footer.icons.hide-shared-notepad')
              : t('footer.icons.show-shared-notepad')
          }
        />
      )}
      {isActivePoll && (
        <FooterMenuItem
          onClick={togglePollsPanel}
          isActive={isActivePollsPanel}
          icon={<BarChart2 className="w-6" />}
          text={
            isActivePollsPanel
              ? t('footer.icons.hide-polls-panel')
              : t('footer.icons.show-polls-panel')
          }
        />
      )}
      {isEnabledTranscription && (
        <FooterMenuItem
          onClick={toggleSpeechSettingOptionsModal}
          isActive={isActiveDisplaySpeechSettingOptionsModal}
          icon={<Captions className="w-auto" />}
          text={
            isActiveDisplaySpeechSettingOptionsModal
              ? t('footer.icons.hide-translation-settings')
              : t('footer.icons.show-translation-settings')
          }
        />
      )}
    </>
  );
};

export default IconsInMenu;
