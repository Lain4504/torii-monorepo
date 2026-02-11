import React, { useState } from 'react';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  CommonResponseSchema,
  ExternalMediaPlayerReqSchema,
  ExternalMediaPlayerTask,
} from '@workspace/protocol';

import { useAppDispatch, useAppSelector } from '../../../store';
import {
  updateIsActiveWhiteboard,
  updateShowExternalMediaPlayerModal,
} from '../../../store/slices/bottomIconsActivitySlice';

import DirectLink from './directLink';
import Upload from './upload';
import Modal from '../../../helpers/ui/modal';
import Tabs from '../../../helpers/ui/tabs';
import ActionButton from '../../../helpers/ui/actionButton';
import sendAPIRequest from '../../../helpers/api/api-client';

const ExternalMediaPlayerModal = () => {
  const dispatch = useAppDispatch();

  const isActive = useAppSelector(
    (state) =>
      !!state.session.currentRoom.metadata?.roomFeatures
        ?.externalMediaPlayerFeatures?.isActive,
  );
  const lastLink = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures
        ?.externalMediaPlayerFeatures?.url,
  );

  const [selectedUrl, setSelectedUrl] = useState<string>(lastLink ?? '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const handleStartPlayingUrl = async () => {
    setIsLoading(true);
    setErrorMsg(undefined);

    const body = create(ExternalMediaPlayerReqSchema, {
      task: ExternalMediaPlayerTask.START_PLAYBACK,
      url: selectedUrl,
    });
    const r = await sendAPIRequest(
      'externalMediaPlayer',
      toBinary(ExternalMediaPlayerReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (!res.status) {
      setErrorMsg(res.msg);
    }

    setIsLoading(false);
    // hide whiteboard to make this visible
    dispatch(updateIsActiveWhiteboard(false));
    dispatch(updateShowExternalMediaPlayerModal(false));
  };

  const items = [
    {
      id: 1,
      title: 'Liên kết trực tiếp',
      content: (
        <DirectLink setSelectedUrl={setSelectedUrl} selectedUrl={selectedUrl} />
      ),
    },
    {
      id: 2,
      title: 'Tải lên tệp',
      content: (
        <Upload setSelectedUrl={setSelectedUrl} isPlayBtnLoading={isLoading} />
      ),
    },
  ];

  const closeStartModal = () => {
    dispatch(updateShowExternalMediaPlayerModal(false));
  };

  return (
    !isActive && (
      <Modal
        show={!isActive}
        onClose={closeStartModal}
        title="Trình phát đa phương tiện"
        customClass="min-h-[30rem]"
      >
        {errorMsg && (
          <div className="error-msg text-xs text-destructive py-1">{errorMsg}</div>
        )}
        <Tabs items={items} vertical />
        <div className="mt-8 flex justify-end">
          <ActionButton
            isLoading={isLoading}
            buttonType="submit"
            disabled={selectedUrl === ''}
            onClick={handleStartPlayingUrl}
          >
            Phát
          </ActionButton>
        </div>
      </Modal>
    )
  );
};

export default ExternalMediaPlayerModal;
