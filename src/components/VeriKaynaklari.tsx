import React, { useEffect } from 'react';
import { useStore } from '../store';

const VeriKaynaklari: React.FC = () => {
    const { veriKaynaklariAcik, veriKaynaklariToggle } = useStore();

    // ESC tuşu ile kapatma
    useEffect(() => {
        if (!veriKaynaklariAcik) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') veriKaynaklariToggle(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [veriKaynaklariAcik, veriKaynaklariToggle]);

    if (!veriKaynaklariAcik) return null;

    return (
        <div className="modal-backdrop" onClick={() => veriKaynaklariToggle(false)}>
            <div
                className="modal-kutu"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="kaynaklar-baslik"
            >
                <div className="modal-baslik">
                    <h2 id="kaynaklar-baslik">📊 Veri Kaynakları ve Doğruluk</h2>
                    <button
                        className="modal-kapat"
                        onClick={() => veriKaynaklariToggle(false)}
                        aria-label="Pencereyi kapat"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-icerik">
                    <section className="rehber-bolum">
                        <h3 style={{ color: 'var(--renk-vurgu)', marginBottom: '12px' }}>Ana Veri Kaynakları</h3>
                        <p>
                            Bu platformdaki veriler, uluslararası alanda kabul gören ve düzenli olarak güncellenen bağımsız araştırma kuruluşlarının raporlarına dayanmaktadır:
                        </p>
                        <ul style={{ marginTop: '10px' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>Pew Research Center:</strong> Küresel inanç eğilimleri, din demografisi ve nüfus projeksiyonları alanında referans kabul edilen başlıca kaynak.
                            </li>
                            <li>
                                <strong>CIA World Factbook:</strong> Ülkelerin güncel demografik yapısı, nüfus dağılımı ve coğrafi-politik istatistikleri için kullanılan temel veritabanı.
                            </li>
                        </ul>
                    </section>

                    <section className="rehber-bolum" style={{ marginTop: '24px' }}>
                        <h3 style={{ color: 'var(--renk-vurgu)', marginBottom: '12px' }}>Güvenilirlik Seviyeleri</h3>
                        <p>
                            Uygulamanın veritabanında her ülke için özel bir "Güvenilirlik Seviyesi" takip edilmektedir:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                                <h4 style={{ color: '#10b981', marginBottom: '5px' }}>🟢 Yüksek Güvenilirlik</h4>
                                <p style={{ fontSize: '0.9rem' }}>Gelişmiş ülkeler ve düzenli nüfus sayımı yapan, şeffaf istatistikler yayınlayan bölgeler.</p>
                            </div>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '5px' }}>🟡 Orta / Düşük</h4>
                                <p style={{ fontSize: '0.9rem' }}>Çatışma bölgeleri, kapalı rejimler ve yoğun göç alan bölgelerdeki tahmini veriler.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rehber-bolum" style={{ marginTop: '24px' }}>
                        <h3 style={{ color: 'var(--renk-vurgu)', marginBottom: '12px' }}>İstatistiksel Sınırlar</h3>
                        <p>
                            İnanç verileri kişisel beyanlara dayandığı için kesin matematiksel sonuçlardan çok, <strong>"en makul tahminleri ve küresel eğilimleri"</strong> göstermek amacıyla derlenmiştir.
                        </p>
                    </section>
                </div>
                <div className="modal-alt">
                    <button className="modal-basla-btn" onClick={() => veriKaynaklariToggle(false)}>Anladım</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(VeriKaynaklari);
