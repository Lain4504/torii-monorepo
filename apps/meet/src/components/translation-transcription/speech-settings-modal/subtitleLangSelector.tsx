import React, { useMemo } from 'react';
import { InsightsTranscriptionFeatures } from '@workspace/protocol';

import { getSubtitleLangs } from '@/components/translation-transcription/helpers/supportedLangs';
import Dropdown, { ISelectOption } from '@/helpers/ui/dropdown';

interface ISubtitleLangSelectorProps {
  transcriptionFeatures: InsightsTranscriptionFeatures;
  selectedSubtitleLang: string;
  setSelectedSubtitleLang: (lang: string) => void;
}

const SubtitleLangSelector = ({
  transcriptionFeatures,
  selectedSubtitleLang,
  setSelectedSubtitleLang,
}: ISubtitleLangSelectorProps) => {

  const dropdownOptions: ISelectOption[] = useMemo(() => {
    const langs = getSubtitleLangs(
      transcriptionFeatures.allowedSpokenLangs,
      transcriptionFeatures.allowedTransLangs,
    );
    return langs.map((l) => ({
      value: l.code,
      text: l.name,
    }));
  }, [
    transcriptionFeatures.allowedSpokenLangs,
    transcriptionFeatures.allowedTransLangs,
  ]);

  return (
    <div className="px-5 pt-4 pb-4">
      <Dropdown
        id="language"
        label="Ngôn ngữ phụ đề"
        value={selectedSubtitleLang}
        onChange={setSelectedSubtitleLang}
        options={dropdownOptions}
        direction="vertical"
      />
    </div>
  );
};

export default SubtitleLangSelector;
