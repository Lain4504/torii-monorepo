import React from 'react';

export interface IRadioOption {
  id: string;
  value: string | number;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface IRadioOptionsProps {
  options: IRadioOption[];
  name: string;
  checked: string | number | undefined;
  onChange: (value: any) => void;
}

const RadioOptions = ({
  options,
  name,
  checked,
  onChange,
}: IRadioOptionsProps) => {
  return (
    <div className="mt-4 pl-2 space-y-4">
      {options.map((option) => (
        <div
          key={option.id}
          className={`relative my-2 ${option.disabled ? 'opacity-50' : ''}`}
        >
          <div className="wrap flex items-center overflow-hidden">
            <input
              type="radio"
              value={option.value}
              name={name}
              id={option.id}
              disabled={option.disabled}
              checked={checked === option.value}
              onChange={() => onChange(option.value)}
              className="relative appearance-none w-[18px] h-[18px] border border-border bg-card shadow-sm rounded-full checked:bg-primary checked:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            />
            <label
              className="flex-1 text-sm text-foreground w-full h-full z-10 pl-2 cursor-pointer"
              htmlFor={option.id}
            >
              {option.label}
            </label>
          </div>
          {option.description && (
            <p className="text-xs text-destructive pl-[26px]">
              {option.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RadioOptions;
