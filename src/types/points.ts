export const POINT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;

export const POINT_FLOW_TYPES = {
    INPUT: 'input',
    OUTPUT: 'output',
} as const;

export const POINT_TYPES = {
    REWARD_CODE: 'reward_code',
    CASHBACK: 'cashback',
    GIFT: 'gift',
    CORRECTION: 'correction',
    REDEEM: 'redeem',
} as const;

export const POINT_REFERENCE_TYPES = {
    ORDER: 'order',
    CODE: 'code',
} as const;

export const POINT_TYPE_LABELS: Record<string, string> = {
    reward_code: 'Código de recompensa',
    cashback: 'Compra',
    gift: 'Regalo',
    correction: 'Corrección',
    redeem: 'Canje',
};

/** Puntos manuales (regalo/corrección) que recepción puede dar a un cliente por día. Espejo de PointsEquivalence.RECEPTION_DAILY_LIMIT del backend, que es quien lo exige. */
export const RECEPTION_DAILY_POINTS_LIMIT = 20;
export const MANUAL_POINT_TYPES: string[] = [POINT_TYPES.GIFT, POINT_TYPES.CORRECTION];

export type PointStatus = (typeof POINT_STATUS)[keyof typeof POINT_STATUS];
export type PointFlowType = (typeof POINT_FLOW_TYPES)[keyof typeof POINT_FLOW_TYPES];
export type PointType = (typeof POINT_TYPES)[keyof typeof POINT_TYPES];
export type PointReferenceType = (typeof POINT_REFERENCE_TYPES)[keyof typeof POINT_REFERENCE_TYPES];

export interface FirebaseTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

export interface Point {
    id: string;
    userId: string;
    userIdCreate: string;
    points: number;
    description: string;
    flowType: PointFlowType;
    type: PointType;
    eventId: string | null;
    referenceId: string | null;
    referenceType: PointReferenceType | null;
    status: PointStatus;
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
}

export interface PointsResponse {
    body: Point[];
}
