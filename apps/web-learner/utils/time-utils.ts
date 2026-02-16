import { format, isAfter, addMinutes, differenceInSeconds } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date time to standard format: HH:mm dd/MM/yyyy
 * @param date Date string or object
 * @returns Formatted date string
 */
export const formatDateTime = (date: string | Date) => {
    if (!date) return 'N/A';
    try {
        return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch {
        return 'N/A';
    }
};

/**
 * Check if a date is within a certain number of minutes from now
 * @param createdAt Creation date
 * @param minutes Threshold in minutes
 * @returns boolean
 */
export const isWithinGracePeriod = (createdAt: string | Date, minutes: number = 30) => {
    if (!createdAt) return false;
    try {
        const expirationTime = addMinutes(new Date(createdAt), minutes);
        return isAfter(expirationTime, new Date());
    } catch {
        return false;
    }
};

/**
 * Get remaining time in seconds
 * @param createdAt Creation date
 * @param minutes Threshold in minutes
 * @returns number of seconds remaining
 */
export const getRemainingSeconds = (createdAt: string | Date, minutes: number = 30) => {
    if (!createdAt) return 0;
    try {
        const expirationTime = addMinutes(new Date(createdAt), minutes);
        const seconds = differenceInSeconds(expirationTime, new Date());
        return Math.max(0, seconds);
    } catch {
        return 0;
    }
};

/**
 * Format seconds to mm:ss
 * @param seconds number of seconds
 * @returns string mm:ss
 */
export const formatRemainingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
