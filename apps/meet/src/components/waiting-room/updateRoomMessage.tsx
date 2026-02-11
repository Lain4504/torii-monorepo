import React, { useState } from 'react';
import {
  CommonResponseSchema,
  UpdateWaitingRoomMessageReqSchema,
} from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { useAppDispatch, useAppSelector } from '../../store';
import sendAPIRequest from '../../helpers/api/api-client';
import { addUserNotification } from '../../store/slices/roomSettingsSlice';

const UpdateRoomMessage = () => {
  const dispatch = useAppDispatch();
  const waitingRoomMessage = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.waitingRoomFeatures
        ?.waitingRoomMsg,
  );
  const [message, setMessage] = useState<string>(waitingRoomMessage ?? '');

  const updateRoomMsg = async () => {
    if (message === '') {
      return;
    }
    const body = create(UpdateWaitingRoomMessageReqSchema, {
      msg: message,
    });

    const r = await sendAPIRequest(
      'waitingRoom/updateMsg',
      toBinary(UpdateWaitingRoomMessageReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (res.status) {
      dispatch(
        addUserNotification({
          message: 'Đã cập nhật tin nhắn phòng chờ',
          typeOption: 'info',
        }),
      );
    } else {
      dispatch(
        addUserNotification({
          message: res.msg,
          typeOption: 'error',
        }),
      );
    }
  };

  return (
    <div className="text-right">
      <p className="block text-sm font-medium text-foreground text-left mb-2">
        Cập nhật tin nhắn phòng chờ
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        className="border border-border bg-card shadow-sm block px-3 py-2 w-full h-20 rounded-xl outline-hidden focus:border-primary text-foreground"
      ></textarea>
      <button
        onClick={updateRoomMsg}
        className="h-9 ml-auto cursor-pointer mt-2 px-5 text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-all duration-300 shadow-sm"
      >
        Cập nhật
      </button>
    </div>
  );
};

export default UpdateRoomMessage;
