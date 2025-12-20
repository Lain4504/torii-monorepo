'use client';

import { FormEvent, useState } from 'react';
import { PlugNmeetApiService, RoomInfo, UserInfo } from '@/lib/plugnmeet-api';
import './login.css';

interface LoginFormData {
    api_key: string;
    api_secret: string;
    room_id: string;
    user_type: 'admin' | 'participant';
    name: string;
    user_id: string;
}

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<LoginFormData>({
        api_key: '',
        api_secret: '',
        room_id: 'room01',
        user_type: 'participant',
        name: `user-${Math.floor(Math.random() * 100)}`,
        user_id: Date.now().toString(),
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Initialize API service
            const apiService = new PlugNmeetApiService(
                formData.api_key,
                formData.api_secret
            );

            // Room configuration (from plugNmeet-client)
            const roomInfo: RoomInfo = {
                room_id: formData.room_id,
                empty_timeout: 60 * 60 * 2, // 2 hours
                metadata: {
                    room_title: 'Demo room',
                    welcome_message:
                        'Welcome to plugNmeet!<br /> To share microphone click mic icon from bottom left side.',
                    room_features: {
                        allow_webcams: true,
                        mute_on_start: false,
                        allow_screen_share: true,
                        allow_rtmp: true,
                        admin_only_webcams: false,
                        allow_view_other_webcams: true,
                        allow_view_other_users_list: true,
                        room_duration: 0,
                        enable_analytics: true,
                        allow_virtual_bg: true,
                        allow_raise_hand: true,
                        recording_features: {
                            is_allow: true,
                            is_allow_cloud: true,
                            is_allow_local: true,
                            enable_auto_cloud_recording: false,
                            only_record_admin_webcams: false,
                        },
                        chat_features: {
                            is_allow: true,
                            is_allow_file_upload: true,
                            max_file_size: 50,
                            allowed_file_types: ['jpg', 'png', 'zip', 'pdf'],
                        },
                        shared_note_pad_features: {
                            is_allow: true,
                        },
                        whiteboard_features: {
                            is_allow: true,
                        },
                        external_media_player_features: {
                            is_allow: true,
                        },
                        waiting_room_features: {
                            is_active: true,
                        },
                        breakout_room_features: {
                            is_allow: true,
                            allowed_number_rooms: 6,
                        },
                        display_external_link_features: {
                            is_allow: true,
                        },
                        ingress_features: {
                            is_allow: true,
                        },
                        polls_features: {
                            is_allow: true,
                        },
                        insights_features: {
                            is_allow: true,
                            transcription_features: {
                                is_allow: true,
                                is_allow_translation: true,
                                is_allow_speech_synthesis: true,
                            },
                            chat_translation_features: {
                                is_allow: true,
                            },
                            ai_features: {
                                is_allow: true,
                                ai_text_chat_features: {
                                    is_allow: true,
                                },
                                meeting_summarization_features: {
                                    is_allow: true,
                                },
                            },
                        },
                        end_to_end_encryption_features: {
                            is_enabled: false,
                            included_chat_messages: false,
                            included_whiteboard: false,
                            enabled_self_insert_encryption_key: false,
                        },
                    },
                },
            };

            // User information
            const userInfo: UserInfo = {
                is_admin: formData.user_type === 'admin',
                name: formData.name,
                user_id: formData.user_id,
            };

            // Check if room is active
            const roomActiveRes = await apiService.isRoomActive(formData.room_id);

            if (!roomActiveRes.status) {
                setError(roomActiveRes.msg);
                setIsLoading(false);
                return;
            }

            let isRoomActive = roomActiveRes.is_active || false;

            // Create room if not active
            if (!isRoomActive) {
                const roomCreateRes = await apiService.createRoom(roomInfo);
                if (!roomCreateRes.status) {
                    setError(roomCreateRes.msg);
                    setIsLoading(false);
                    return;
                }
                isRoomActive = roomCreateRes.status;
            }

            // Get join token if room is active
            if (isRoomActive) {
                const joinTokenRes = await apiService.getJoinToken({
                    room_id: formData.room_id,
                    user_info: userInfo,
                });

                if (joinTokenRes.status && joinTokenRes.token) {
                    // Redirect to meeting room (adjust URL as needed)
                    const baseUrl = window.location.origin;
                    window.location.href = `${baseUrl}/?access_token=${joinTokenRes.token}`;
                } else {
                    setError(joinTokenRes.msg);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            api_key: '',
            api_secret: '',
            room_id: 'room01',
            user_type: 'participant',
            name: `user-${Math.floor(Math.random() * 100)}`,
            user_id: Date.now().toString(),
        });
        setError(null);
    };

    return (
        <div className="plugnmeet-login">
            <div className="container">
                {/* Logo Section */}
                <div className="logo">
                    <img src="/plugnmeet/imgs/main-logo.png" alt="main-logo" />
                </div>

                {/* Login Form */}
                <div className="form">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h5 className="card-title">Join Meeting Room</h5>

                        <div className="inputs-wrapper">
                            {/* API Key */}
                            <div className="item">
                                <label htmlFor="api_key">plugNmeet API Key</label>
                                <input
                                    type="text"
                                    name="api_key"
                                    id="api_key"
                                    value={formData.api_key}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* API Secret */}
                            <div className="item">
                                <label htmlFor="api_secret">plugNmeet API Secret</label>
                                <input
                                    type="password"
                                    name="api_secret"
                                    id="api_secret"
                                    value={formData.api_secret}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Room Selection */}
                            <div className="item select-wrap">
                                <label htmlFor="room_id">Select Room</label>
                                <select
                                    name="room_id"
                                    id="room_id"
                                    value={formData.room_id}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                >
                                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={`room${String(num).padStart(2, '0')}`}>
                                            Room {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* User Type */}
                            <div className="item select-wrap">
                                <label htmlFor="user_type">User type</label>
                                <select
                                    name="user_type"
                                    id="user_type"
                                    value={formData.user_type}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="participant">Participant</option>
                                </select>
                            </div>

                            {/* Name */}
                            <div className="item">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* User ID */}
                            <div className="item">
                                <label htmlFor="user_id">User Id</label>
                                <input
                                    type="text"
                                    name="user_id"
                                    id="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && <div className="error-message">{error}</div>}

                        {/* Action Buttons */}
                        <div className="buttons">
                            <button className="btn btn-primary" type="submit" disabled={isLoading}>
                                {isLoading && <span className="loading-spinner" />}
                                {isLoading ? 'Joining...' : 'Submit'}
                            </button>
                            <button
                                className="btn btn-danger"
                                type="button"
                                onClick={handleReset}
                                disabled={isLoading}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
