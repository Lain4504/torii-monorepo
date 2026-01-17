import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InsightsTranscriptionFeatures,
  InsightsUserSessionAction,
} from '@workspace/protocol';
import { toast } from 'react-toastify';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { updateDisplaySpeechSettingOptionsModal } from '../../../store/slices/bottomIconsActivitySlice';

import Modal from '../../../helpers/ui/modal';
import SpeechInputSettings from './speechInputSettings';
import SubtitleFontSizeSlider from './subtitleFontSizeSlider';
import SubtitleLangSelector from './subtitleLangSelector';
import {
  getUserTaskStatus,
  startOrStopUserSession,
} from '../helpers/apiConnections';
import { getMediaServerConnRoom } from '../../../helpers/livekit/utils';
import { updateSelectedSubtitleLang } from '../../../store/slices/speechServicesSlice';
import SettingsSwitch from '../../../helpers/ui/settingsSwitch';

interface SpeechSettingsModalProps {
  transcriptionFeatures: InsightsTranscriptionFeatures;
  enabledSpeechSynthesis: boolean;
  setEnabledSpeechSynthesis: React.Dispatch<React.SetStateAction<boolean>>;
}

const SpeechSettingsModal = ({
  transcriptionFeatures,
  enabledSpeechSynthesis,
  setEnabledSpeechSynthesis,
}: SpeechSettingsModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = store.getState().session.currentUser;
  const mediaServerConn = getMediaServerConnRoom();

  const isActiveDisplayOptionsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showSpeechSettingOptionsModal,
  );
  const selectedSubtitleLang = useAppSelector(
    (state) => state.speechServices.selectedSubtitleLang,
  );
  const [isServiceActive, setIsServiceActive] = useState<boolean>(false);
  const [readyToStart, setReadyToStart] = useState<boolean>(false);

  const [enableSpeech, setEnableSpeech] = useState<boolean>(false);
  const [selectedSpeechLang, setSelectedSpeechLang] = useState<string>('');
  const [allowTranscriptionStorage, setAllowTranscriptionStorage] =
    useState<boolean>(true);

  useEffect(() => {
    if (isActiveDisplayOptionsModal) {
      if (mediaServerConn) {
        setReadyToStart(mediaServerConn.localParticipant.isMicrophoneEnabled);
      }
      getUserTaskStatus().then((res) => {
        if (res.isActive) {
          setIsServiceActive(true);
        }
        if (res.spokenLang) {
          setSelectedSpeechLang(res.spokenLang);
        }
        if (typeof res.allowedTranscriptionStorage !== 'undefined') {
          setAllowTranscriptionStorage(res.allowedTranscriptionStorage);
        }
      });
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [isActiveDisplayOptionsModal]);

  const setSelectedSubtitleLang = useCallback(
    (lang: string) => {
      dispatch(updateSelectedSubtitleLang(lang));
    },
    [dispatch],
  );

  const canShowSpeechSetting = useMemo(() => {
    return !!transcriptionFeatures.allowedSpeechUsers?.find(
      (u) => u === currentUser?.userId,
    );
  }, [currentUser?.userId, transcriptionFeatures.allowedSpeechUsers]);

  const onCloseModal = useCallback(() => {
    dispatch(updateDisplaySpeechSettingOptionsModal(false));
  }, [dispatch]);

  const startOrStopService = useCallback(async () => {
    const action = isServiceActive
      ? InsightsUserSessionAction.USER_SESSION_ACTION_STOP
      : InsightsUserSessionAction.USER_SESSION_ACTION_START;

    const res = await startOrStopUserSession(
      action,
      allowTranscriptionStorage,
      selectedSpeechLang,
    );
    if (res.status) {
      toast(t('notifications.request-submitted-wait'), {
        type: 'info',
      });
    } else {
      toast(t(res.msg), {
        type: 'error',
      });
      return;
    }

    setIsServiceActive(!isServiceActive);
    onCloseModal();
  }, [
    onCloseModal,
    t,
    isServiceActive,
    allowTranscriptionStorage,
    selectedSpeechLang,
  ]);

  return (
    <Modal
      show={isActiveDisplayOptionsModal}
      onClose={onCloseModal}
      title={t('speech-services.start-modal-title')}
      customClass="showSpeechSettingPopup overflow-hidden"
    >
      <div className="-mx-4">
        {canShowSpeechSetting && (
          <SpeechInputSettings
            isServiceActive={isServiceActive}
            transcriptionFeatures={transcriptionFeatures}
            enableSpeech={enableSpeech}
            setEnableSpeech={setEnableSpeech}
            allowTranscriptionStorage={allowTranscriptionStorage}
            setAllowTranscriptionStorage={setAllowTranscriptionStorage}
            selectedSpeechLang={selectedSpeechLang}
            setSelectedSpeechLang={setSelectedSpeechLang}
          />
        )}
        <SubtitleLangSelector
          transcriptionFeatures={transcriptionFeatures}
          selectedSubtitleLang={selectedSubtitleLang}
          setSelectedSubtitleLang={setSelectedSubtitleLang}
        />
        <SubtitleFontSizeSlider />
        {!transcriptionFeatures.isEnabledSpeechSynthesis && (
          <div className="bg-muted/30 border-y border-border -mx-4 px-8 py-4">
            <SettingsSwitch
              label={t('speech-services.enable-speech-synthesis')}
              enabled={enabledSpeechSynthesis}
              onChange={setEnabledSpeechSynthesis}
              customCss="h-11 border border-border rounded-xl px-4 bg-card shadow-sm"
            />
          </div>
        )}
      </div>

      {canShowSpeechSetting &&
        enableSpeech &&
        !readyToStart &&
        !isServiceActive ? (
        <div className="text-xs text-destructive pt-4 -mx-4 px-8">
          {t('speech-services.mic-not-ready-warning')}
        </div>
      ) : null}

      {canShowSpeechSetting && enableSpeech && (
        <div className="bottom-area pt-6 mt-6 border-t border-border flex justify-end gap-5 -mx-4 px-8">
          <button
            className="h-10 w-full cursor-pointer rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-primary/90 disabled:opacity-50"
            disabled={!readyToStart && !isServiceActive}
            onClick={startOrStopService}
          >
            {canShowSpeechSetting && isServiceActive
              ? t('speech-services.stop-service')
              : t('speech-services.start-service')}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default SpeechSettingsModal;
