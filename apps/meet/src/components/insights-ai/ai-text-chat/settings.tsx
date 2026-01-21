import React, { useCallback, useState } from 'react';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  CommonResponseSchema,
  InsightsAITextChatConfigReqSchema,
} from '@workspace/protocol';

import { useAppSelector } from '../../../store';
import SettingsSwitch from '../../../helpers/ui/settingsSwitch';
import UsersSelector from './usersSelector';
import sendAPIRequest from '../../../helpers/api/api-client';

interface AiTextChatSettingsProps {
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeModal: () => void;
}

const AiTextChatSettings = ({
  setErrorMsg,
  closeModal,
}: AiTextChatSettingsProps) => {
  const { t } = useTranslation();
  const aiTextChatFeatures = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.aiFeatures?.aiTextChatFeatures,
  );

  const [isEnabled, setIsEnabled] = useState(!!aiTextChatFeatures?.isEnabled);
  const [isAllowedEveryone, setIsAllowedEveryone] = useState(
    !!aiTextChatFeatures?.isAllowedEveryone,
  );
  const [allowedUsers, setAllowedUsers] = useState<string[]>(
    aiTextChatFeatures?.allowedUserIds ?? [],
  );

  const enableOrUpdateService = useCallback(async () => {
    if (!isAllowedEveryone && allowedUsers.length == 0) {
      setErrorMsg(t('insights.ai-text-chat.users-required'));
      return;
    }
    setErrorMsg(undefined);

    const body = create(InsightsAITextChatConfigReqSchema, {
      isEnabled: isEnabled,
      isAllowedEveryone,
      allowedUserIds: allowedUsers,
    });

    const r = await sendAPIRequest(
      'insights/ai/textChat/configure',
      toBinary(InsightsAITextChatConfigReqSchema, body),
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
  }, [t, setErrorMsg, closeModal, isEnabled, isAllowedEveryone, allowedUsers]);

  const stopService = useCallback(async () => {
    const r = await sendAPIRequest(
      'insights/ai/textChat/end',
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

  return (
    <>
      <div className="p-4 bg-background">
        <div className="main-wrap -my-4">
          <div className="grid">
            <div className="bg-muted/30 border-y border-border -mx-4 px-4 py-4">
              <SettingsSwitch
                label={t('insights.ai-text-chat.enable')}
                enabled={isEnabled}
                onChange={setIsEnabled}
                customCss="h-11 border border-border rounded-xl px-4 bg-card shadow-sm"
              />
            </div>
            {isEnabled && (
              <>
                <div className="bg-muted/30 border-y border-border -mx-4 px-4 py-4">
                  <SettingsSwitch
                    label={t('insights.ai-text-chat.allow-everyone')}
                    enabled={isAllowedEveryone}
                    onChange={setIsAllowedEveryone}
                    customCss="h-11 border border-border rounded-xl px-4 bg-card shadow-sm"
                  />
                </div>
                {!isAllowedEveryone && (
                  <div className="bg-muted/30 border-y border-border -mx-4 px-4 py-4">
                    <UsersSelector
                      selectedUsers={allowedUsers}
                      setSelectedUsers={setAllowedUsers}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-border flex justify-end items-center gap-4 rounded-b-xl bg-card">
        {!aiTextChatFeatures?.isEnabled && (
          <button
            className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
            onClick={() => enableOrUpdateService()}
          >
            {t('insights.start-service')}
          </button>
        )}
        {aiTextChatFeatures?.isEnabled && (
          <>
            <button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => stopService()}
            >
              {t('insights.stop-service')}
            </button>
            <button
              className="h-10 px-8 w-auto cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 shadow-sm"
              onClick={() => enableOrUpdateService()}
            >
              {t('insights.update-service')}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default AiTextChatSettings;
