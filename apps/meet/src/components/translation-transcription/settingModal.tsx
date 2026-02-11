import React, { useCallback, useEffect, useState } from 'react';
import { store, useAppDispatch, useAppSelector } from '../../store';

import Tabs, { ITabItem } from '../../helpers/ui/tabs';
import Modal from '../../helpers/ui/modal';
import { updateDisplaySpeechSettingsModal } from '../../store/slices/bottomIconsActivitySlice';
import TranscriptionSettings from './transcription-settings';
import ChatTranslationSettings from './chat-translation-settings';
import {
  supportedTranscriptionLangs,
  supportedTranslationLangs,
} from './helpers/supportedLangs';
import { Loader2 } from 'lucide-react';

const TranslationTranscriptionSettingModal = () => {
  const dispatch = useAppDispatch();

  const showSpeechSettingsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showSpeechSettingsModal,
  );

  const [tabItems, setTabItems] = useState<ITabItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const state = store.getState();
    const insightsFeatures =
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures;
    if (!insightsFeatures || !insightsFeatures.isAllow) {
      return;
    }
    setIsLoading(true);
    // prepare languages
    Promise.allSettled([
      supportedTranscriptionLangs(),
      supportedTranslationLangs(),
    ]).then(() => {
      // now display tabs
      const tabItems: ITabItem[] = [];
      if (insightsFeatures.transcriptionFeatures?.isAllow) {
        tabItems.push({
          id: 1,
          title: 'Phát hiện ngôn ngữ & Phiên dịch',
          content: <TranscriptionSettings setErrorMsg={setErrorMsg} />,
        });
      }
      if (insightsFeatures.chatTranslationFeatures?.isAllow) {
        tabItems.push({
          id: 2,
          title: 'Dịch tin nhắn',
          content: <ChatTranslationSettings setErrorMsg={setErrorMsg} />,
        });
      }
      setTabItems(tabItems);
      setIsLoading(false);
    });
    //oxlint-disable-next-line
  }, []);

  const onCloseModal = useCallback(() => {
    dispatch(updateDisplaySpeechSettingsModal(!showSpeechSettingsModal));
  }, [dispatch, showSpeechSettingsModal]);

  return (
    <Modal
      show={showSpeechSettingsModal}
      onClose={onCloseModal}
      title="Cấu hình Phiên dịch & Dịch lời nói"
      customClass="speechServicesModal"
      maxWidth="max-w-2xl"
    >
      <div className="-mx-4">
        {errorMsg && (
          <div className="error-msg text-xs text-red-600 py-1 px-2">
            {errorMsg}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center mt-12">
            <Loader2
              className="h-10 w-10 animate-spin text-primary"
            />
          </div>
        ) : (
          <>{tabItems.length ? <Tabs items={tabItems} vertical /> : null}</>
        )}
      </div>
    </Modal>
  );
};

export default TranslationTranscriptionSettingModal;
