import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { InsightsChatTranslationConfigReqSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { Button } from '@workspace/ui/components/button';

import TransLangsSelector from '@/components/translation-transcription/transcription-settings/trans-langs-selector';
import { useAppDispatch, useAppSelector } from '@/store';
import DefaultSubtitleLangSelector from '@/components/translation-transcription/transcription-settings/default-subtitle-lang-selector';
import {
  enableOrUpdateChatTranslation,
  endChatTranslation,
} from '@/components/translation-transcription/helpers/api-connections';
import { updateDisplaySpeechSettingsModal } from '@/store/slices/bottom-icons-activity-slice';

interface ChatTranslationSettingsProps {
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const ChatTranslationSettings = ({
  setErrorMsg,
}: ChatTranslationSettingsProps) => {
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
      toast('Dịch vụ đã bắt đầu', {
        type: 'info',
      });
    } else {
      toast(res.msg, {
        type: 'error',
      });
      setErrorMsg(res.msg);
      return;
    }
    dispatch(updateDisplaySpeechSettingsModal(false));
    // oxlint-disable-next-line exhaustive-deps
  }, [setErrorMsg, selectedTransLangs, selectedDefaultLang]);

  const stopService = useCallback(async () => {
    const res = await endChatTranslation();
    if (res.status) {
      toast('Dịch vụ đã kết thúc', {
        type: 'info',
      });
    } else {
      toast(res.msg, {
        type: 'error',
      });
      setErrorMsg(res.msg);
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
                label={`Đọc và viết bằng tối đa ${chatTranslationFeatures?.maxSelectedTransLangs ?? 2} ngôn ngữ`}
                selectedTransLangs={selectedTransLangs}
                setSelectedTransLangs={setSelectedTransLangs}
                setErrorMsg={setErrorMsg}
                maxLangsAllowSelecting={
                  chatTranslationFeatures?.maxSelectedTransLangs ?? 2
                }
              />
              <DefaultSubtitleLangSelector
                isServiceRunning={!!chatTranslationFeatures?.isEnabled}
                label="Ngôn ngữ mặc định"
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
          <Button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => enableOrUpdateService()}
          >
            Kích hoạt dịch vụ
          </Button>
        )}
        {chatTranslationFeatures?.isEnabled && (
          <>
            <Button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => stopService()}
            >
              Dừng dịch vụ
            </Button>
            <Button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => enableOrUpdateService()}
            >
              Cập nhật dịch vụ
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ChatTranslationSettings;
