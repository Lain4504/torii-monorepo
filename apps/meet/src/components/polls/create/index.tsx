import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormView from './formView';
import Modal from '../../../helpers/ui/modal';

export interface CreatePollOptions {
  id: number;
  text: string;
}

const Create = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Modal
        show={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('polls.create')}
        maxWidth="max-w-xl"
        customBodyClass="rounded-b-xl"
      >
        <FormView setIsOpen={setIsOpen} />
      </Modal>
      <div className="button-wrap px-3 3xl:px-5 py-2 md:py-4 border-t border-border">
        <button
          onClick={() => setIsOpen(true)}
          className="h-10 3xl:h-11 cursor-pointer px-5 flex items-center justify-center w-full rounded-lg text-sm 3xl:text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm"
        >
          {t('polls.create')}
        </button>
      </div>
    </>
  );
};

export default Create;
