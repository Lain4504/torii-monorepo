import React, { Fragment, useState } from 'react';
import { toast } from 'react-toastify';
import {
  CommonResponseSchema,
  RemoveParticipantReqSchema,
} from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { store } from '../../store';
import sendAPIRequest from '../../helpers/api/api-client';
import Modal from '../../helpers/ui/modal';
import RadioOptions from '../../helpers/ui/radioOptions';

export interface IRemoveParticipantAlertModalData {
  name: string;
  userId: string;
  removeType: string;
}

interface IRemoveParticipantAlertModalProps {
  name: string;
  userId: string;
  removeType: string;
  closeAlertModal: () => void;
}

const RemoveParticipantAlertModal = ({
  name,
  userId,
  removeType,
  closeAlertModal,
}: IRemoveParticipantAlertModalProps) => {
  const [blockUser, setBlockUser] = useState<number>(0);

  const onCloseRemoveParticipantAlert = async (remove = false) => {
    if (!remove) {
      closeAlertModal();
      return;
    }

    const session = store.getState().session;
    const body = create(RemoveParticipantReqSchema, {
      sid: session.currentRoom.sid,
      roomId: session.currentRoom.roomId,
      userId: userId,
      msg:
        removeType === 'remove'
          ? 'Quản trị viên đã xóa bạn khỏi phòng.'
          : 'Quản trị viên đã từ chối yêu cầu tham gia của bạn.',
      blockUser: blockUser === 1,
    });

    const r = await sendAPIRequest(
      'removeParticipant',
      toBinary(RemoveParticipantReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (res.status) {
      toast('Thành viên đã bị xóa thành công.', {
        toastId: 'user-remove-status',
        type: 'info',
      });
    } else {
      toast(res.msg, {
        type: 'error',
      });
    }
    closeAlertModal();
  };

  const renderButtons = () => {
    return (
      <Fragment>
        <button
          className="h-10 px-6 flex items-center justify-center rounded-lg text-sm font-semibold text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all duration-300 shadow-sm"
          onClick={() => onCloseRemoveParticipantAlert(true)}
        >
          Xóa
        </button>
        <button
          type="button"
          className="h-10 px-6 flex items-center justify-center rounded-lg text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 border border-border transition-all duration-300 shadow-sm ml-4"
          onClick={() => onCloseRemoveParticipantAlert(false)}
        >
          Hủy
        </button>
      </Fragment>
    );
  };

  return (
    <Modal
      show={true}
      onClose={() => onCloseRemoveParticipantAlert(false)}
      title={`Xác nhận xóa ${name}?`}
      renderButtons={renderButtons}
    >
      <div className="mb-2 pl-3">
        <p className="text-sm text-muted-foreground">
          Bạn có muốn chặn tài khoản này tham gia lại không?
        </p>
        <RadioOptions
          name="block"
          checked={blockUser}
          onChange={setBlockUser}
          options={[
            {
              id: 'yes',
              value: 1,
              label: 'Có',
            },
            {
              id: 'no',
              value: 0,
              label: 'Không',
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default RemoveParticipantAlertModal;
