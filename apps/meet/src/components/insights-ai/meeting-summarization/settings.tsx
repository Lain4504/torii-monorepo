import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  CommonResponseSchema,
  InsightsAIMeetingSummarizationConfigReqSchema,
} from '@workspace/protocol';

import { store, useAppSelector } from '../../../store';
import SettingsSwitch from '../../../helpers/ui/settingsSwitch';
import sendAPIRequest from '../../../helpers/api/walearnconnectAPI';

interface MeetingSummarizationProps {
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeModal: () => void;
}

const MeetingSummarization = ({
  setErrorMsg,
  closeModal,
}: MeetingSummarizationProps) => {
  const { t } = useTranslation();
  // all static values
  const { enabledSelfInsertEncryptionKey } = useMemo(() => {
    const enabledSelfInsertEncryptionKey =
      !!store.getState().session.currentRoom.metadata?.roomFeatures
        ?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey;
    return { enabledSelfInsertEncryptionKey };
  }, []);

  const meetingSummarizationFeatures = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.aiFeatures?.meetingSummarizationFeatures,
  );

  const [isEnabled, setIsEnabled] = useState(
    !!meetingSummarizationFeatures?.isEnabled,
  );
  const [summarizationPrompt, setSummarizationPrompt] = useState<string>(
    meetingSummarizationFeatures?.summarizationPrompt ?? '',
  );

  useEffect(() => {
    if (!meetingSummarizationFeatures?.summarizationPrompt) {
      setSummarizationPrompt(
        'Summarize this meeting conversation. Identify all key decisions and create a list of action items.',
      );
    }
  }, [meetingSummarizationFeatures?.summarizationPrompt]);

  const enableOrUpdateService = useCallback(async () => {
    if (!summarizationPrompt) {
      setErrorMsg(
        t('insights.meeting-summarization.summarization-prompt-required'),
      );
      return;
    }
    setErrorMsg(undefined);

    const body = create(InsightsAIMeetingSummarizationConfigReqSchema, {
      isEnabled,
      summarizationPrompt,
    });

    const r = await sendAPIRequest(
      'insights/ai/meetingSummarization/configure',
      toBinary(InsightsAIMeetingSummarizationConfigReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );

    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));
    if (!res.status) {
      setErrorMsg(t(res.msg));
      return;
    }

    toast(t('insights.service-started-successfully'), {
      type: 'info',
    });
    closeModal();
  }, [t, closeModal, setErrorMsg, isEnabled, summarizationPrompt]);

  const stopService = useCallback(async () => {
    const r = await sendAPIRequest(
      'insights/ai/meetingSummarization/end',
      [],
      false,
      'application/protobuf',
      'arraybuffer',
    );

    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));
    if (!res.status) {
      setErrorMsg(t(res.msg));
      return;
    }

    toast(t('insights.service-stopped-successfully'), {
      type: 'info',
    });
    closeModal();
  }, [t, setErrorMsg, closeModal]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSummarizationPrompt(evt.target?.value);
    },
    [],
  );

  if (enabledSelfInsertEncryptionKey) {
    return (
      <div className="p-4 bg-Gray-2">
        <div className="main-wrap -my-4 text-red-600">
          {t('insights.feature-disable-while-e2ee-self-key-enabled')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-Gray-2">
        <div className="main-wrap -my-4">
          <div className="grid">
            <div className="bg-muted/30 border-y border-border -mx-4 px-4 py-4">
              <SettingsSwitch
                label={t('insights.meeting-summarization.enable')}
                enabled={isEnabled}
                onChange={setIsEnabled}
                customCss="h-11 border border-border rounded-xl px-4 bg-card shadow-sm"
              />
            </div>
            {isEnabled && (
              <div className="bg-muted/30 border-b border-border -mx-4 px-5 py-4">
                <label
                  htmlFor="summarizationPrompt"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {t(
                    'insights.meeting-summarization.summarization-prompt-label',
                  )}
                </label>
                <textarea
                  name="summarizationPrompt"
                  id="summarizationPrompt"
                  className="w-full outline-none text-sm text-foreground p-3 border border-border rounded-lg resize-y bg-card transition-all focus:ring-1 focus:ring-primary focus:border-primary"
                  value={summarizationPrompt}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-border flex justify-end items-center gap-4 rounded-b-xl bg-card">
        {!meetingSummarizationFeatures?.isEnabled ? (
          <button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => enableOrUpdateService()}
          >
            {t('insights.start-service')}
          </button>
        ) : (
          <button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => stopService()}
          >
            {t('insights.stop-service')}
          </button>
        )}
      </div>
      捉    </>
  );
};

export default MeetingSummarization;
