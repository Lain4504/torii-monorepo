import React, { Fragment } from 'react';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';

import { useAppSelector } from '../../../store';
import LockSettingsModal from '../modals/lockSettingsModal';
import RtmpModal from '../modals/rtmpModal';
import ManageWaitingRoom from '../../waiting-room';
import BreakoutRoom from '../../breakout-room';
import { MoreHorizontal } from 'lucide-react';
import ExternalMediaPlayerModal from '../../external-media-player/modal';
import DisplayExternalLinkModal from '../../display-external-link/modal';
import AdminMenus from './menus/adminMenus';
import IconsInMenu from './menus/iconsInMenu';
import TranslationTranscriptionSettingModal from '../../translation-transcription/settingModal';
import InsightsAiSettingsModal from '../../insights-ai';

interface MenusIconProps {
  isAdmin: boolean;
}

const MenusIcon = ({ isAdmin }: MenusIconProps) => {
  const showRtmpModal = useAppSelector(
    (state) => state.bottomIconsActivity.showRtmpModal,
  );

  const showExternalMediaPlayerModal = useAppSelector(
    (state) => state.bottomIconsActivity.showExternalMediaPlayerModal,
  );
  const showManageWaitingRoomModal = useAppSelector(
    (state) => state.bottomIconsActivity.showManageWaitingRoomModal,
  );
  const showManageBreakoutRoomModal = useAppSelector(
    (state) => state.bottomIconsActivity.showManageBreakoutRoomModal,
  );
  const showDisplayExternalLinkModal = useAppSelector(
    (state) => state.bottomIconsActivity.showDisplayExternalLinkModal,
  );
  const showLockSettingsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showLockSettingsModal,
  );
  const showSpeechSettingsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showSpeechSettingsModal,
  );
  const showInsightsAISettingsModal = useAppSelector(
    (state) => state.bottomIconsActivity.showInsightsAISettingsModal,
  );

  return (
    <>
      <div className="menu relative z-10">
        <Menu>
          {({ open }) => (
            <div>
              <MenuButton>
                <div
                  className={`footer-menu relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4 ${open ? 'border-primary/25' : 'border-transparent'}`}
                >
                  <div
                    className={`footer-icon-bg relative footer-icon flex items-center justify-center cursor-pointer w-full h-full rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground ${open ? 'bg-muted' : 'bg-card'}`}
                  >
                    <MoreHorizontal className="w-auto h-4 md:h-5 3xl:h-6" />
                  </div>
                </div>
              </MenuButton>
              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-2"
              >
                <MenuItems
                  static={false}
                  className="origin-bottom-left -right-11 lg:left-0 z-9999 absolute mt-2 w-[300px] bottom-14 shadow-lg rounded-xl overflow-hidden border border-border bg-popover p-2"
                  id="footer-menu"
                >
                  <div className="inner">
                    {isAdmin && (
                      <>
                        <AdminMenus />
                      </>
                    )}
                    <div className="mobile-menu-icons block md:hidden">
                      <div className="divider h-1 w-[110%] bg-border -ml-3 my-0.5 last-one"></div>
                      <IconsInMenu />
                    </div>
                  </div>
                </MenuItems>
              </Transition>
            </div>
          )}
        </Menu>
      </div>
      {showLockSettingsModal && <LockSettingsModal />}
      {showRtmpModal && <RtmpModal />}
      {showExternalMediaPlayerModal && <ExternalMediaPlayerModal />}
      {showManageWaitingRoomModal && <ManageWaitingRoom />}
      {showManageBreakoutRoomModal && <BreakoutRoom />}
      {showDisplayExternalLinkModal && <DisplayExternalLinkModal />}
      {showSpeechSettingsModal && <TranslationTranscriptionSettingModal />}
      {showInsightsAISettingsModal && <InsightsAiSettingsModal />}
    </>
  );
};

export default MenusIcon;
