import React, { useCallback, useEffect } from 'react';
import { create } from '@bufbuild/protobuf';
import { JoinBreakoutRoomReqSchema } from '@workspace/protocol';

import { useJoinRoomMutation } from '../../../../store/services/breakoutRoomApi';
import { BreakoutRoomMessage } from '../..';
import { store } from '../../../../store';

interface IJoinBtnProps {
  breakoutRoomId: string;
  setMessage: (message: BreakoutRoomMessage | null) => void;
}

const JoinBtn = ({ breakoutRoomId, setMessage }: IJoinBtnProps) => {
  const [joinRoom, { isLoading, isSuccess, isError, data, error }] =
    useJoinRoomMutation();

  useEffect(() => {
    if (isSuccess && data?.status && data.token) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('access_token', data.token);
      const url =
        location.protocol +
        '//' +
        location.host +
        window.location.pathname +
        '?' +
        searchParams.toString();

      if (!window.open(url, '_blank')) {
        setMessage({ text: 'Trình duyệt đã chặn mở tab mới', type: 'error' });
      }
    } else if ((isSuccess && !data?.status) || isError) {
      const msg = data?.msg ?? (error as any)?.data?.msg ?? 'Lỗi';
      setMessage({ text: msg, type: 'error' });
    }
  }, [isSuccess, isError, data, error, setMessage]);

  const handleJoin = useCallback(() => {
    // clear previous error
    setMessage(null);
    joinRoom(
      create(JoinBreakoutRoomReqSchema, {
        breakoutRoomId: breakoutRoomId,
        userId: store.getState().session.currentUser?.userId ?? '',
      }),
    );
  }, [joinRoom, breakoutRoomId, setMessage]);

  return (
    <div className="join-btn mr-1">
      <button
        className="h-7 px-3 text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        onClick={handleJoin}
        disabled={isLoading}
      >
        Tham gia
      </button>
    </div>
  );
};

export default JoinBtn;
