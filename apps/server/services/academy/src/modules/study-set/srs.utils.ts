export type SrsState = 'NEW' | 'LEARNING' | 'REVIEW' | 'GRADUATED';
export type SrsRating = 'KNOW' | 'DONT_KNOW';

export function calculateSrsInterval(
    currentState: SrsState,
    currentIntervalSeconds: number,
    rating: SrsRating
): { srsState: SrsState; interval: number; nextReviewAt: Date } {
    let newState = currentState;
    let newInterval = currentIntervalSeconds;

    if (rating === 'DONT_KNOW') {
        // Reset to LEARNING state, interval to 1 min
        newState = 'LEARNING';
        newInterval = 60; // 1 min
    } else {
        // KNOW
        if (currentState === 'NEW' || currentState === 'LEARNING') {
            newState = 'REVIEW';
            newInterval = 10 * 60; // 10 min
        } else if (currentState === 'REVIEW') {
            newState = 'GRADUATED';
            newInterval = 24 * 60 * 60; // 1 day
        } else if (currentState === 'GRADUATED') {
            // Basic scaling for graduated cards.
            // E.g. Multiply current interval by a factor (e.g. 2.5)
            newInterval = Math.max(currentIntervalSeconds * 2.5, 24 * 60 * 60);
        }
    }

    const nextReviewAt = new Date(Date.now() + newInterval * 1000);

    return {
        srsState: newState,
        interval: Math.round(newInterval),
        nextReviewAt,
    };
}
