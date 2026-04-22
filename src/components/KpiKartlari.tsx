import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';
import { tumUlkeler } from '../data';

/* ─── Animasyonlu Sayı Bileşeni ─── */
interface AnimasyonluSayiProps {
    hedef: number;
    format: (n: number) => string;
    sure?: number;
}

const AnimasyonluSayi: React.FC<AnimasyonluSayiProps> = ({
    hedef,
    format,
    sure = 600,
}) => {
    const [gosterilen, setGosterilen] = useState(hedef);
    const oncekiRef = useRef(hedef);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const baslangic = oncekiRef.current;
        const fark = hedef - baslangic;
        if (Math.abs(fark) < 0.001) return;

        const baslamaZamani = performance.now();

        const animate = (zaman: number) => {
            const gecen = zaman - baslamaZamani;
            const ilerleme = Math.min(gecen / sure, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - ilerleme, 3);
            const mevcutDeger = baslangic + fark * eased;

            setGosterilen(mevcutDeger);

            if (ilerleme < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                oncekiRef.current = hedef;
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [hedef, sure]);

    return <span className="p-kpi-value">{format(gosterilen)}</span>;
};

const KpiKartlari: React.FC = () => {
    const { seciliDinler, seciliMezhepler, aramaMetni } = useStore();

    const metrikler = useMemo(() => {
        let kapsananNufus = 0;
        const aramaKucuk = aramaMetni.toLocaleLowerCase('tr-TR');

        tumUlkeler.forEach((ulke) => {
            if (aramaKucuk && !ulke.ulke.toLocaleLowerCase('tr-TR').includes(aramaKucuk)) {
                return;
            }

            let ulkedeOlanNufus = 0;
            let ulkeEtkilendimi = false;

            if (seciliDinler.length === 0) {
                ulkedeOlanNufus = ulke.nufus;
                ulkeEtkilendimi = true;
            } else {
                for (const dv of ulke.dinler) {
                    if (!seciliDinler.includes(dv.din)) continue;

                    const mezhepFiltresi = seciliMezhepler[dv.din];
                    if (mezhepFiltresi && mezhepFiltresi.length > 0 && dv.mezhepler) {
                        const mYuzdeToplami = dv.mezhepler
                            .filter(m => mezhepFiltresi.includes(m.isim))
                            .reduce((t, m) => t + m.yuzde, 0);

                        ulkedeOlanNufus += (mYuzdeToplami / 100) * ulke.nufus;
                        if (mYuzdeToplami > 0) ulkeEtkilendimi = true;
                    } else {
                        ulkedeOlanNufus += (dv.yuzde / 100) * ulke.nufus;
                        if (dv.yuzde > 0) ulkeEtkilendimi = true;
                    }
                }
            }

            if (ulkeEtkilendimi) {
                kapsananNufus += ulkedeOlanNufus;
            }
        });

        return {
            nufusRaw: kapsananNufus,
        };

    }, [seciliDinler, seciliMezhepler, aramaMetni]);

    const nufusFormat = useCallback((n: number) => {
        if (n >= 1e9) return `${(n / 1e9).toFixed(2)} Milyar`;
        if (n >= 1e6) return `${(n / 1e6).toFixed(1)} Milyon`;
        return Math.round(n).toString();
    }, []);

    return (
        <div className="premium-kpi-wrapper" role="region" aria-label="Ana metrikler">
            {/* Analiz Edilen Nüfus Kartı */}
            <div className="premium-kpi-box" title="Haritadaki toplam inanan sayısı (Filtrelere göre)">
                <div className="p-kpi-icon">👥</div>
                <div className="p-kpi-content">
                    <span className="p-kpi-label">Analiz Edilen Nüfus</span>
                    <div className="p-kpi-value-group">
                        <AnimasyonluSayi hedef={metrikler.nufusRaw} format={nufusFormat} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(KpiKartlari);
