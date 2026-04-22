import { describe, it, expect } from 'vitest';
import { NUMID_TO_ISO3, ulkeyiBul } from '../utils/countryMapping';
import { tumUlkeler, ulkeKoduHaritasi } from '../data';

describe('countryMapping', () => {
    describe('NUMID_TO_ISO3', () => {
        it('Türkiye için doğru ISO3 kodu döndürmeli', () => {
            expect(NUMID_TO_ISO3['792']).toBe('TUR');
        });

        it('ABD için doğru ISO3 kodu döndürmeli', () => {
            expect(NUMID_TO_ISO3['840']).toBe('USA');
        });

        it('olmayan ID için undefined döndürmeli', () => {
            expect(NUMID_TO_ISO3['999999']).toBeUndefined();
        });
    });

    describe('ulkeyiBul', () => {
        it('geçerli numericId ile ülke bulabilmeli', () => {
            const ulke = ulkeyiBul('792', ulkeKoduHaritasi);
            expect(ulke).toBeDefined();
            expect(ulke?.ulke).toBe('Türkiye');
        });

        it('geçersiz numericId için undefined döndürmeli', () => {
            const ulke = ulkeyiBul('999999', ulkeKoduHaritasi);
            expect(ulke).toBeUndefined();
        });

        it('boş string için undefined döndürmeli', () => {
            const ulke = ulkeyiBul('', ulkeKoduHaritasi);
            expect(ulke).toBeUndefined();
        });
    });

    describe('Veri Bütünlüğü', () => {
        it('tüm ülkelerin geçerli ulkeKodu olmalı', () => {
            tumUlkeler.forEach(ulke => {
                expect(ulke.ulkeKodu).toBeDefined();
                expect(ulke.ulkeKodu.length).toBe(3);
            });
        });

        it('tüm ülkelerin en az bir dini olmalı', () => {
            tumUlkeler.forEach(ulke => {
                expect(ulke.dinler.length).toBeGreaterThan(0);
            });
        });

        it('tüm dinlerin yüzde toplamı 95-105 arasında olmalı', () => {
            tumUlkeler.forEach(ulke => {
                const toplam = ulke.dinler.reduce((acc, d) => acc + d.yuzde, 0);
                expect(toplam).toBeGreaterThanOrEqual(95);
                expect(toplam).toBeLessThanOrEqual(105);
            });
        });

        it('ülke sayısı 100\'den fazla olmalı', () => {
            expect(tumUlkeler.length).toBeGreaterThan(100);
        });

        it('ulkeKoduHaritasi tüm ülkeleri içermeli', () => {
            tumUlkeler.forEach(ulke => {
                expect(ulkeKoduHaritasi[ulke.ulkeKodu]).toBeDefined();
            });
        });
    });
});
