import React, { useState, useEffect } from 'react';
import { getDefaultRoomInfo } from '../../helpers/roomConfig';
import { SERVER_URL } from '../../config';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { NativeSelect, NativeSelectOption } from '@workspace/ui/components/native-select';

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
                            <Label>API Key</Label>
                            <Input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>API Secret</Label>
                            <Input
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Room</Label>
                            <NativeSelect
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            >
                                {[...Array(15)].map((_, i) => (
                                    <NativeSelectOption key={i} value={`room${(i + 1).toString().padStart(2, '0')}`}>Room {i + 1}</NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>User Type</Label>
                            <NativeSelect
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <NativeSelectOption value="admin">Admin</NativeSelectOption>
                                <NativeSelectOption value="participant">Participant</NativeSelectOption>
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>User ID</Label>
                            <Input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            type="reset"
                            onClick={() => {
                                setApiKey('');
                                setApiSecret('');
                                setUserId(Date.now().toString());
                                setName('user-' + Math.floor(Math.random() * 100));
                            }}
                            variant="destructive"
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
