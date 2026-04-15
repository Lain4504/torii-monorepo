import React, { Dispatch, useEffect, useState } from 'react';
import Dropdown, { ISelectOption } from '@/helpers/ui/dropdown';
import { supportedTranscriptionLangs } from '@/components/translation-transcription/helpers/supported-langs';

interface SpeechLangsSelectorProps {
  isServiceRunning: boolean;
  selectedSpeechLangs: Array<string>;
  setSelectedSpeechLangs: Dispatch<Array<string>>;
}

const SpeechLangsSelector = ({
  isServiceRunning,
  selectedSpeechLangs,
  setSelectedSpeechLangs,
}: SpeechLangsSelectorProps) => {
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  useEffect(() => {
    supportedTranscriptionLangs().then((langs) => setSelectOptions(langs));
  }, []);

  return (
    <Dropdown
      id="speech-lang"
      label="Chọn ngôn ngữ của người nói"
      value={selectedSpeechLangs}
      onChange={setSelectedSpeechLangs}
      multiple={true}
      options={selectOptions}
      disabled={isServiceRunning}
    />
  );
};

export default SpeechLangsSelector;
