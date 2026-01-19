import React, { useCallback } from 'react';
import { MenuItem, MenuItems } from '@headlessui/react';
import { Room, Track } from 'livekit-client';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../../../store';
import { updateSelectedVideoDevice } from '../../../../../store/slices/roomSettingsSlice';
import {
  updateIsActiveWebcam,
  updateVirtualBackground,
} from '../../../../../store/slices/bottomIconsActivitySlice';
import { Check, VideoOff } from 'lucide-react';

interface IWebcamMenuItemsProps {
  currentRoom: Room;
  toggleWebcam: () => void;
}

const WebcamMenuItems = ({
  toggleWebcam,
  currentRoom,
}: IWebcamMenuItemsProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const videoDevices = useAppSelector(
    (state) => state.roomSettings.videoDevices,
  );
  const selectedVideoDevice = useAppSelector(
    (state) => state.roomSettings.selectedVideoDevice,
  );

  const handleDeviceChange = useCallback(
    (deviceId: string) => {
      dispatch(updateSelectedVideoDevice(deviceId));
    },
    [dispatch],
  );

  const leaveWebcam = useCallback(async () => {
    if (currentRoom) {
      for (const publication of currentRoom.localParticipant.videoTrackPublications.values()) {
        if (
          publication.track &&
          publication.track.source === Track.Source.Camera
        ) {
          await currentRoom.localParticipant.unpublishTrack(
            publication.track,
            true,
          );
        }
      }
    }
    dispatch(updateIsActiveWebcam(false));
    dispatch(updateSelectedVideoDevice(''));
    dispatch(
      updateVirtualBackground({
        type: 'none',
      }),
    );
  }, [currentRoom, dispatch]);

  return (
    <MenuItems
      static
      className="menu origin-top-right z-10 absolute ltr:-left-8 md:ltr:left-0 rtl:right-0 bottom-12 border border-border bg-popover shadow-lg rounded-2xl overflow-hidden p-2 w-max"
    >
      <div className="title h-8 w-full flex items-center text-xs leading-none text-muted-foreground px-3 uppercase">
        {t('footer.icons.select-webcam')}
      </div>
      {videoDevices.map((device) => (
        <MenuItem key={device.id}>
          {() => (
            <p
              className={`${selectedVideoDevice === device.id
                ? 'bg-muted'
                : ''
                } h-8 w-full flex items-center justify-between text-sm gap-2 leading-none font-medium text-foreground px-2 rounded-lg transition-all duration-300 hover:bg-muted`}
              onClick={() => handleDeviceChange(device.id)}
            >
              {device.label}
              {selectedVideoDevice === device.id ? <Check className="w-4 h-4 text-primary" /> : ''}
            </p>
          )}
        </MenuItem>
      ))}
      <div className="divider h-1 w-[110%] bg-muted -ml-3 my-1"></div>
      <div className="" role="none">
        <MenuItem>
          {() => (
            <p
              className="h-8 w-full flex items-center text-sm gap-2 leading-none font-medium text-red-700 px-2 rounded-lg transition-all duration-300 hover:bg-Red-600 hover:text-white"
              onClick={toggleWebcam}
            >
              <VideoOff className={'h-4 w-auto'} />
              {t('footer.icons.turn-off-webcam')}
            </p>
          )}
        </MenuItem>
      </div>
      <div className="" role="none">
        <MenuItem>
          {() => (
            <p
              className="group h-8 w-full flex items-center text-sm gap-2 leading-none font-medium text-red-700 px-2 rounded-lg transition-all duration-300 hover:bg-Red-600 hover:text-white"
              onClick={leaveWebcam}
            >
              <i className="wajlc-logout text-base transition ease-in" />
              {t('footer.menus.leave-webcam')}
            </p>
          )}
        </MenuItem>
      </div>
    </MenuItems>
  );
};

export default WebcamMenuItems;
