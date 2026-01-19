import React, { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';

import { Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  supportedTranscriptionLangs,
  supportedTranslationLangs,
  translationLangsMap,
} from '../translation-transcription/helpers/supportedLangs';
import { updateSelectedChatTransLang } from '../../store/slices/roomSettingsSlice';

interface LanguageInfo {
  title: string;
  code: string;
}

const ChatTranslation = () => {
  const dispatch = useAppDispatch();
  const chatTranslationFeatures = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.insightsFeatures
        ?.chatTranslationFeatures,
  );

  const [selectedLanguage, setSelectedLanguage] = useState<
    LanguageInfo | undefined
  >();
  const [transLangs, setTransLangs] = useState<LanguageInfo[]>([]);

  useEffect(() => {
    if (!chatTranslationFeatures?.isEnabled) {
      setSelectedLanguage(undefined);
      return;
    }

    Promise.allSettled([
      supportedTranscriptionLangs(),
      supportedTranslationLangs(),
    ]).then(() => {
      const allLangs: LanguageInfo[] =
        chatTranslationFeatures.allowedTransLangs.map((lang) => ({
          title: translationLangsMap.get(lang)?.name ?? lang,
          code: lang,
        }));
      setTransLangs(allLangs);

      if (chatTranslationFeatures.defaultLang) {
        const defaultLangObject = allLangs.find(
          (l) => l.code === chatTranslationFeatures.defaultLang,
        );
        setSelectedLanguage(defaultLangObject);
      }
    });
  }, [chatTranslationFeatures]);

  useEffect(() => {
    dispatch(updateSelectedChatTransLang(selectedLanguage?.code ?? ''));
  }, [dispatch, selectedLanguage]);

  return (
    chatTranslationFeatures?.isEnabled &&
    transLangs.length && (
      <Listbox value={selectedLanguage} onChange={setSelectedLanguage}>
        <ListboxButton className="lang h-6 w-9 flex items-center justify-center cursor-pointer border border-border rounded-md 3xl:rounded-[11px] text-xs font-semibold text-foreground hover:bg-muted transition-colors">
          {selectedLanguage?.code.toLocaleUpperCase()}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className="border border-border rounded-xl shadow-lg bg-card overflow-hidden w-40 py-1.5 z-20 px-1"
        >
          {transLangs.map((lang) => (
            <ListboxOption key={lang.code} value={lang}>
              {({ selected }) => (
                <div className="text-sm cursor-pointer text-foreground hover:bg-muted flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors">
                  <span>{lang.title}</span>{' '}
                  {selected && (
                    <span>
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    )
  );
};

export default ChatTranslation;
