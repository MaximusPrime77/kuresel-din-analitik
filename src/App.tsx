import { useEffect } from 'react';
import HaritaGrafigi from './components/HaritaGrafigi';
import HaritaLejandi from './components/HaritaLejandi';
import FiltrePaneli from './components/FiltrePaneli';
import AnalitikPaneli from './components/AnalitikPaneli';
import KpiKartlari from './components/KpiKartlari';
import Ipucu from './components/Ipucu';
import EgitimRehberi from './components/EgitimRehberi';
import VeriKaynaklari from './components/VeriKaynaklari';
import { useStore } from './store';
import { tumUlkeler } from './data';

function App() {
  const ulkeleriAyarla = useStore((s) => s.ulkeleriAyarla);
  const rehberToggle = useStore((s) => s.rehberToggle);
  const veriKaynaklariToggle = useStore((s) => s.veriKaynaklariToggle);

  useEffect(() => {
    ulkeleriAyarla(tumUlkeler);
  }, [ulkeleriAyarla]);

  return (
    <div className="uygulama">
      <header className="baslik-cubugu" role="banner">
        <div className="baslik-sol">
          <div className="baslik-ust-grup">
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-ring"></span>
            </div>
            <h1 className="ana-baslik">Küresel Din Analitiği</h1>
          </div>
          <p className="alt-baslik">
            İnanç Dağılımları ve Demografik Veri Dashboard'u
          </p>
        </div>

        <KpiKartlari />

        <div className="baslik-sag">
          <button
            className="rehber-buton"
            onClick={() => veriKaynaklariToggle(true)}
            title="Veri Kaynaklarını Görüntüle"
            aria-label="Veri kaynaklarını görüntüle"
          >
            📊 Veri Kaynakları
          </button>
          <button
            className="rehber-buton"
            onClick={() => rehberToggle(true)}
            title="Eğitim Rehberini Aç"
            aria-label="Platform eğitim rehberini aç"
          >
            📖 Nasıl Kullanılır?
          </button>
        </div>
      </header>

      <main className="ana-icerik">
        <FiltrePaneli />
        <section className="harita-alani" aria-label="Dünya haritası görselleştirmesi">
          <HaritaGrafigi />
          <HaritaLejandi />
        </section>
        <AnalitikPaneli />
      </main>

      <Ipucu />
      <EgitimRehberi />
      <VeriKaynaklari />
    </div>
  );
}

export default App;
