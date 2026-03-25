export enum ExamSessionStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    SUBMITTED = 'SUBMITTED',
    COMPLETED = 'COMPLETED',
}

export enum RefundStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
}

export enum AcademyFolderType {
    LIVE_CLASS_SHARED = 'LIVE_CLASS_SHARED',
    SHARED = 'SHARED',
}

export enum AcademyFolderOwnerType {
    SYSTEM = 'SYSTEM',
    LECTURER = 'LECTURER',
    LIVE_CLASS = 'LIVE_CLASS',
    USER = 'USER',
}

export enum AcademyResourceType {
    FILE = 'FILE',
    LINK = 'LINK',
}

export enum AcademyResourceVisibility {
    ENROLLED_ONLY = 'ENROLLED_ONLY',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}
