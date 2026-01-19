import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './modal';

interface IConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text: string;
}

const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  text,
}: IConfirmationModalProps) => {
  const { t } = useTranslation();

  const renderButtons = () => (
    <div className="flex items-center justify-end gap-2">
      <button
        className="h-10 px-5 flex items-center justify-center rounded-lg text-sm font-semibold text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all duration-300 shadow-sm cursor-pointer"
        onClick={onConfirm}
      >
        {t('ok')}
      </button>
      <button
        type="button"
        className="h-10 px-5 flex items-center justify-center text-sm font-semibold bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground transition-all duration-300 shadow-sm cursor-pointer"
        onClick={onClose}
      >
        {t('close')}
      </button>
    </div>
  );

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      renderButtons={renderButtons}
    >
      <p className="text-sm text-foreground">{text}</p>
    </Modal>
  );
};

export default ConfirmationModal;
