import React, { useEffect } from 'react';
import { Menu, MenuButton, Transition } from '@headlessui/react';
import { Room } from 'livekit-client';

import MicMenuItems from '@/components/footer/icons/mic-menu/items';
import { ChevronUp } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { addAudioDevices } from '@/store/slices/roomSettingsSlice';
import { getInputMediaDevices } from '@/helpers/utils';

const MicMenuRefreshDevices = ({ open }: { open: boolean }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { audio } = await getInputMediaDevices('audio');
        if (!cancelled) {
          dispatch(addAudioDevices(audio));
        }
      } catch {
        // giữ danh sách cũ
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, dispatch]);
  return null;
};

interface IMicMenuProps {
  currentRoom: Room;
  isActiveMicrophone: any;
  isMicMuted: any;
}

const MicMenu = ({
  currentRoom,
  isActiveMicrophone,
  isMicMuted,
}: IMicMenuProps) => {
  return (
    <div className="menu relative overflow-visible">
      <Menu>
        {({ open }) => (
          <>
            <MicMenuRefreshDevices open={open} />
            <MenuButton
              className={`footer-icon-bg w-[20px] md:w-[25px] 3xl:w-[30px] h-[34px] md:h-9 3xl:h-11 flex items-center justify-center border-r-0 border border-border overflow-hidden cursor-pointer transition-colors duration-200
                ${isMicMuted && isActiveMicrophone ? '!bg-destructive/10 !border-destructive/20 text-destructive' : 'text-foreground'}
                ${isActiveMicrophone ? 'bg-muted rounded-r-full' : ''}
                ${open ? 'bg-accent' : ''}
              `}
            >
              <ChevronUp className="w-4 h-4" />
            </MenuButton>

            <Transition
              as="div"
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95 translate-y-2"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 translate-y-2"
            >
              <MicMenuItems currentRoom={currentRoom} />
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default MicMenu;
