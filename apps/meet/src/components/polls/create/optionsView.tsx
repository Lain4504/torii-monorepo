import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Trash2, PlusCircle } from 'lucide-react';
import { CreatePollOptions } from './index';

interface OptionsProps {
  options: CreatePollOptions[];
  setOptions: Dispatch<SetStateAction<CreatePollOptions[]>>;
}

const OptionsView = ({ options, setOptions }: OptionsProps) => {
  const { t } = useTranslation();

  // update option text
  const onChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const newOptions = options.map((option, i) =>
        i === index ? { ...option, text: e.target.value } : option,
      );
      setOptions(newOptions);
    },
    [options, setOptions],
  );

  const removeOption = useCallback(
    (idToRemove: number) => {
      // Prevent removing below 2 options
      if (options.length <= 2) return;
      setOptions(options.filter((option) => option.id !== idToRemove));
    },
    [options, setOptions],
  );

  const addOption = useCallback(() => {
    setOptions((prev) => [
      ...prev,
      {
        id: (prev[prev.length - 1]?.id ?? 0) + 1,
        text: '',
      },
    ]);
  }, [setOptions]);

  const canRemove = useMemo(() => options.length > 2, [options.length]);

  return (
    <div className="option-field-wrapper pt-5 pb-6">
      <p className="text-sm text-foreground font-medium mb-2 inline-block">
        {t('polls.options')}
      </p>
      <div className="overflow-auto h-full max-h-[345px] scrollBar scrollBar2 mb-5">
        <div className="option-field-inner grid gap-5">
          {options.map((elm, index) => (
            <div className="form-inline" key={elm.id}>
              <div className="input-wrapper w-full flex items-center gap-2">
                <input
                  type="text"
                  required={true}
                  name={`opt_${elm.id}`}
                  value={elm.text}
                  onChange={(e) => onChange(index, e)}
                  placeholder={t('polls.option', {
                    count: index + 1,
                  })}
                  className="default-input flex-1"
                  autoComplete="off"
                />
                {canRemove && (
                  <button
                    type="button"
                    className="h-10 md:h-11 w-10 md:w-11 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm"
                    onClick={() => removeOption(elm.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        className="w-full cursor-pointer h-10 3xl:h-11 text-sm 3xl:text-base font-semibold bg-muted hover:bg-muted/80 rounded-lg flex justify-center items-center gap-2 transition-all duration-300 shadow-sm text-foreground"
        type="button"
        onClick={addOption}
      >
        {t('polls.add-new-option')}
        <PlusCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default OptionsView;
