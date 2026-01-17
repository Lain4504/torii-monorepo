import React from 'react';

interface ICheckboxProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox = ({
  id,
  label,
  description,
  checked,
  onChange,
}: ICheckboxProps) => (
  <div className="item flex items-start">
    <div className="input">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="border cursor-pointer border-border bg-card shadow-sm w-5 h-5 rounded outline-hidden focus:ring-1 focus:ring-primary mt-1"
      />
    </div>
    <div className="text-base w-full pl-2 sm:pl-4">
      <label
        htmlFor={id}
        className="text-sm 3xl:text-base font-medium text-foreground cursor-pointer"
      >
        {label}
        <p className="text-xs md:text-sm opacity-70 dark:opacity-80">
          {description}
        </p>
      </label>
    </div>
  </div>
);

export default Checkbox;
