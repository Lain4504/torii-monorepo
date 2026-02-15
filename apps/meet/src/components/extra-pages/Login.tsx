import React, { useState, useEffect } from 'react';
import { getDefaultRoomInfo } from '../../helpers/roomConfig';
import { SERVER_URL } from '../../config';

const Login = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [roomId, setRoomId] = useState('room01');
    const [userType, setUserType] = useState('participant');
    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setUserId(Date.now().toString());
        setName('user-' + Math.floor(Math.random() * 100));
    }, []);

    const getHashSignature = async (
        secretKey: string,
        message: string,
        algorithm = 'SHA-256',
    ) => {
        const encoder = new TextEncoder();
        const messageUint8Array = encoder.encode(message);
        const keyUint8Array = encoder.encode(secretKey);

        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            keyUint8Array,
            { name: 'HMAC', hash: algorithm },
            false,
            ['sign'],
        );

        const signature = await window.crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            messageUint8Array,
        );

        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    const sendRequest = async (body: any, method: string) => {
        const jsonBody = JSON.stringify(body);
        const signature = await getHashSignature(apiSecret, jsonBody);

        const headers = {
            'Content-Type': 'application/json',
            'API-KEY': apiKey,
            'HASH-SIGNATURE': signature,
        };

        const serverUrl = SERVER_URL;

        const response = await fetch(`${serverUrl}/auth/${method}`, {
            method: 'POST',
            headers: headers,
            body: jsonBody,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.msg || response.statusText);
        }

        return await response.json();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Check if room is active
            const isRoomActiveRes = await sendRequest({ room_id: roomId }, 'room/isRoomActive');
            let isRoomActive = isRoomActiveRes.is_active;

            // 2. If not active, create room
            if (!isRoomActive) {
                const roomInfo = getDefaultRoomInfo(roomId);
                const roomCreateRes = await sendRequest(roomInfo, 'room/create');
                isRoomActive = roomCreateRes.status;
            }

            // 3. If room active, join
            if (isRoomActive) {
                const userInfo = {
                    is_admin: userType === 'admin',
                    name: name,
                    user_id: userId,
                };

                const roomJoinRes = await sendRequest({
                    room_id: roomId,
                    user_info: userInfo,
                }, 'room/getJoinToken');

                if (roomJoinRes.status) {
                    const toUrl = window.location.href.split('?')[0];
                    window.location.href = `${toUrl}?access_token=${roomJoinRes.token}`;
                } else {
                    alert(roomJoinRes.msg);
                }
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f0f6fc] dark:bg-[#01102b] p-4 font-inter">
            <div className="w-full max-w-2xl bg-white dark:bg-[#001222] rounded-[24px] shadow-lg border border-[#c2daf2] dark:border-[#4d6680] p-10">
                <div className="flex justify-center mb-8">
                    <img src="/assets/imgs/main-logo-light.png" alt="Logo" className="h-14" />
                </div>

                <h2 className="text-2xl font-medium text-center text-[#233240] dark:text-white mb-8">Welcome Back</h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">API Key</label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">API Secret</label>
                            <input
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">Room</label>
                            <select
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='currentColor' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5.516 7.548l4.484 4.487 4.484-4.487L15.484 8.5 10 14l-5.484-5.5z'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                            >
                                {[...Array(15)].map((_, i) => (
                                    <option key={i} value={`room${(i + 1).toString().padStart(2, '0')}`}>Room {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">User Type</label>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='currentColor' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5.516 7.548l4.484 4.487 4.484-4.487L15.484 8.5 10 14l-5.484-5.5z'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                            >
                                <option value="admin">Admin</option>
                                <option value="participant">Participant</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#233240] dark:text-gray-200">User ID</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c2daf2] dark:border-[#4d6680] bg-white dark:bg-transparent text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="reset"
                            onClick={() => {
                                setApiKey('');
                                setApiSecret('');
                                setUserId(Date.now().toString());
                                setName('user-' + Math.floor(Math.random() * 100));
                            }}
                            className="px-8 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-600 shadow-sm transition-all"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 border border-blue-600 shadow-sm transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
