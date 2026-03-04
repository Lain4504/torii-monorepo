import React, { KeyboardEvent, useCallback, useRef, useState } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { toast } from 'react-toastify';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  CommonResponseSchema,
  InsightsAITextChatContentSchema,
  InsightsAITextChatRole,
} from '@workspace/protocol';

import { SendHorizontal } from 'lucide-react';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { useAutosizeTextArea } from '@/components/chat/text-box/useAutosizeTextArea';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addAiTextChatUserMessage,
  clearIsAwaitingResponse,
} from '@/store/slices/insightsAiTextChatSlice';
import sendAPIRequest from '@/helpers/api/api-client';

const TextBoxArea = () => {
  const dispatch = useAppDispatch();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isAwaitingResponse = useAppSelector(
    (state) => state.insightsAiTextChat.isAwaitingResponse,
  );

  const [message, setMessage] = useState<string>('');
  useAutosizeTextArea(textAreaRef.current, message);

  const sendMsg = useCallback(async () => {
    if (isAwaitingResponse || isEmpty(message)) return;

    const body = create(InsightsAITextChatContentSchema, {
      role: InsightsAITextChatRole.INSIGHTS_AI_TEXT_CHAT_ROLE_USER,
      text: message,
    });
    // Dispatch the user message immediately, this will set isAwaitingResponse to true
    // and instantly lock the UI.
    dispatch(addAiTextChatUserMessage(message));
    setMessage('');

    const r = await sendAPIRequest(
      'insights/ai/textChat/execute',
      toBinary(InsightsAITextChatContentSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );

    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));
    if (!res.status) {
      toast(res.msg, {
        type: 'error',
      });
      dispatch(clearIsAwaitingResponse());
    }
  }, [dispatch, message, isAwaitingResponse]);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(evt.target?.value);
    },
    [],
  );

  const onEnterPress = useCallback(
    async (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await sendMsg();
      }
    },
    [sendMsg],
  );

  const placeholderText = isAwaitingResponse
    ? 'Đang trả lời...'
    : 'Nhập tin nhắn...';

  const isSendButtonDisabled = isAwaitingResponse || isEmpty(message);

  return (
    <div className="flex items-center justify-between border border-border rounded-2xl 3xl:rounded-3xl p-1.5 w-full bg-muted/50">
      <Textarea
        name="message-textarea"
        id="message-textarea"
        className="flex-1 outline-hidden text-xs 3xl:text-sm text-foreground bg-transparent font-normal h-10 mr-2 overflow-hidden px-2 resize-none"
        value={message}
        onChange={handleChange}
        disabled={isAwaitingResponse}
        placeholder={placeholderText}
        onKeyDown={onEnterPress}
        ref={textAreaRef}
        rows={1}
      />
      <Button
        disabled={isSendButtonDisabled}
        onClick={sendMsg}
        size="icon-sm"
        className={`w-7 3xl:w-9 h-7 3xl:h-9 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${isSendButtonDisabled
          ? 'bg-primary/30 text-primary-foreground/30 cursor-not-allowed'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
          }`}
      >
        <SendHorizontal className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
    </div>
  );
};

export default TextBoxArea;
