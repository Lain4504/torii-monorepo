import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { InsightsChatTranslationConfigReqSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

import TransLangsSelector from '../transcription-settings/transLangsSelector';
import { useAppDispatch, useAppSelector } from '../../../store';
import DefaultSubtitleLangSelector from '../transcription-settings/defaultSubtitleLangSelector';
import {
  enableOrUpdateChatTranslation,
  endChatTranslation,
} from '../helpers/apiConnections';
import { updateDisplaySpeechSettingsModal } from '../../../store/slices/bottomIconsActivitySlice';

interface ChatTranslationSettingsProps {
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ChatTranslationSettings = ({
  setErrorMsg,
}: ChatTranslationSettingsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const chatTranslationFeatures = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.chatTranslationFeatures,
  );

  const [selectedTransLangs, setSelectedTransLangs] = useState<string[]>(
    chatTranslationFeatures?.allowedTransLangs ?? [],
  );
  const [selectedDefaultLang, setSelectedDefaultLang] = useState<string>(
    chatTranslationFeatures?.defaultLang ?? '',
  );

  const enableOrUpdateService = useCallback(async () => {
    setErrorMsg(undefined);

    const body = create(InsightsChatTranslationConfigReqSchema, {
      allowedTransLangs: selectedTransLangs,
      defaultLang: selectedDefaultLang,
    });

    if (selectedDefaultLang === '') {
      body.defaultLang = body.allowedTransLangs[0];
    }

    const res = await enableOrUpdateChatTranslation(body);
    if (res.status) {
      toast(t('speech-services.service-started'), {
        type: 'info',
      });
    } else {
      toast(t(res.msg), {
        type: 'error',
      });
      setErrorMsg(t(res.msg));
      return;
    }
    dispatch(updateDisplaySpeechSettingsModal(false));
    // oxlint-disable-next-line exhaustive-deps
  }, [setErrorMsg, selectedTransLangs, selectedDefaultLang]);

  const stopService = useCallback(async () => {
    const res = await endChatTranslation();
    if (res.status) {
      toast(t('speech-services.service-ended'), {
        type: 'info',
      });
    } else {
      toast(t(res.msg), {
        type: 'error',
      });
      setErrorMsg(t(res.msg));
      return;
    }
    dispatch(updateDisplaySpeechSettingsModal(false));
    // oxlint-disable-next-line exhaustive-deps
  }, []);

  return (
    <>
      <div className="p-4 bg-card">
        <div className="main-wrap -my-4">
          <div className="grid">
            <div className="grid gap-4 py-4 bg-card">
              <TransLangsSelector
                isServiceRunning={!!chatTranslationFeatures?.isEnabled}
                label={t('speech-services.read-and-write-in-label', {
                  num: chatTranslationFeatures?.maxSelectedTransLangs ?? 2,
                })}
                selectedTransLangs={selectedTransLangs}
                setSelectedTransLangs={setSelectedTransLangs}
                setErrorMsg={setErrorMsg}
                maxLangsAllowSelecting={
                  chatTranslationFeatures?.maxSelectedTransLangs ?? 2
                }
              />
              <DefaultSubtitleLangSelector
                isServiceRunning={!!chatTranslationFeatures?.isEnabled}
                label={t('speech-services.default-lang-label')}
                selectedSpeechLangs={[]}
                selectedTransLangs={selectedTransLangs}
                selectedDefaultSubtitleLang={selectedDefaultLang}
                setSelectedDefaultSubtitleLang={setSelectedDefaultLang}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-6 border-t border-border flex justify-end items-center gap-4 rounded-b-xl bg-card">
        {!chatTranslationFeatures?.isEnabled && (
          <button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => enableOrUpdateService()}
          >
            {t('speech-services.enable-service')}
          </button>
        )}
        {chatTranslationFeatures?.isEnabled && (
          <>
            <button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => stopService()}
            >
              {t('speech-services.stop-service')}
            </button>
            <button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => enableOrUpdateService()}
            >
              {t('speech-services.update-service')}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ChatTranslationSettings;
