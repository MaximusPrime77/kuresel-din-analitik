import React, { useMemo, useState, useCallback } from 'react';
import {
    Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LabelList,
} from 'recharts';
import { useStore } from '../store';
import { DIN_RENKLERI } from '../colors';
import { tumUlkeler } from '../data';
import type { SiralamaAlani } from '../types';


/* ─── Ülke Detay: Sadece Bar Grafik (Dinamik Yükseklik) ─── */
const UlkeDetay: React.FC = () => {
    const seciliUlke = useStore((s) => s.seciliUlke);

    if (!seciliUlke) {
        return (
            <div className="grafik-kutusu bos-durum flex-doldur">
                <h3 className="grafik-baslik">
                    📊 Ülke Demografi Detayı
                    <span className="bilgi-ikon" title="Seçtiğiniz lokasyona ait inanç gruplarını ve varsa özel alt-mezheplerini oransal bar olarak analiz eder.">?</span>
                </h3>
                <div className="egitici-bos-mesaj">
                    <div className="bos-animasyon">
                        <span className="bos-dunya">🌍</span>
                        <span className="bos-pulse"></span>
                    </div>
                    <p>Detaylı din analizi ve nüfus oranlarını görmek için <b>harita üzerinden bir ülkeye tıklayın</b> veya <b>tablodan bir satır seçin.</b></p>
                    <div className="bos-ipucu">
                        <span>💡</span> Zoom yaparak küçük ülkelere de odaklanabilirsiniz
                    </div>
                </div>
            </div>
        );
    }

    const veri = seciliUlke.dinler.map((dv) => ({
        isim: dv.din,
        yuzde: dv.yuzde,
        renk: DIN_RENKLERI[dv.din] || '#94A3B8',
    }));

    return (
        <div className="grafik-kutusu secili-ulke-detay flex-doldur">
            <h3 className="grafik-baslik">
                📊 {seciliUlke.ulke}
                <span className="bilgi-ikon" title="Seçtiğiniz lokasyona ait inanç gruplarını ve varsa özel alt-mezheplerini oransal bar olarak analiz eder.">?</span>
                <span className="ulke-nufus-badge">
                    NÜFUS: {seciliUlke.nufus >= 1e6 ? `${(seciliUlke.nufus / 1e6).toFixed(1)}M` : `${(seciliUlke.nufus / 1e3).toFixed(0)}K`}
                </span>
            </h3>

            {/* Sadece Bar Grafik - Tüm alanı dolduracak */}
            <div className="detay-grafikler-tek">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={veri} layout="vertical" margin={{ left: 5, right: 40, top: 10, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 100]} hide axisLine={false} tickLine={false} />
                        <YAxis
                            type="category"
                            dataKey="isim"
                            width={75}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}
                        />
                        {/* Hover'da bar arkasını renklendirir ama tooltip kutusu göstermez */}
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<></>} />
                        <Bar dataKey="yuzde" radius={[0, 4, 4, 0]} maxBarSize={32}>
                            {veri.map((entry, i) => (
                                <Cell key={i} fill={entry.renk} />
                            ))}
                            <LabelList 
                                dataKey="yuzde" 
                                position="right" 
                                formatter={(v: number) => `%${v.toFixed(1)}`} 
                                fill="#f8fafc" 
                                fontSize={12} 
                                fontWeight={700} 
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Mezhep bilgisi */}
            <div className="mezhep-kutulari">
                {seciliUlke.dinler
                    .filter((d) => d.mezhepler && d.mezhepler.length > 0)
                    .map((d) => (
                        <div key={d.din} className="mezhep-detay">
                            <span className="mezhep-detay-baslik">
                                <span className="mezhep-renk-nokta" style={{ backgroundColor: DIN_RENKLERI[d.din] }}></span>
                                {d.din} Mezhepleri:
                            </span>
                            <div className="mezhep-detay-listesi">
                                {d.mezhepler!.map((m) => (
                                    <span key={m.isim} className="mezhep-detay-item">
                                        {m.isim}: <strong>%{m.yuzde}</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>

            <div className="veri-kaynak">
                <span className={`guvenilirlik-badge ${seciliUlke.guvenilirlik}`}>
                    {seciliUlke.guvenilirlik === 'yüksek' ? '🟢' : seciliUlke.guvenilirlik === 'orta' ? '🟡' : '🔴'} {seciliUlke.guvenilirlik}
                </span>
                <span className="kaynak-metin" title={seciliUlke.kaynakReferansi}>{seciliUlke.kaynakReferansi}</span>
            </div>
        </div>
    );
};

/* ─── Ülke Tablosu — Sayfalama + Tıklanabilir Satır (Açılır/Kapanır) ─── */
const SAYFA_BOYUTU = 25;

const UlkeTablosu: React.FC = () => {
    const { seciliDinler, seciliMezhepler, siralama, siralamaAyarla, aramaMetni, ulkeSec, seciliUlke } = useStore();
    const [sayfa, setSayfa] = useState(0);
    // Varsa varsayılan olarak tabloyu açık başlat
    const [tabloAcik, setTabloAcik] = useState(true);

    const filtrelenmisUlkeler = useMemo(() => {
        let sonuc = [...tumUlkeler];

        const aramaKucuk = aramaMetni.toLocaleLowerCase('tr-TR');
        if (aramaKucuk) {
            sonuc = sonuc.filter(u => u.ulke.toLocaleLowerCase('tr-TR').includes(aramaKucuk));
        }

        if (seciliDinler.length > 0) {
            sonuc = sonuc.filter((u) =>
                u.dinler.some((d) => seciliDinler.includes(d.din))
            );
        }

        sonuc.sort((a, b) => {
            const carpan = siralama.yon === 'azalan' ? -1 : 1;
            switch (siralama.alan) {
                case 'ulke':
                    return carpan * a.ulke.localeCompare(b.ulke, 'tr');
                case 'baskinDin':
                    return carpan * a.dinler[0].din.localeCompare(b.dinler[0].din, 'tr');
                case 'yuzde':
                    return carpan * (a.dinler[0].yuzde - b.dinler[0].yuzde);
                case 'nufus':
                    return carpan * (a.nufus - b.nufus);
                case 'veriTipi':
                    return carpan * a.veriTipi.localeCompare(b.veriTipi, 'tr');
                default:
                    return 0;
            }
        });

        return sonuc;
    }, [seciliDinler, seciliMezhepler, siralama, aramaMetni]);

    // Sayfa sıfırlama (filtre değiştiğinde)
    const toplamSayfa = Math.ceil(filtrelenmisUlkeler.length / SAYFA_BOYUTU);
    const sayfaUlkeleri = filtrelenmisUlkeler.slice(sayfa * SAYFA_BOYUTU, (sayfa + 1) * SAYFA_BOYUTU);

    const siralamaDegistir = useCallback((alan: SiralamaAlani) => {
        siralamaAyarla({
            alan,
            yon: siralama.alan === alan && siralama.yon === 'azalan' ? 'artan' : 'azalan',
        });
        setSayfa(0);
    }, [siralama, siralamaAyarla]);

    const siralamaIkon = useCallback((alan: SiralamaAlani) => {
        if (siralama.alan !== alan) return '↕';
        return siralama.yon === 'azalan' ? '↓' : '↑';
    }, [siralama]);

    const satirTikla = useCallback((ulkeKodu: string) => {
        const ulke = tumUlkeler.find(u => u.ulkeKodu === ulkeKodu);
        if (ulke) {
            ulkeSec(seciliUlke?.ulkeKodu === ulkeKodu ? null : ulke);
        }
    }, [ulkeSec, seciliUlke]);

    return (
        <div className={`grafik-kutusu tablo-kutusu accordion-kutu ${tabloAcik ? 'acik' : 'kapali'}`}>
            <h3 
                className="grafik-baslik accordion-baslik" 
                onClick={() => setTabloAcik(!tabloAcik)}
                title={tabloAcik ? "Tabloyu Daralt" : "Tabloyu Genişlet"}
            >
                <div className="accordion-baslik-icerik">
                    <span className="accordion-ikon-sol">{tabloAcik ? '▼' : '▶'}</span>
                    📋 Ülke Tablosu
                </div>
                <span className="tablo-sayac">{filtrelenmisUlkeler.length} ülke</span>
            </h3>

            {tabloAcik && (
                <div className="accordion-detay">
                    <div className="tablo-wrapper" role="region" aria-label="Ülke tablosu">
                        <table className="ulke-tablosu" role="grid">
                            <thead>
                                <tr>
                                    <th onClick={() => siralamaDegistir('ulke')} role="columnheader" aria-sort={siralama.alan === 'ulke' ? (siralama.yon === 'azalan' ? 'descending' : 'ascending') : 'none'}>
                                        Ülke {siralamaIkon('ulke')}
                                    </th>
                                    <th onClick={() => siralamaDegistir('baskinDin')} role="columnheader" aria-sort={siralama.alan === 'baskinDin' ? (siralama.yon === 'azalan' ? 'descending' : 'ascending') : 'none'}>
                                        Baskın Din {siralamaIkon('baskinDin')}
                                    </th>
                                    <th onClick={() => siralamaDegistir('yuzde')} role="columnheader" aria-sort={siralama.alan === 'yuzde' ? (siralama.yon === 'azalan' ? 'descending' : 'ascending') : 'none'}>
                                        % {siralamaIkon('yuzde')}
                                    </th>
                                    <th onClick={() => siralamaDegistir('nufus')} role="columnheader" aria-sort={siralama.alan === 'nufus' ? (siralama.yon === 'azalan' ? 'descending' : 'ascending') : 'none'}>
                                        Nüfus {siralamaIkon('nufus')}
                                    </th>
                                    <th onClick={() => siralamaDegistir('veriTipi')} role="columnheader" aria-sort={siralama.alan === 'veriTipi' ? (siralama.yon === 'azalan' ? 'descending' : 'ascending') : 'none'}>
                                        Veri {siralamaIkon('veriTipi')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sayfaUlkeleri.map((ulke) => {
                                    const baskin = ulke.dinler[0];
                                    const isSecili = seciliUlke?.ulkeKodu === ulke.ulkeKodu;
                                    return (
                                        <tr
                                            key={ulke.ulkeKodu}
                                            className={`tablo-satir ${isSecili ? 'secili' : ''}`}
                                            onClick={() => satirTikla(ulke.ulkeKodu)}
                                            role="row"
                                            tabIndex={0}
                                            aria-selected={isSecili}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    satirTikla(ulke.ulkeKodu);
                                                }
                                            }}
                                        >
                                            <td className="ulke-hucre">{ulke.ulke}</td>
                                            <td>
                                                <span className="tablo-din">
                                                    <span
                                                        className="tablo-din-renk"
                                                        style={{ backgroundColor: DIN_RENKLERI[baskin.din] }}
                                                    />
                                                    {baskin.din}
                                                </span>
                                            </td>
                                            <td className="sayi-hucre">%{baskin.yuzde.toFixed(1)}</td>
                                            <td className="sayi-hucre">
                                                {ulke.nufus >= 1e6
                                                    ? `${(ulke.nufus / 1e6).toFixed(1)}M`
                                                    : `${(ulke.nufus / 1e3).toFixed(0)}K`}
                                            </td>
                                            <td>
                                                <span className={`veri-badge ${ulke.veriTipi === 'Din + Mezhep' ? 'mezhep' : 'sadece'}`}>
                                                    {ulke.veriTipi === 'Din + Mezhep' ? '📖 Mezhep' : '📄 Din'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Sayfalama */}
                    {toplamSayfa > 1 && (
                        <div className="tablo-sayfalama">
                            <button
                                className="sayfalama-btn"
                                onClick={() => setSayfa(p => Math.max(0, p - 1))}
                                disabled={sayfa === 0}
                                aria-label="Önceki sayfa"
                            >
                                ←
                            </button>
                            <span className="sayfalama-bilgi">
                                {sayfa + 1} / {toplamSayfa}
                            </span>
                            <button
                                className="sayfalama-btn"
                                onClick={() => setSayfa(p => Math.min(toplamSayfa - 1, p + 1))}
                                disabled={sayfa >= toplamSayfa - 1}
                                aria-label="Sonraki sayfa"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Ana Panel ─── */
const AnalitikPaneli: React.FC = () => {
    return (
        <aside className="analitik-paneli" aria-label="Analitik paneli">
            <UlkeDetay />
            <UlkeTablosu />
        </aside>
    );
};

export default React.memo(AnalitikPaneli);
