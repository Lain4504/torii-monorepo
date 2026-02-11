import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
    updateAllowPlayAudioNotification,
    updateFocusActiveSpeakerWebcam,
    updateTheme,
} from '../../../store/slices/roomSettingsSlice';
import SettingsSwitch from '../../../helpers/ui/settingsSwitch';
import Dropdown from '../../../helpers/ui/dropdown';

const ApplicationSettings = () => {
    const dispatch = useAppDispatch();

    const theme = useAppSelector((state) => state.roomSettings.theme);
    const focusActiveSpeakerWebcam = useAppSelector(
        (state) => state.roomSettings.focusActiveSpeakerWebcam,
    );
    const allowPlayAudioNotification = useAppSelector(
        (state) => state.roomSettings.allowPlayAudioNotification,
    );

    const toggleTheme = () => {
        dispatch(updateTheme(theme === 'light' ? 'dark' : 'light'));
    };

    const toggleAudioNotification = () => {
        dispatch(updateAllowPlayAudioNotification(!allowPlayAudioNotification));
    };

    return (
        <div className="s">
            <SettingsSwitch
                label="Bật chủ đề tối"
                enabled={theme === 'dark'}
                onChange={toggleTheme}
                customCss="my-4"
            />
            <SettingsSwitch
                label="Tập trung vào máy ảnh người đang nói"
                enabled={!!focusActiveSpeakerWebcam}
                customCss="my-4"
                onChange={() =>
                    dispatch(updateFocusActiveSpeakerWebcam(!focusActiveSpeakerWebcam))
                }
            />
            <SettingsSwitch
                label="Cho phép thông báo âm thanh"
                enabled={allowPlayAudioNotification}
                onChange={toggleAudioNotification}
                customCss="my-4"
            />
        </div>
    );
};

export default ApplicationSettings;