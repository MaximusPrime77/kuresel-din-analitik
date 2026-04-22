import { create } from 'zustand';
import type { DinTuru, Ulke, SiralamaYapisi } from './types';
import { MEZHEP_HARITASI } from './colors';

interface UygulamaDurumu {
    ulkeler: Ulke[];
    seciliDinler: DinTuru[];
    seciliMezhepler: Record<string, string[]>;
    seciliUlke: Ulke | null;
    siralama: SiralamaYapisi;
    ipucuVerisi: {
        ulke: Ulke;
        x: number;
        y: number;
    } | null;
    aramaMetni: string;
    rehberAcik: boolean;
    haritaHatasi: string | null;

    veriKaynaklariAcik: boolean;

    ulkeleriAyarla: (ulkeler: Ulke[]) => void;
    dinToggle: (din: DinTuru) => void;
    mezhepToggle: (din: DinTuru, mezhep: string) => void;
    ulkeSec: (ulke: Ulke | null) => void;
    siralamaAyarla: (siralama: SiralamaYapisi) => void;
    ipucuGoster: (ulke: Ulke, x: number, y: number) => void;
    ipucuGizle: () => void;
    aramaAyarla: (metin: string) => void;
    rehberToggle: (acik?: boolean) => void;
    haritaHatasiAyarla: (hata: string | null) => void;
    veriKaynaklariToggle: (acik?: boolean) => void;
}

export const useStore = create<UygulamaDurumu>((set) => ({
    ulkeler: [],
    seciliDinler: [],
    seciliMezhepler: {},
    seciliUlke: null,
    siralama: { alan: 'nufus', yon: 'azalan' },
    ipucuVerisi: null,
    aramaMetni: '',
    rehberAcik: false,
    haritaHatasi: null,
    veriKaynaklariAcik: false,

    ulkeleriAyarla: (ulkeler) => set({ ulkeler }),

    dinToggle: (din) =>
        set((durum) => {
            const mevcutMu = durum.seciliDinler.includes(din);
            if (mevcutMu) {
                const yeniMezhepler = { ...durum.seciliMezhepler };
                delete yeniMezhepler[din];
                return {
                    seciliDinler: durum.seciliDinler.filter((d) => d !== din),
                    seciliMezhepler: yeniMezhepler,
                };
            } else {
                return {
                    seciliDinler: [...durum.seciliDinler, din],
                };
            }
        }),

    mezhepToggle: (din, mezhep) =>
        set((durum) => {
            const mevcutMezhepler = durum.seciliMezhepler[din] || [];
            const mevcutMu = mevcutMezhepler.includes(mezhep);
            const tumMezhepler = MEZHEP_HARITASI[din] || [];

            let yeniMezhepler: string[];
            if (mevcutMu) {
                yeniMezhepler = mevcutMezhepler.filter((m) => m !== mezhep);
            } else {
                yeniMezhepler = [...mevcutMezhepler, mezhep];
            }

            if (yeniMezhepler.length === tumMezhepler.length) {
                yeniMezhepler = [];
            }

            return {
                seciliMezhepler: {
                    ...durum.seciliMezhepler,
                    [din]: yeniMezhepler,
                },
            };
        }),

    ulkeSec: (ulke) => set({ seciliUlke: ulke }),

    siralamaAyarla: (siralama) => set({ siralama }),

    ipucuGoster: (ulke, x, y) => set({ ipucuVerisi: { ulke, x, y } }),

    ipucuGizle: () => set({ ipucuVerisi: null }),

    aramaAyarla: (metin) => set({ aramaMetni: metin }),

    rehberToggle: (acik) => set((durum) => ({
        rehberAcik: acik !== undefined ? acik : !durum.rehberAcik,
    })),

    haritaHatasiAyarla: (hata) => set({ haritaHatasi: hata }),

    veriKaynaklariToggle: (acik) => set((durum) => ({
        veriKaynaklariAcik: acik !== undefined ? acik : !durum.veriKaynaklariAcik,
    })),
}));
