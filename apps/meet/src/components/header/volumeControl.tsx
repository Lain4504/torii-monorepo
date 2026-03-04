import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';
import { debounce } from 'es-toolkit';

import {
  updateRoomAudioVolume,
  updateRoomScreenShareAudioVolume,
} from '@/store/slices/roomSettingsSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateParticipant } from '@/store/slices/participantSlice';
import { Volume2, VolumeX } from 'lucide-react';
import RangeSlider from '@/helpers/ui/rangeSlider';

const VolumeControl = () => {
  const dispatch = useAppDispatch();

  const roomVolume = useAppSelector(
    (state) => state.roomSettings.roomAudioVolume,
  );
  const screenShareVolume = useAppSelector(
    (state) => state.roomSettings.roomScreenShareAudioVolume,
  );
  const participantIds = useAppSelector((state) => state.participants.ids);

  const [localRoomVolume, setLocalRoomVolume] = useState(roomVolume);
  const [localScreenShareVolume, setLocalScreenShareVolume] =
    useState(screenShareVolume);

  // Sync from Redux to local state if the values differ.
  useEffect(() => {
    if (roomVolume !== localRoomVolume) {
      setLocalRoomVolume(roomVolume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomVolume]);

  useEffect(() => {
    if (screenShareVolume !== localScreenShareVolume) {
      setLocalScreenShareVolume(screenShareVolume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenShareVolume]);

  // Debounce updates from local state back to Redux.
  // oxlint-disable-next-line exhaustive-deps
  const debouncedRoomVolumeUpdate = useCallback(
    debounce((newVolume: number) => {
      dispatch(updateRoomAudioVolume(newVolume));
      // Also update all individual participants
      participantIds.forEach((id) => {
        dispatch(
          updateParticipant({ id, changes: { audioVolume: newVolume } }),
        );
      });
    }, 200),
    [dispatch, participantIds],
  );

  // oxlint-disable-next-line exhaustive-deps
  const debouncedScreenShareVolumeUpdate = useCallback(
    debounce((newVolume: number) => {
      dispatch(updateRoomScreenShareAudioVolume(newVolume));
    }, 200),
    [dispatch],
  );

  useEffect(() => {
    debouncedRoomVolumeUpdate(localRoomVolume);
  }, [localRoomVolume, debouncedRoomVolumeUpdate]);

  useEffect(() => {
    debouncedScreenShareVolumeUpdate(localScreenShareVolume);
  }, [localScreenShareVolume, debouncedScreenShareVolumeUpdate]);

  return (
    <Menu as={Fragment}>
      {({ open }) => (
        <div className="">
          <MenuButton
            className={`relative shrink-0 p-0 w-7 md:w-8 h-7 md:h-8 flex items-center justify-center rounded-[10px] ${open ? 'bg-muted' : ''
              }`}
          >
            <div className="text-foreground cursor-pointer">
              {localRoomVolume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
          </MenuButton>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 scale-95 -translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 -translate-y-2"
          >
            <MenuItems
              unmount={false}
              className="volume-popup-wrapper origin-top-right z-10 absolute ltr:right-0 top-6 rtl:left-0 mt-2 w-64 py-5 px-3 rounded-xl shadow-lg bg-popover border-border border"
            >
              <p className="text-sm text-foreground">
                Âm lượng âm thanh phòng
              </p>
              <section className="flex items-center pl-1">
                <RangeSlider
                  min={0}
                  max={100}
                  value={Math.round(localRoomVolume * 100)}
                  onChange={(v) => setLocalRoomVolume(v / 100)}
                  thumbSize={20}
                  trackHeight={8}
                />
                <p className="w-10 text-center text-sm text-foreground ml-3">
                  {Math.round(localRoomVolume * 100)}
                </p>
                <div className="w-5 h-5 flex items-center justify-center">
                  {localRoomVolume > 0 ? (
                    <Volume2 className="w-4 h-4 text-foreground" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-foreground" />
                  )}
                </div>
              </section>
              <p className="text-sm mt-2 text-foreground">
                Âm lượng âm thanh chia sẻ màn hình
              </p>
              <section className="flex items-center pl-1">
                <RangeSlider
                  min={0}
                  max={100}
                  value={Math.round(localScreenShareVolume * 100)}
                  onChange={(v) => setLocalScreenShareVolume(v / 100)}
                  thumbSize={20}
                  trackHeight={8}
                />
                <p className="w-10 text-center text-sm text-foreground ml-3">
                  {Math.round(localScreenShareVolume * 100)}
                </p>
                <div className="w-5 h-5 flex items-center justify-center">
                  {localScreenShareVolume > 0 ? (
                    <Volume2 className="w-4 h-4 text-foreground" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-foreground" />
                  )}
                </div>
              </section>
            </MenuItems>
          </Transition>
        </div>
      )}
    </Menu>
  );
};

export default VolumeControl;
