import React, { useState, useCallback } from 'react';
import { useStore } from '../store';
import { tumUlkeler } from '../data';

const VeriExport: React.FC = () => {
    const { seciliDinler, aramaMetni } = useStore();
    const [acik, setAcik] = useState(false);
    const [exportEdildi, setExportEdildi] = useState<string | null>(null);

    const filtrelenmisVeri = useCallback(() => {
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

        return sonuc;
    }, [seciliDinler, aramaMetni]);

    const csvExport = useCallback(() => {
        const veri = filtrelenmisVeri();
        const baslik = 'Ülke,Ülke Kodu,Nüfus,Baskın Din,Baskın Din %,Veri Tipi,Güvenilirlik,Kaynak\n';
        const satirlar = veri.map(u => {
            const baskin = u.dinler[0];
            return `"${u.ulke}","${u.ulkeKodu}",${u.nufus},"${baskin.din}",${baskin.yuzde},"${u.veriTipi}","${u.guvenilirlik}","${u.kaynakReferansi}"`;
        }).join('\n');

        const blob = new Blob(['\uFEFF' + baslik + satirlar], { type: 'text/csv;charset=utf-8;' });
        indir(blob, 'kuresel-din-analitik.csv');
        setExportEdildi('CSV');
        setTimeout(() => setExportEdildi(null), 2000);
    }, [filtrelenmisVeri]);

    const jsonExport = useCallback(() => {
        const veri = filtrelenmisVeri();
        const json = JSON.stringify(veri, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        indir(blob, 'kuresel-din-analitik.json');
        setExportEdildi('JSON');
        setTimeout(() => setExportEdildi(null), 2000);
    }, [filtrelenmisVeri]);

    const indir = (blob: Blob, dosyaAdi: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = dosyaAdi;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const linkPaylas = useCallback(() => {
        const params = new URLSearchParams();
        if (seciliDinler.length > 0) params.set('dinler', seciliDinler.join(','));
        if (aramaMetni) params.set('arama', aramaMetni);

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => {
            setExportEdildi('Link kopyalandı!');
            setTimeout(() => setExportEdildi(null), 2000);
        });
    }, [seciliDinler, aramaMetni]);

    if (!acik) {
        return (
            <button
                className="export-fab"
                onClick={() => setAcik(true)}
                title="Veri Dışa Aktar"
                aria-label="Veri dışa aktarma menüsünü aç"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            </button>
        );
    }

    return (
        <div className="export-panel" role="dialog" aria-label="Veri dışa aktarma">
            <div className="export-baslik">
                <h3>📤 Veri Dışa Aktar</h3>
                <button className="export-kapat" onClick={() => setAcik(false)} aria-label="Kapat">✕</button>
            </div>

            <p className="export-aciklama">
                {filtrelenmisVeri().length} ülke verisi dışa aktarılacak
            </p>

            <div className="export-butonlar">
                <button className="export-btn csv" onClick={csvExport}>
                    <span className="export-btn-ikon">📄</span>
                    <span className="export-btn-metin">
                        <strong>CSV</strong>
                        <small>Excel uyumlu</small>
                    </span>
                </button>

                <button className="export-btn json" onClick={jsonExport}>
                    <span className="export-btn-ikon">🔧</span>
                    <span className="export-btn-metin">
                        <strong>JSON</strong>
                        <small>Geliştirici formatı</small>
                    </span>
                </button>

                <button className="export-btn link" onClick={linkPaylas}>
                    <span className="export-btn-ikon">🔗</span>
                    <span className="export-btn-metin">
                        <strong>Link Paylaş</strong>
                        <small>Filtreleri paylaş</small>
                    </span>
                </button>
            </div>

            {exportEdildi && (
                <div className="export-basari">
                    ✅ {exportEdildi} başarıyla aktarıldı!
                </div>
            )}
        </div>
    );
};

export default React.memo(VeriExport);
