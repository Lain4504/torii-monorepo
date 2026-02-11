import React, { useEffect } from 'react';
import { EndBreakoutRoomReqSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { toast } from 'react-toastify';

import { useEndSingleRoomMutation } from '../../../../store/services/breakoutRoomApi';
import { BreakoutRoomMessage } from '../..';

interface IEndBtnProps {
  breakoutRoomId: string;
  setMessage: (message: BreakoutRoomMessage | null) => void;
}
const EndBtn = ({ breakoutRoomId, setMessage }: IEndBtnProps) => {
  const [endSingleRoom, { isLoading, isSuccess, isError, data, error }] =
    useEndSingleRoomMutation();

  useEffect(() => {
    if (isSuccess && data) {
      if (data.status) {
        toast('Phòng đã kết thúc', {
          type: 'info',
        });
        setMessage({ text: 'Phòng đã kết thúc', type: 'info' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ text: data.msg, type: 'error' });
      }
      // success is handled by query cache invalidation, no toast needed.
    } else if (isError) {
      const msg = (error as any)?.data?.msg ?? 'Lỗi không xác định';
      setMessage({ text: msg, type: 'error' });
    }
  }, [isSuccess, isError, data, error, setMessage]);

  const handleEndRoom = () => {
    // clear previous error
    setMessage(null);
    endSingleRoom(create(EndBreakoutRoomReqSchema, { breakoutRoomId }));
  };

  return (
    <div className="end-room-btn">
      <button
        className="h-7 ml-auto px-3 flex items-center justify-center rounded-lg text-sm font-semibold text-destructive-foreground bg-destructive border border-destructive/20 transition-all duration-300 hover:bg-destructive/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        onClick={handleEndRoom}
        disabled={isLoading}
      >
        Kết thúc phòng
      </button>
    </div>
  );
};

export default EndBtn;
