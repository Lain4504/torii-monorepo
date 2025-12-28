import { UserRole } from '../models/user.model';

export interface TokenPayload {
    sub: string; // user ID
    role: UserRole;
}

export interface Requester extends TokenPayload { }

export interface ReqWithRequester {
    requester: Requester;
}
