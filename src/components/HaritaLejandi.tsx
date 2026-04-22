import React, { useState } from 'react';
import { useStore } from '../store';
import { DIN_RENKLERI, DIN_LISTESI } from '../colors';
import { tumUlkeler } from '../data';
import { hsl } from 'd3-color';

const HaritaLejandi: React.FC = () => {
    const { seciliDinler } = useStore();
    const [acik, setAcik] = useState(true);

    const gosterilecekDinler = seciliDinler.length > 0 ? seciliDinler : DIN_LISTESI;

    // Her din için ülke sayısı
    const dinIstatistikleri = gosterilecekDinler.map(din => {
        const ulkeSayisi = tumUlkeler.filter(u => u.dinler[0].din === din).length;
        return { din, ulkeSayisi, renk: DIN_RENKLERI[din] };
    });

    // Gradient için renk hesaplama
    const anaRenk = seciliDinler.length === 1 ? DIN_RENKLERI[seciliDinler[0]] : '#3b82f6';
    const baseHsl = hsl(anaRenk);
    const gradientBackground = `linear-gradient(to right, hsl(${baseHsl.h || 218}, 20%, 15%), hsl(${baseHsl.h || 218}, 100%, 60%))`;

    return (
        <div className={`harita-lejand ${acik ? 'acik' : 'kapali'}`}>
            <button
                className="lejand-toggle"
                onClick={() => setAcik(!acik)}
                aria-label={acik ? 'Lejandı kapat' : 'Lejandı aç'}
                aria-expanded={acik}
            >
                <span className="lejand-toggle-ikon">{acik ? '◀' : '▶'}</span>
                {!acik && <span className="lejand-toggle-text">Lejand</span>}
            </button>

            {acik && (
                <div className="lejand-icerik">
                    <div className="lejand-baslik">
                        <span>🎨</span> Din Renk Haritası
                    </div>
                    <div className="lejand-listesi">
                        {dinIstatistikleri.map(({ din, ulkeSayisi, renk }) => (
                            <div key={din} className="lejand-item">
                                <span className="lejand-renk" style={{ backgroundColor: renk }}></span>
                                <span className="lejand-isim">{din}</span>
                                <span className="lejand-sayi">{ulkeSayisi}</span>
                            </div>
                        ))}
                    </div>
                    <div className="lejand-opacity-skala">
                        <span className="skala-label">Nüfus Yoğunluğu:</span>
                        <div className="skala-bar">
                            <span className="skala-dusuk">Az</span>
                            <div className="skala-gradient" style={{ background: gradientBackground }}></div>
                            <span className="skala-yuksek">Çok</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HaritaLejandi);
