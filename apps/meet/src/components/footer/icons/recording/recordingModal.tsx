import React, { useCallback, useMemo, useState } from 'react';
import { CloudRecordingVariants, RecordingFeatures } from '@workspace/protocol';

import { RecordingType, SelectedRecordingType } from './IRecording';
import { store } from '../../../../store';
import Modal from '../../../../helpers/ui/modal';
import ActionButton from '../../../../helpers/ui/actionButton';
import RadioOptions, {
  IRadioOption,
} from '../../../../helpers/ui/radioOptions';

interface IRecordingModalProps {
  showModal: boolean;
  recordingFeatures?: RecordingFeatures;
  onCloseModal(selected: SelectedRecordingType): void;
}

const RecordingModal = ({
  showModal,
  recordingFeatures,
  onCloseModal,
}: IRecordingModalProps) => {
  const [recordingType, setRecordingType] = useState<
    SelectedRecordingType | undefined
  >(undefined);
  const isCloud = store.getState().session.isCloud;
  const e2eeFeatures =
    store.getState().session.currentRoom?.metadata?.roomFeatures
      ?.endToEndEncryptionFeatures;

  const startRecording = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (recordingType) {
        onCloseModal(recordingType);
      }
    },
    [recordingType, onCloseModal],
  );

  const closeModal = () => {
    onCloseModal({
      type: RecordingType.RECORDING_TYPE_NONE,
    });
  };

  const radioOptions = useMemo(() => {
    const options: IRadioOption[] = [];
    if (recordingFeatures?.isAllowLocal) {
      options.push({
        id: 'local',
        value: RecordingType.RECORDING_TYPE_LOCAL,
        label: 'Ghi hình cục bộ',
      });
    }
    if (recordingFeatures?.isAllowCloud) {
      options.push({
        id: 'full-screen',
        value: CloudRecordingVariants.FULL_SCREEN_CLOUD_RECORDING,
        label: 'Ghi hình trên đám mây',
        disabled: !!e2eeFeatures?.enabledSelfInsertEncryptionKey,
        description: e2eeFeatures?.enabledSelfInsertEncryptionKey
          ? 'Ghi hình trên đám mây không được hỗ trợ khi sử dụng khóa tự nhập.'
          : undefined,
      });
      if (isCloud) {
        options.push({
          id: 'media-only',
          value: CloudRecordingVariants.MEDIA_ONLY_CLOUD_RECORDING,
          label: 'Chỉ ghi hình đa phương tiện trên đám mây',
          disabled: !!e2eeFeatures?.isEnabled,
          description: e2eeFeatures?.isEnabled
            ? 'Chỉ ghi hình đa phương tiện không được hỗ trợ khi bật mã hóa đầu cuối.'
            : undefined,
        });
      }
    }
    return options;
  }, [recordingFeatures, isCloud, e2eeFeatures]);

  const handleRadioChange = (value: any) => {
    if (value === RecordingType.RECORDING_TYPE_LOCAL) {
      setRecordingType({ type: RecordingType.RECORDING_TYPE_LOCAL });
    } else {
      setRecordingType({
        type: RecordingType.RECORDING_TYPE_CLOUD,
        variant: value,
      });
    }
  };

  const getCheckedValue = () => {
    if (recordingType?.type === RecordingType.RECORDING_TYPE_LOCAL) {
      return RecordingType.RECORDING_TYPE_LOCAL;
    }
    return recordingType?.variant;
  };

  return (
    <Modal
      show={showModal}
      onClose={closeModal}
      title="Bạn muốn ghi hình như thế nào?"
      renderButtons={() => (
        <ActionButton
          buttonType="submit"
          onClick={(e) => startRecording(e as any)}
        >
          Bắt đầu ghi hình
        </ActionButton>
      )}
    >
      <form
        className="RecorderPop"
        action="#"
        method="POST"
        onSubmit={(e) => startRecording(e)}
      >
        <p className="text-sm text-foreground">
          Chọn loại ghi hình phù hợp cho cuộc họp của bạn.
        </p>
        <RadioOptions
          name="recording-type"
          options={radioOptions}
          checked={getCheckedValue()}
          onChange={handleRadioChange}
        />
      </form>
    </Modal>
  );
};

export default RecordingModal;
