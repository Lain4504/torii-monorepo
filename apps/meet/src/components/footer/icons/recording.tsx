import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { store } from '@/store';
import { IRoomMetadata } from '@/store/slices/interfaces/session';
import RecordingModal from '@/components/footer/icons/recording/recordingModal';
import { RecordingEvent, RecordingType } from '@/components/footer/icons/recording/IRecording';
import useLocalRecording from '@/components/footer/icons/recording/useLocalRecording';
import { CircleDot } from 'lucide-react';

const RecordingIcon = () => {
  const {
    hasError: localRecordingError,
    recordingEvent: localRecordingEvent,
    startRecording: startLocalRecording,
    stopRecording: stopLocalRecording,
    resetError: resetLocalRecordingError,
  } = useLocalRecording();

  const { roomMetadata, isAllowLocalRecording, isAdmin, showTooltip } =
    useMemo(() => {
      const session = store.getState().session;
      const roomMetadata = session.currentRoom.metadata as IRoomMetadata;
      return {
        roomMetadata,
        isAllowLocalRecording:
          roomMetadata.roomFeatures?.recordingFeatures?.isAllowLocal,
        isAdmin: !!session.currentUser?.metadata?.isAdmin,
        showTooltip: session.userDeviceType === 'desktop',
      };
    }, []);

  const [disable, setDisable] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    if (localRecordingEvent === RecordingEvent.STARTED_RECORDING) {
      setDisable(false);
      setIsRecording(true);
    } else if (localRecordingEvent === RecordingEvent.STOPPED_RECORDING) {
      setDisable(false);
      setIsRecording(false);
    }
  }, [localRecordingEvent]);

  useEffect(() => {
    const reset = () => {
      setDisable(false);
      setIsRecording(false);
    };

    if (localRecordingError) {
      reset();
      resetLocalRecordingError();
    }
    //eslint-disable-next-line
  }, [localRecordingError]);

  const onClickRecordingBtn = () => {
    if (!isRecording) {
      setOpenModal(true);
    } else {
      setOpenModal(false);
      setDisable(true);
      stopLocalRecording();
    }
  };

  const onCloseModal = (selectedRecordingType: { type: RecordingType }) => {
    setOpenModal(false);
    if (selectedRecordingType.type === RecordingType.RECORDING_TYPE_LOCAL) {
      setDisable(true);
      startLocalRecording();
    }
  };

  if (!isAllowLocalRecording || !isAdmin) {
    return null;
  }

  const buttonClasses = clsx(
    'recorder-icon relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'record border-destructive/20': isRecording,
      'border-transparent': !isRecording,
      'opacity-50 pointer-events-none': disable,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isRecording,
      'bg-card': !isRecording,
    },
  );

  return (
    <>
      {openModal && (
        <RecordingModal
          showModal={openModal}
          recordingFeatures={roomMetadata.roomFeatures?.recordingFeatures}
          onCloseModal={onCloseModal}
        />
      )}
    <div className={buttonClasses} onClick={() => onClickRecordingBtn()}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isRecording
            ? 'Dừng ghi âm/hình'
            : 'Bắt đầu ghi âm/hình'}
        </span>
        <CircleDot
          className={clsx('w-4 md:w-5 3xl:w-6 h-auto transition-colors duration-300', {
            'text-destructive animate-pulse': isRecording,
            'text-foreground': !isRecording,
          })}
        />
      </div>
    </div>
    </>
  );
};

export default RecordingIcon;
