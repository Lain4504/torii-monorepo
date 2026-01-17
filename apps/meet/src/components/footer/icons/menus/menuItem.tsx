import React from 'react';
import { MenuItem } from '@headlessui/react';

interface IAdminMenuItemProps {
  onClick: () => void;
  icon: React.ReactNode;
  text: React.ReactNode;
  isActive?: boolean;
}

const FooterMenuItem = ({
  onClick,
  icon,
  text,
  isActive,
}: IAdminMenuItemProps) => {
  return (
    <MenuItem>
      <button
        onClick={onClick}
        className="h-10 w-full cursor-pointer flex items-center hover:bg-muted text-sm gap-2 leading-none font-medium text-foreground px-3 rounded-lg transition-all duration-300 relative"
      >
        <span className="icon flex w-5 h-auto justify-center text-primary">
          {icon}
        </span>
        {text}
        {isActive && (
          <div className="h-2.5 w-2.5 rounded-full bg-primary absolute top-1/2 -translate-y-1/2 right-3" />
        )}
      </button>
    </MenuItem>
  );
};

export default FooterMenuItem;
