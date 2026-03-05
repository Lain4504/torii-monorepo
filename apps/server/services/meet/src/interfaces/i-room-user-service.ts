import {SwitchPresenterTask, WajlcTokenClaims} from "@workspace/protocol";

export interface IRoomUserService{

    /**
     * Check if user is in block list
     */
    isUserInBlockList(roomId: string, userId: string): Promise<boolean>;

    /**
     * Get user online status
     */
    getUserStatus(roomId: string, userId: string): Promise<string>;

    /**
     * Get online users count
     */
    getOnlineUsersCount(roomId: string): Promise<number>;

    /**
     * Generate Wajlc join token for a user
     *
     * This is the main entry point for users joining a room
     */
    getWajlcJoinToken(req: any): Promise<{ token: string }>;

    /**
     * Update user lock settings
     */
    updateUserLockSettings(data: {
        roomId: string;
        userId: string;
        service: string;
        direction: 'lock' | 'unlock';
        requestedUserId?: string;
    }): Promise<{ status: boolean; msg: string }>;

    /**
     * Mute/unmute user track
     *
     * If trackSid not provided, will find microphone track automatically
     */
    handleMuteUnMuteTrack(data: {
        roomId: string;
        userId: string;
        trackSid?: string;
        muted: boolean;
        requestedUserId?: string;
    }): Promise<{ status: boolean; msg: string }>;

    /**
     * Remove participant from room
     *
     * Removes a participant from the room, with option to block them from rejoining.
     */
    handleRemoveParticipant(data: {
        sid: string;
        roomId: string;
        userId: string;
        msg?: string;
        blockUser?: boolean;
    }): Promise<{ status: boolean; msg: string }>;

    /**
     * Switch presenter in room

     */
    handleSwitchPresenter(data: {
        roomId: string;
        userId: string;
        requestedUserId: string;
        task: SwitchPresenterTask;
    }): Promise<{ status: boolean; msg: string }>;

    /**
     * RaisedHand - User raises hand
     */
    raisedHand(roomId: string, userId: string, msg: string): Promise<void>;

    /**
     * LowerHand - Lower raised hand
     */
    lowerHand(roomId: string, userId: string): Promise<void>

    /**
     * Generate Wajlc JWT access token
     */
    generateWajlcJoinToken(claims: WajlcTokenClaims): string;

    /**
     * Verify Wajlc access token
     */
    verifyWajlcAccessToken(token: string, gracefulPeriodSeconds: number): WajlcTokenClaims;

    /**
     * Alias for verifyWajlcAccessToken
     * Used by NATS auth callout
     */
    verifyToken(token: string): WajlcTokenClaims;

    /**
     * Get claims without verification (unsafe)
     */
    unsafeClaimsWithoutVerification(token: string): WajlcTokenClaims | null;

    /**
     * Renew Wajlc token
     * Note: This requires NATS service to check user status
     */
    renewWajlcToken(oldToken: string, gracefulPeriodSeconds: number): Promise<string>;

    /**
     * Validate LiveKit webhook token
     */
    validateLivekitWebhookToken(body: string | Buffer, token: string): boolean;

}