import React, { useCallback, useEffect, useState } from 'react';
import { IncreaseBreakoutRoomDurationReqSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

import { useIncreaseDurationMutation } from '../../../../store/services/breakoutRoomApi';
import { BreakoutRoomMessage } from '../..';

interface IExtendTimeProps {
  breakoutRoomId: string;
  setMessage: (message: BreakoutRoomMessage | null) => void;
}
const ExtendDuration = ({ breakoutRoomId, setMessage }: IExtendTimeProps) => {
  const [duration, setDuration] = useState<number>(5);
  const [increaseDuration, { isLoading, isSuccess, isError, data, error }] =
    useIncreaseDurationMutation();

  useEffect(() => {
    if (isSuccess && data) {
      if (data.status) {
        setMessage({
          text: 'Đã gia hạn thời gian phòng',
          type: 'info',
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ text: data.msg, type: 'error' });
      }
    } else if (isError) {
      const msg = (error as any)?.data?.msg ?? 'Lỗi không xác định';
      setMessage({ text: msg, type: 'error' });
    }
  }, [isSuccess, isError, data, error, setMessage]);

  const handleExtendDuration = useCallback(() => {
    if (duration > 0) {
      // clear previous error
      setMessage(null);
      increaseDuration(
        create(IncreaseBreakoutRoomDurationReqSchema, {
          breakoutRoomId: breakoutRoomId,
          duration: String(duration),
        }),
      );
    }
  }, [duration, increaseDuration, breakoutRoomId, setMessage]);

  return (
    <div className="extend-time-wrapper flex items-center gap-1">
      <input
        type="number"
        min="1"
        value={duration}
        onChange={(e) => setDuration(Number(e.currentTarget.value))}
        placeholder="Gia hạn thời gian"
        className="max-w-[100px] text-foreground border border-border bg-card shadow-sm block px-3 py-2 w-full h-9 rounded-lg outline-hidden focus:border-primary"
      />
      <button
        onClick={handleExtendDuration}
        disabled={isLoading || duration <= 0}
        className="h-8 px-3 text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Gia hạn
      </button>
    </div>
  );
};

export default ExtendDuration;
