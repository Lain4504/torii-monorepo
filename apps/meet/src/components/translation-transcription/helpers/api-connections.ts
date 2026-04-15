import {
  CommonResponseSchema,
  InsightsChatTranslationConfigReq,
  InsightsChatTranslationConfigReqSchema,
  InsightsGetSupportedLanguagesReqSchema,
  InsightsGetSupportedLanguagesResSchema,
  InsightsGetUserStatusResSchema,
  InsightsServiceType,
  InsightsTranscriptionConfigReq,
  InsightsTranscriptionConfigReqSchema,
  InsightsTranscriptionUserSessionReqSchema,
  InsightsTranslateTextReq,
  InsightsTranslateTextReqSchema,
  InsightsTranslateTextResSchema,
  InsightsUserSessionAction,
} from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import sendAPIRequest from '@/helpers/api/api-client';

/**
 * Transcription, dịch chat và AI insights gọi qua Gateway REST `POST /api/insights/...`
 * (protobuf). Provider (Gemini, v.v.) do server cấu hình — client không lấy token Azure
 * và không gọi legacy `speech/azureToken` trên gateway.
 */

export const enableOrUpdateTranscription = async (
  body: InsightsTranscriptionConfigReq,
) => {
  const r = await sendAPIRequest(
    'insights/transcription/configure',
    toBinary(InsightsTranscriptionConfigReqSchema, body),
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(CommonResponseSchema, new Uint8Array(r));
};

export const endTranscription = async () => {
  const r = await sendAPIRequest(
    'insights/transcription/end',
    [],
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(CommonResponseSchema, new Uint8Array(r));
};

export const startOrStopUserSession = async (
  action: InsightsUserSessionAction,
  allowedTranscriptionStorage: boolean,
  spokenLang?: string,
) => {
  const body = create(InsightsTranscriptionUserSessionReqSchema, {
    action,
    allowedTranscriptionStorage,
    spokenLang,
  });
  const r = await sendAPIRequest(
    'insights/transcription/userSession',
    toBinary(InsightsTranscriptionUserSessionReqSchema, body),
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(CommonResponseSchema, new Uint8Array(r));
};

export const getUserTaskStatus = async () => {
  const r = await sendAPIRequest(
    'insights/transcription/userStatus',
    {},
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(InsightsGetUserStatusResSchema, new Uint8Array(r));
};

export const getSupportedLanguages = async (
  serviceType: InsightsServiceType,
) => {
  const body = create(InsightsGetSupportedLanguagesReqSchema, {
    serviceType,
  });
  const r = await sendAPIRequest(
    'insights/supportedLangs',
    toBinary(InsightsGetSupportedLanguagesReqSchema, body),
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(InsightsGetSupportedLanguagesResSchema, new Uint8Array(r));
};

export const enableOrUpdateChatTranslation = async (
  body: InsightsChatTranslationConfigReq,
) => {
  const r = await sendAPIRequest(
    'insights/translation/chat/configure',
    toBinary(InsightsChatTranslationConfigReqSchema, body),
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(CommonResponseSchema, new Uint8Array(r));
};

export const executeChatTranslation = async (
  body: InsightsTranslateTextReq,
) => {
  const r = await sendAPIRequest(
    'insights/translation/chat/execute',
    toBinary(InsightsTranslateTextReqSchema, body),
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(InsightsTranslateTextResSchema, new Uint8Array(r));
};

export const endChatTranslation = async () => {
  const r = await sendAPIRequest(
    'insights/translation/chat/end',
    [],
    false,
    'application/protobuf',
    'arraybuffer',
  );
  return fromBinary(CommonResponseSchema, new Uint8Array(r));
};
