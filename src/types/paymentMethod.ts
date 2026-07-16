
import type { StaticImageData } from 'next/image';

interface PaymentMethod {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    selected: boolean;
    logo?: StaticImageData | string;
}
export type { PaymentMethod };