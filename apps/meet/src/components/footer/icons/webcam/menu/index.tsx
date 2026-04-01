import React, { useEffect } from 'react';
import { Menu, MenuButton, Transition } from '@headlessui/react';
import { Room } from 'livekit-client';

import WebcamMenuItems from '@/components/footer/icons/webcam/menu/items';
import { ChevronUp } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { addVideoDevices } from '@/store/slices/roomSettingsSlice';
import { getInputMediaDevices } from '@/helpers/utils';

/** Khi mở menu: luôn làm mới danh sách camera (Redux có thể rỗng nếu không qua landing/modal). */
const WebcamMenuRefreshDevices = ({ open }: { open: boolean }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { video } = await getInputMediaDevices('video');
        if (!cancelled) {
          dispatch(addVideoDevices(video));
        }
      } catch {
        // giữ danh sách cũ nếu không lấy được quyền / enumerate
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, dispatch]);
  return null;
};

interface IWebcamMenuProps {
  currentRoom: Room;
  isActiveWebcam: any;
  toggleWebcam: () => void;
}

const WebcamMenu = ({
  currentRoom,
  isActiveWebcam,
  toggleWebcam,
}: IWebcamMenuProps) => {
  return (
    <div className="menu relative overflow-visible">
      <Menu as="div">
        {({ open }) => (
          <>
            <WebcamMenuRefreshDevices open={open} />
            <MenuButton
              className={`footer-icon-bg w-[20px] md:w-[25px] 3xl:w-[30px] h-[34px] md:h-9 3xl:h-11 flex items-center justify-center border-r-0 border overflow-hidden ${isActiveWebcam ? 'bg-muted dark:bg-transparent rounded-r-full' : 'border-input'} ${open ? 'border-sidebar-border dark:border-secondary-foreground dark:bg-foreground!' : 'border-input dark:border-secondary-foreground dark:border-l-foreground'}`}
            >
              <ChevronUp className="w-4 h-4" />
            </MenuButton>

            {/* Use the Transition component. */}
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
              <WebcamMenuItems
                currentRoom={currentRoom}
                toggleWebcam={toggleWebcam}
              />
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default WebcamMenu;
