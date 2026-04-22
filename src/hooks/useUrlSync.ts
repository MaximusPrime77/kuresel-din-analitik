import { useEffect } from 'react';
import { useStore } from '../store';
import type { DinTuru } from '../types';
import { DIN_LISTESI } from '../colors';
import { tumUlkeler } from '../data';

/**
 * URL ↔ Store senkronizasyon hook'u
 * URL query parametrelerini store ile iki yönlü senkronize eder.
 * 
 * Desteklenen parametreler:
 * - dinler: Virgülle ayrılmış din isimleri
 * - ulke: Ülke kodu (ISO3)
 * - arama: Arama metni
 */
export function useUrlSync() {
    const { seciliDinler, seciliUlke, aramaMetni, dinToggle, ulkeSec, aramaAyarla } = useStore();

    // İlk yüklemede URL'den state'i oku
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // Dinler
        const dinParam = params.get('dinler');
        if (dinParam) {
            const dinler = dinParam.split(',').filter(d => DIN_LISTESI.includes(d as DinTuru)) as DinTuru[];
            dinler.forEach(din => {
                if (!useStore.getState().seciliDinler.includes(din)) {
                    dinToggle(din);
                }
            });
        }

        // Ülke
        const ulkeParam = params.get('ulke');
        if (ulkeParam) {
            const ulke = tumUlkeler.find(u => u.ulkeKodu === ulkeParam);
            if (ulke) ulkeSec(ulke);
        }

        // Arama
        const aramaParam = params.get('arama');
        if (aramaParam) {
            aramaAyarla(aramaParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // State değiştiğinde URL'yi güncelle
    useEffect(() => {
        const params = new URLSearchParams();

        if (seciliDinler.length > 0) {
            params.set('dinler', seciliDinler.join(','));
        }

        if (seciliUlke) {
            params.set('ulke', seciliUlke.ulkeKodu);
        }

        if (aramaMetni) {
            params.set('arama', aramaMetni);
        }

        const yeniUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState(null, '', yeniUrl);
    }, [seciliDinler, seciliUlke, aramaMetni]);
}
