import React, { useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { DIN_RENKLERI, DIN_LISTESI, MEZHEP_HARITASI } from '../colors';
import { tumUlkeler } from '../data';


const FiltrePaneli: React.FC = () => {
    const { seciliDinler, seciliMezhepler, dinToggle, mezhepToggle, seciliUlke, ulkeSec } = useStore();

    // Canlı İstatistik Hesaplamaları
    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        DIN_LISTESI.forEach(din => {
            counts[din] = tumUlkeler.filter(u => u.dinler[0].din === din).length;
        });

        let toplamNufus = 0;
        let toplamUlke = 0;

        if (seciliDinler.length > 0) {
            const filtrelenmis = tumUlkeler.filter(u =>
                u.dinler.some(d => seciliDinler.includes(d.din))
            );
            toplamNufus = filtrelenmis.reduce((acc, curr) => acc + curr.nufus, 0);
            toplamUlke = filtrelenmis.length;
        }

        return { counts, toplamNufus, toplamUlke };
    }, [seciliDinler]);

    const dinIkonGetir = useCallback((din: string) => {
        switch (din) {
            case 'İslam': return '🌙';
            case 'Hristiyanlık': return '✝️';
            case 'Yahudilik': return '🔯';
            case 'Budizm': return '☸️';
            case 'Hinduizm': return '🕉️';
            case 'Dinsiz': return '⚛️';
            case 'Geleneksel/Animist': return '🌿';
            case 'Sih': return '🪬';
            default: return '✨';
        }
    }, []);



    const tumunuSifirla = useCallback(() => {
        seciliDinler.forEach(d => dinToggle(d));
        ulkeSec(null);
    }, [seciliDinler, dinToggle, ulkeSec]);

    return (
        <aside className="filtre-paneli" aria-label="Filtre paneli">
            <div className="panel-ust">
                <div className="panel-baslik">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <h2>Analitik Kontrol Merkezi</h2>
                </div>
                {(seciliDinler.length > 0 || seciliUlke) && (
                    <button
                        className="hizli-sifirla"
                        onClick={tumunuSifirla}
                        aria-label="Tüm filtreleri sıfırla"
                    >
                        ✕ Sıfırla
                    </button>
                )}
            </div>

            <div className="filtre-scroll-alan">
                {/* 📍 ÜLKE SEÇİMİ */}
                <div className="filtre-seksiyon">
                    <div className="seksiyon-baslik">
                        <span>📍</span> ÜLKE SEÇİMİ
                    </div>
                    <div className="arama-kutusu-wrapper">
                        <select
                            className="ulke-select"
                            value={seciliUlke?.ulkeKodu || ''}
                            onChange={(e) => {
                                const kod = e.target.value;
                                const hedef = tumUlkeler.find(u => u.ulkeKodu === kod);
                                ulkeSec(hedef || null);
                            }}
                            aria-label="Ülke seçin"
                        >
                            <option value="">🌍 Ülke Seçin...</option>
                            {[...tumUlkeler].sort((a, b) => a.ulke.localeCompare(b.ulke, 'tr')).map(u => (
                                <option key={u.ulkeKodu} value={u.ulkeKodu}>
                                    {u.ulke}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 📊 İNANÇ GRUPLARI */}
                <div className="filtre-seksiyon">
                    <div className="seksiyon-baslik">
                        <span>📊</span> İNANÇ DEMOGRAFİSİ
                    </div>
                    <div className="din-kart-grid" role="group" aria-label="Din filtreleri">
                        {DIN_LISTESI.map((din) => {
                            const secili = seciliDinler.includes(din);
                            const renk = DIN_RENKLERI[din];
                            const ulkeSayisi = stats.counts[din] || 0;
                            const mezhepListesi = MEZHEP_HARITASI[din];

                            return (
                                <div 
                                    key={din} 
                                    className={`din-kart-wrapper ${secili ? 'aktif' : ''}`}
                                    style={{ '--din-accent-color': renk } as React.CSSProperties}
                                >
                                    <button
                                        className="din-kart"
                                        onClick={() => dinToggle(din)}
                                        style={secili ? { borderLeft: `4px solid ${renk}` } : undefined}
                                        aria-pressed={secili}
                                        aria-label={`${din} — ${ulkeSayisi} ülkede baskın`}
                                    >
                                        <div className="din-kart-sol">
                                            <span className="din-ikon-micro">{dinIkonGetir(din)}</span>
                                            <div className="din-kart-metin">
                                                <span className="din-kart-adi">{din}</span>
                                                <span className="din-kart-alt">{ulkeSayisi} Ülkede Baskın</span>
                                            </div>
                                        </div>
                                        {secili && <span className="kart-check">✓</span>}
                                    </button>

                                    {secili && mezhepListesi && (
                                        <div className="mezhep-listesi-v26" role="group" aria-label={`${din} mezhepleri`}>
                                            {mezhepListesi.map((mezhep) => {
                                                const mezhepSecili = seciliMezhepler[din]?.includes(mezhep);
                                                return (
                                                    <button
                                                        key={mezhep}
                                                        className={`mezhep-pill ${mezhepSecili ? 'secili' : ''}`}
                                                        onClick={() => mezhepToggle(din, mezhep)}
                                                        style={mezhepSecili ? { backgroundColor: `${renk}30`, borderColor: renk } : undefined}
                                                        aria-pressed={mezhepSecili || false}
                                                    >
                                                        {mezhep}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 📉 ANALİTİK ÖZET */}
            <div className="analitik-ozet-panel">
                <div className="ozet-satir">
                    <span className="ozet-label">Kapsanan Nüfus:</span>
                    <span className="ozet-deger">
                        {stats.toplamNufus > 0 ? (stats.toplamNufus / 1e9).toFixed(2) + ' Milyar' : 'Seçim Yapılmadı'}
                    </span>
                </div>
                <div className="ozet-satir">
                    <span className="ozet-label">Ülke Sayısı:</span>
                    <span className="ozet-deger">{stats.toplamUlke} Ülke</span>
                </div>
                <div className="ozet-progress-bg" role="progressbar" aria-valuenow={stats.toplamUlke} aria-valuemax={179}>
                    <div
                        className="ozet-progress-bar"
                        style={{ width: `${Math.min(100, (stats.toplamUlke / 179) * 100)}%` }}
                    />
                </div>
            </div>
        </aside>
    );
};

export default React.memo(FiltrePaneli);
