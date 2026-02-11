import React, { Dispatch, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Dropdown, { ISelectOption } from '../../../helpers/ui/dropdown';
import { supportedTranslationLangs } from '../helpers/supportedLangs';

interface TransLangsSelectorProps {
  isServiceRunning: boolean;
  label: string;
  selectedTransLangs: Array<string>;
  setSelectedTransLangs: Dispatch<Array<string>>;
  setErrorMsg: Dispatch<string | undefined>;
  maxLangsAllowSelecting: number;
}

const TransLangsSelector = ({
  isServiceRunning,
  label,
  selectedTransLangs,
  setSelectedTransLangs,
  setErrorMsg,
  maxLangsAllowSelecting,
}: TransLangsSelectorProps) => {
  const [selectedItems, setSelectedItems] =
    useState<string[]>(selectedTransLangs);
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  useEffect(() => {
    if (selectedItems.length > maxLangsAllowSelecting) {
      const msg = `Bạn chỉ có thể chọn tối đa ${maxLangsAllowSelecting} ngôn ngữ`;

      toast.warn(msg, {
        toastId: 'max-lang-selection-warning',
      });
      setErrorMsg(msg);
      return;
    }
    setSelectedTransLangs(selectedItems);
  }, [
    setErrorMsg,
    selectedItems,
    maxLangsAllowSelecting,
    setSelectedTransLangs,
  ]);

  useEffect(() => {
    supportedTranslationLangs().then((langs) => setSelectOptions(langs));
  }, []);

  return (
    <div className="dropdown-wrap">
      <Dropdown
        id="trans-lang"
        label={label}
        value={selectedTransLangs}
        onChange={setSelectedItems}
        multiple={true}
        options={selectOptions}
        disabled={isServiceRunning}
      />
    </div>
  );
};

export default TransLangsSelector;
