import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getInputMediaDevices } from '@/lib/plugnmeet-helpers/utils';
import { addAudioDevices } from '@/store/plugnmeet/slices/roomSettingsSlice';
import { useAppDispatch } from '@/store/plugnmeet';
import Modal from '@/lib/plugnmeet-helpers/ui/modal';
import Dropdown from '@/lib/plugnmeet-helpers/ui/dropdown';
import ActionButton from '@/lib/plugnmeet-helpers/ui/actionButton';

interface MicrophoneModalProps {
  show: boolean;
  onCloseMicrophoneModal: (deviceId?: string) => void;
}

const MicrophoneModal = ({
  show,
  onCloseMicrophoneModal,
}: MicrophoneModalProps) => {
  const { t } = useTranslation();
  const [selectedMic, setSelectMic] = useState<string>('');
  const [devices, setDevices] = useState<Array<{ id: string; label: string }>>(
    [],
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getDeviceMics = async () => {
      const inputDevices = await getInputMediaDevices('audio');
      if (!inputDevices.audio.length) {
        return;
      }

      setDevices(inputDevices.audio);
      setSelectMic(inputDevices.audio[0].id);
      dispatch(addAudioDevices(inputDevices.audio));
    };
    getDeviceMics().then();
  }, [dispatch]);

  const selectOrClose = (onlyClose = false) => {
    onCloseMicrophoneModal(onlyClose ? undefined : selectedMic);
  };

  return (
    <Modal
      show={show}
      onClose={() => selectOrClose(true)}
      title={t('footer.modal.select-microphone')}
      renderButtons={() => (
        <ActionButton onClick={() => selectOrClose(false)}>
          {t('share')}
        </ActionButton>
      )}
      customBodyClass="microphone-modal !overflow-[initial]"
    >
      <Dropdown
        id="microphone"
        value={selectedMic}
        onChange={setSelectMic}
        options={devices.map((d) => {
          return {
            value: d.id,
            text: d.label,
          };
        })}
      />
    </Modal>
  );
};

export default MicrophoneModal;
