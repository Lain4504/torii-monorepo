import React, { useCallback, useEffect, useState } from 'react';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { toast } from 'react-toastify';
import {
  CommonResponseSchema,
  InsightsAIMeetingSummarizationConfigReqSchema,
} from '@workspace/protocol';

import { useAppSelector } from '@/store';
import SettingsSwitch from '@/helpers/ui/settings-switch';
import sendAPIRequest from '@/helpers/api/api-client';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';

interface MeetingSummarizationProps {
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeModal: () => void;
}

const MeetingSummarization = ({
  setErrorMsg,
  closeModal,
}: MeetingSummarizationProps) => {
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
        'Tóm tắt cuộc trò chuyện trong cuộc họp này. Xác định tất cả các quyết định quan trọng và lập danh sách các mục công việc.',
      );
    }
  }, [meetingSummarizationFeatures?.summarizationPrompt]);

  const enableOrUpdateService = useCallback(async () => {
    if (!summarizationPrompt) {
      setErrorMsg(
        'Lời nhắc tóm tắt là bắt buộc',
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
      setErrorMsg(res.msg);
      return;
    }

    toast('Dịch vụ đã bắt đầu thành công', {
      type: 'info',
    });
    closeModal();
  }, [closeModal, setErrorMsg, isEnabled, summarizationPrompt]);

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
      setErrorMsg(res.msg);
      return;
    }

    toast('Dịch vụ đã dừng thành công', {
      type: 'info',
    });
    closeModal();
  }, [setErrorMsg, closeModal]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSummarizationPrompt(evt.target?.value);
    },
    [],
  );

  return (
    <>
      <div className="p-4 bg-muted">
        <div className="main-wrap -my-4">
          <div className="grid">
            <div className="bg-muted/30 border-y border-border -mx-4 px-4 py-4">
              <SettingsSwitch
                label="Bật tóm tắt cuộc họp"
                enabled={isEnabled}
                onChange={setIsEnabled}
                customCss="h-11 border border-border rounded-xl px-4 bg-card shadow-sm"
              />
            </div>
            {isEnabled && (
              <div className="bg-muted/30 border-b border-border -mx-4 px-5 py-4">
                <Label
                  htmlFor="summarizationPrompt"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Lời nhắc tóm tắt
                </Label>
                <Textarea
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
          <Button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => enableOrUpdateService()}
          >
            Bắt đầu dịch vụ
          </Button>
        ) : (
          <Button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => stopService()}
          >
            Dừng dịch vụ
          </Button>
        )}
      </div>
    </>
  );
};

export default MeetingSummarization;
