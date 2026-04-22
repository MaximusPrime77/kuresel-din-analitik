import type { DinTuru } from './types';

export const DIN_RENKLERI: Record<DinTuru, string> = {
    'İslam': '#10B981',
    'Hristiyanlık': '#3B82F6',
    'Yahudilik': '#F59E0B',
    'Hinduizm': '#F97316',
    'Budizm': '#EC4899',
    'Dinsiz': '#64748B',
    'Geleneksel/Animist': '#A78BFA',
    'Sih': '#F472B6',
    'Diğer': '#94A3B8',
};

export const DIN_LISTESI: DinTuru[] = [
    'İslam',
    'Hristiyanlık',
    'Yahudilik',
    'Hinduizm',
    'Budizm',
    'Dinsiz',
    'Geleneksel/Animist',
    'Sih',
    'Diğer',
];

export const MEZHEP_HARITASI: Partial<Record<DinTuru, string[]>> = {
    'İslam': ['Sünni', 'Şii', 'İbadi', 'Ahmedi', 'Diğer İslam'],
    'Hristiyanlık': ['Katolik', 'Protestan', 'Ortodoks', 'Anglikan', 'Diğer Hristiyan'],
    'Yahudilik': ['Ortodoks Yahudi', 'Reform Yahudi', 'Muhafazakâr Yahudi', 'Diğer Yahudi'],
};

export function dinRenginiAl(din: DinTuru): string {
    return DIN_RENKLERI[din] || '#94A3B8';
}
