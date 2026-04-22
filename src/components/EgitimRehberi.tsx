import React, { useEffect, useCallback } from 'react';
import { useStore } from '../store';

const EgitimRehberi: React.FC = () => {
    const rehberAcik = useStore((s) => s.rehberAcik);
    const rehberToggle = useStore((s) => s.rehberToggle);

    useEffect(() => {
        // Sadece ilk ziyarette göster
        const rehberGoruldu = localStorage.getItem('rehberGoruldu');
        if (!rehberGoruldu) {
            rehberToggle(true);
        }
    }, [rehberToggle]);

    const kapat = useCallback(() => {
        localStorage.setItem('rehberGoruldu', 'true');
        rehberToggle(false);
    }, [rehberToggle]);

    // ESC tuşu ile kapatma
    useEffect(() => {
        if (!rehberAcik) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') kapat();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [rehberAcik, kapat]);

    if (!rehberAcik) return null;

    return (
        <div
            className="modal-backdrop"
            onClick={kapat}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rehber-baslik"
        >
            <div className="modal-kutu" onClick={e => e.stopPropagation()}>
                <div className="modal-baslik">
                    <h2 id="rehber-baslik">📖 Platform Eğitim Rehberi</h2>
                    <button
                        className="modal-kapat"
                        onClick={kapat}
                        aria-label="Rehberi kapat"
                        autoFocus
                    >
                        ✕
                    </button>
                </div>
                <div className="modal-icerik">
                    <p className="modal-giris">
                        Dünya genelindeki inanç ve demografi dağılımlarını interaktif olarak keşfetmeye hoş geldiniz! 
                        Uygulama tamamen güncel verilerle yenilenmiş olup, en verimli kullanım için şu adımları izleyebilirsiniz:
                    </p>

                    <div className="rehber-adim">
                        <div className="adim-sayi">1</div>
                        <div className="adim-metin">
                            <h3>Analitik Kontrol Merkezi (Sol Panel)</h3>
                            <p><b>Ülke Seçimi:</b> İstediğiniz ülkeye hızlıca odaklanmak için listeden seçim yapabilirsiniz. <br/>
                               <b>İnanç Demografisi:</b> Dinleri seçerek haritayı renklendirebilir, seçtiğiniz dinin altındaki <b>Mezhepler</b> butonuyla analizinizi derinleştirebilirsiniz.</p>
                        </div>
                    </div>

                    <div className="rehber-adim">
                        <div className="adim-sayi">2</div>
                        <div className="adim-metin">
                            <h3>İnteraktif Harita Keşfi</h3>
                            <p>Harita üzerinde farenizle serbestçe gezinebilir ve <b>15x'e kadar</b> yakınlaşabilirsiniz. Yakınlaştıkça ülke isimleri otomatik olarak belirecektir. Renk tonları, o inancın o ülkedeki <b>nüfus yoğunluğunu</b> temsil eder.</p>
                        </div>
                    </div>

                    <div className="rehber-adim">
                        <div className="adim-sayi">3</div>
                        <div className="adim-metin">
                            <h3>Anlık Metrikler ve Analiz</h3>
                            <p>Üst merkezdeki <b>Analiz Edilen Nüfus</b> kartı, yaptığınız filtrelere uyan toplam kişi sayısını anlık hesaplar. Sağ taraftaki <b>Analitik Paneli</b> ise seçili ülkenin (veya dünyanın) detaylı dağılım grafiklerini sunar.</p>
                        </div>
                    </div>

                    <div className="rehber-adim">
                        <div className="adim-sayi">4</div>
                        <div className="adim-metin">
                            <h3>Veri Şeffaflığı ve Kaynaklar</h3>
                            <p>Sağ üstteki <b>Veri Kaynakları</b> butonuyla istatistiklerin kökenini, kullanılan metotları ve verilerin güvenilirlik seviyelerini detaylıca inceleyebilirsiniz.</p>
                        </div>
                    </div>
                </div>
                <div className="modal-alt">
                    <button className="modal-basla-btn" onClick={kapat}>Verileri Keşfetmeye Başla →</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(EgitimRehberi);
