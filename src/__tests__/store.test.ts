import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';
import type { DinTuru } from '../types';

describe('Zustand Store', () => {
    beforeEach(() => {
        // Store'u sıfırla
        useStore.setState({
            ulkeler: [],
            seciliDinler: [],
            seciliMezhepler: {},
            seciliUlke: null,
            siralama: { alan: 'nufus', yon: 'azalan' },
            ipucuVerisi: null,
            aramaMetni: '',
            rehberAcik: false,
            haritaHatasi: null,
        });
    });

    describe('dinToggle', () => {
        it('bir din seçtiğinde listeye eklemeli', () => {
            useStore.getState().dinToggle('İslam');
            expect(useStore.getState().seciliDinler).toContain('İslam');
        });

        it('aynı dini tekrar seçtiğinde listeden kaldırmalı', () => {
            useStore.getState().dinToggle('İslam');
            useStore.getState().dinToggle('İslam');
            expect(useStore.getState().seciliDinler).not.toContain('İslam');
        });

        it('birden fazla din seçilebilmeli', () => {
            useStore.getState().dinToggle('İslam');
            useStore.getState().dinToggle('Hristiyanlık');
            expect(useStore.getState().seciliDinler).toEqual(['İslam', 'Hristiyanlık']);
        });

        it('din kaldırıldığında ilgili mezhep seçimleri de temizlenmeli', () => {
            useStore.getState().dinToggle('İslam');
            useStore.getState().mezhepToggle('İslam', 'Sünni');
            expect(useStore.getState().seciliMezhepler['İslam']).toContain('Sünni');

            useStore.getState().dinToggle('İslam');
            expect(useStore.getState().seciliMezhepler['İslam']).toBeUndefined();
        });
    });

    describe('mezhepToggle', () => {
        it('mezhep seçtiğinde ilgili din altına eklemeli', () => {
            useStore.getState().dinToggle('İslam');
            useStore.getState().mezhepToggle('İslam', 'Sünni');
            expect(useStore.getState().seciliMezhepler['İslam']).toContain('Sünni');
        });

        it('aynı mezhebi tekrar seçtiğinde kaldırmalı', () => {
            useStore.getState().dinToggle('İslam');
            useStore.getState().mezhepToggle('İslam', 'Sünni');
            useStore.getState().mezhepToggle('İslam', 'Sünni');
            expect(useStore.getState().seciliMezhepler['İslam']).not.toContain('Sünni');
        });

        it('tüm mezhepler seçildiğinde listeyi sıfırlamalı (hepsi = hiçbiri mantığı)', () => {
            useStore.getState().dinToggle('İslam');
            // İslam mezhepleri: Sünni, Şii, İbadi, Ahmedi, Diğer İslam
            useStore.getState().mezhepToggle('İslam', 'Sünni');
            useStore.getState().mezhepToggle('İslam', 'Şii');
            useStore.getState().mezhepToggle('İslam', 'İbadi');
            useStore.getState().mezhepToggle('İslam', 'Ahmedi');
            useStore.getState().mezhepToggle('İslam', 'Diğer İslam');
            expect(useStore.getState().seciliMezhepler['İslam']).toEqual([]);
        });
    });

    describe('ulkeSec', () => {
        it('ülke seçebilmeli', () => {
            const testUlke = {
                ulke: 'Türkiye',
                ulkeKodu: 'TUR',
                nufus: 85280000,
                dinler: [{ din: 'İslam' as DinTuru, yuzde: 97.8 }],
                guvenilirlik: 'yüksek' as const,
                veriTipi: 'Din + Mezhep' as const,
                kaynakReferansi: 'Test',
            };
            useStore.getState().ulkeSec(testUlke);
            expect(useStore.getState().seciliUlke?.ulkeKodu).toBe('TUR');
        });

        it('null ile seçimi kaldırabilmeli', () => {
            useStore.getState().ulkeSec(null);
            expect(useStore.getState().seciliUlke).toBeNull();
        });
    });

    describe('siralamaAyarla', () => {
        it('sıralama değiştirebilmeli', () => {
            useStore.getState().siralamaAyarla({ alan: 'ulke', yon: 'artan' });
            expect(useStore.getState().siralama).toEqual({ alan: 'ulke', yon: 'artan' });
        });
    });

    describe('aramaAyarla', () => {
        it('arama metnini ayarlayabilmeli', () => {
            useStore.getState().aramaAyarla('Türkiye');
            expect(useStore.getState().aramaMetni).toBe('Türkiye');
        });

        it('boş metin ile temizleyebilmeli', () => {
            useStore.getState().aramaAyarla('test');
            useStore.getState().aramaAyarla('');
            expect(useStore.getState().aramaMetni).toBe('');
        });
    });

    describe('rehberToggle', () => {
        it('rehberi açabilmeli', () => {
            useStore.getState().rehberToggle(true);
            expect(useStore.getState().rehberAcik).toBe(true);
        });

        it('rehberi kapatabilmeli', () => {
            useStore.getState().rehberToggle(true);
            useStore.getState().rehberToggle(false);
            expect(useStore.getState().rehberAcik).toBe(false);
        });

        it('parametre olmadan toggle edebilmeli', () => {
            useStore.getState().rehberToggle();
            expect(useStore.getState().rehberAcik).toBe(true);
            useStore.getState().rehberToggle();
            expect(useStore.getState().rehberAcik).toBe(false);
        });
    });

    describe('haritaHatasiAyarla', () => {
        it('hata mesajı ayarlayabilmeli', () => {
            useStore.getState().haritaHatasiAyarla('Test hatası');
            expect(useStore.getState().haritaHatasi).toBe('Test hatası');
        });

        it('null ile temizleyebilmeli', () => {
            useStore.getState().haritaHatasiAyarla('Test');
            useStore.getState().haritaHatasiAyarla(null);
            expect(useStore.getState().haritaHatasi).toBeNull();
        });
    });
});
