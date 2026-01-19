import React from 'react';
import { MenuItem, MenuItems } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../store';
import {
  updateShowKeyboardShortcutsModal,
  updateShowRoomSettingsModal,
} from '../../store/slices/roomSettingsSlice';
// import DarkThemeSwitcher from './darkThemeSwitcher';

import { Settings, Keyboard, LogOut } from 'lucide-react';

interface IHeaderMenusProps {
  onOpenAlert(task: string): void;
}

const HeaderMenus = ({ onOpenAlert }: IHeaderMenusProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <MenuItems
      unmount={false}
      className="HeaderSettingMenu origin-top-right z-50 bg-popover absolute ltr:right-0 rtl:-left-4 mt-2 w-[244px] shadow-md rounded-2xl overflow-hidden border border-border p-2 ring-0 focus:outline-hidden"
    >
      {/* <div className="dark-mode block md:hidden pt-1 pb-2">
        <DarkThemeSwitcher />
      </div>
      <div className="divider block md:hidden h-1 w-[110%] bg-muted -ml-3 my-0.5"></div> */}
      <MenuItem>
        <button
          className="h-9 md:h-10 w-full cursor-pointer flex items-center hover:bg-muted text-sm gap-2 leading-none font-medium text-foreground px-2 md:px-3 rounded-lg transition-all duration-300 relative"
          onClick={() => dispatch(updateShowRoomSettingsModal(true))}
        >
          <Settings className="text-primary w-4 h-4 ltr:mr-2 rtl:ml-2 transition ease-in" />
          {t('header.menus.settings')}
        </button>
      </MenuItem>

      <MenuItem>
        <button
          className="h-9 md:h-10 w-full cursor-pointer flex items-center hover:bg-muted text-sm gap-2 leading-none font-medium text-foreground px-2 md:px-3 rounded-lg transition-all duration-300 relative"
          onClick={() => dispatch(updateShowKeyboardShortcutsModal(true))}
        >
          <Keyboard className="text-primary w-4 h-4 ltr:mr-2 rtl:ml-2 transition ease-in" />
          {t('header.menus.keyboard-shortcuts')}
        </button>
      </MenuItem>

      <MenuItem>
        <button
          className="h-9 md:h-10 w-full cursor-pointer flex items-center hover:bg-muted text-sm gap-2 leading-none font-medium text-foreground px-2 md:px-3 rounded-lg transition-all duration-300 relative"
          onClick={() => onOpenAlert('logout')}
        >
          <LogOut className="text-primary w-4 h-4 ltr:mr-2 rtl:ml-2 transition ease-in" />
          {t('header.menus.logout')}
        </button>
      </MenuItem>
    </MenuItems>
  );
};

export default React.memo(HeaderMenus);
