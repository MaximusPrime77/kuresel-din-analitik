import React, { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { DIN_RENKLERI } from '../colors';

const Ipucu: React.FC = () => {
    const ipucuVerisi = useStore((s) => s.ipucuVerisi);
    const ipucuRef = useRef<HTMLDivElement>(null);

    // Viewport sınır kontrolü
    useEffect(() => {
        if (!ipucuVerisi || !ipucuRef.current) return;
        const el = ipucuRef.current;
        const rect = el.getBoundingClientRect();
        const padding = 12;

        let adjustedLeft = ipucuVerisi.x + 15;
        let adjustedTop = ipucuVerisi.y - 10;

        // Sağ kenar taşması
        if (adjustedLeft + rect.width + padding > window.innerWidth) {
            adjustedLeft = ipucuVerisi.x - rect.width - 15;
        }

        // Alt kenar taşması
        if (adjustedTop + rect.height + padding > window.innerHeight) {
            adjustedTop = window.innerHeight - rect.height - padding;
        }

        // Üst kenar taşması
        if (adjustedTop < padding) {
            adjustedTop = padding;
        }

        // Sol kenar taşması
        if (adjustedLeft < padding) {
            adjustedLeft = padding;
        }

        el.style.left = `${adjustedLeft}px`;
        el.style.top = `${adjustedTop}px`;
    }, [ipucuVerisi]);

    if (!ipucuVerisi) return null;

    const { ulke, x, y } = ipucuVerisi;

    return (
        <div
            ref={ipucuRef}
            className="ipucu"
            role="tooltip"
            aria-live="polite"
            style={{
                left: x + 15,
                top: y - 10,
            }}
        >
            <div className="ipucu-baslik">{ulke.ulke}</div>
            <div className="ipucu-icerik">
                {ulke.dinler.slice(0, 4).map((din) => (
                    <div className="ipucu-satir" key={din.din}>
                        <span
                            className="ipucu-renk"
                            style={{ backgroundColor: DIN_RENKLERI[din.din] }}
                        />
                        <span className="ipucu-din">{din.din}</span>
                        <span className="ipucu-yuzde">%{din.yuzde.toFixed(1)}</span>
                    </div>
                ))}
                <div className="ipucu-nufus">
                    Nüfus: {ulke.nufus.toLocaleString('tr-TR')}
                </div>
                <div className="ipucu-guvenilirlik">
                    {ulke.guvenilirlik === 'yüksek' ? '🟢' : ulke.guvenilirlik === 'orta' ? '🟡' : '🔴'} {ulke.guvenilirlik} güvenilirlik
                </div>
                <div className="ipucu-kaynak">{ulke.kaynakReferansi}</div>
            </div>
        </div>
    );
};

export default React.memo(Ipucu);
