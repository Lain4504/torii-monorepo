import React, { useEffect } from 'react';

import BroadcastMessageForm from './broadcastMessageForm';
import RoomLists from './roomLists';

import { useEndAllRoomsMutation } from '../../../store/services/breakoutRoomApi';
import { BreakoutRoomMessage } from '..';
import { useAppDispatch } from '../../../store';
import { updateShowManageBreakoutRoomModal } from '../../../store/slices/bottomIconsActivitySlice';

interface IManageActiveRoomsProps {
  setMessage: (message: BreakoutRoomMessage | null) => void;
}

const ManageActiveRooms = ({ setMessage }: IManageActiveRoomsProps) => {
  const dispatch = useAppDispatch();
  const [endAllRooms, { isLoading, data, isSuccess, error }] =
    useEndAllRoomsMutation();

  useEffect(() => {
    if (isSuccess && data) {
      if (data.status) {
        dispatch(updateShowManageBreakoutRoomModal(false));
      } else {
        setMessage({ text: data.msg, type: 'error' });
      }
    } else if (error) {
      const msg = (error as any)?.data?.msg ?? 'Lỗi không xác định';
      setMessage({ text: msg, type: 'error' });
    }
  }, [isSuccess, data, error, dispatch, setMessage]);

  const onEndAllRooms = () => {
    setMessage(null);
    endAllRooms();
  };

  return (
    <div className="manage-breakout-room-wrap">
      <BroadcastMessageForm setMessage={setMessage} />
      <RoomLists setMessage={setMessage} />
      <div className="btn pb-3 pt-4 flex items-end justify-end">
        <button
          className="h-9 ml-auto px-5 cursor-pointer text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-all duration-300 shadow-sm disabled:opacity-50"
          onClick={onEndAllRooms}
          disabled={isLoading}
        >
          Kết thúc tất cả
        </button>
      </div>
    </div>
  );
};

export default ManageActiveRooms;
