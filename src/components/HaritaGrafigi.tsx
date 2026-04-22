import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { geoEqualEarth, geoPath, geoCentroid } from 'd3-geo';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';
import type { ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import { hsl } from 'd3-color';
import { scalePow } from 'd3-scale';
import type { GeoPermissibleObjects } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useStore } from '../store';
import { DIN_RENKLERI } from '../colors';
import { ulkeKoduHaritasi } from '../data';
import { ulkeyiBul } from '../utils/countryMapping';
import type { Ulke } from '../types';

interface TopoFeature {
    type: string;
    id: string;
    properties: { name: string };
    geometry: GeoPermissibleObjects;
}

const HaritaGrafigi: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const zoomScaleRef = useRef(1);

    const [topoData, setTopoData] = useState<TopoFeature[]>([]);
    const [boyutlar, setBoyutlar] = useState({ genislik: 960, yukseklik: 500 });
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [, setLabelGuncel] = useState(0); // Label re-render tetikleyici
    const [yukleniyor, setYukleniyor] = useState(true);

    const { seciliDinler, seciliMezhepler, ulkeSec, seciliUlke, ipucuGoster, ipucuGizle, aramaMetni, haritaHatasi, haritaHatasiAyarla } = useStore();

    // TopoJSON veri yükleme — hata yönetimi ile
    useEffect(() => {
        setYukleniyor(true);
        haritaHatasiAyarla(null);

        fetch('/countries-110m.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}: Harita verisi yüklenemedi`);
                return r.json();
            })
            .then((topo: Topology) => {
                const countries = topojson.feature(
                    topo,
                    topo.objects.countries as GeometryCollection
                );
                setTopoData((countries as unknown as { features: TopoFeature[] }).features);
                setYukleniyor(false);
            })
            .catch((hata) => {
                console.error('Harita yükleme hatası:', hata);
                haritaHatasiAyarla(hata.message || 'Harita verisi yüklenirken bir hata oluştu');
                setYukleniyor(false);
            });
    }, [haritaHatasiAyarla]);

    // ResizeObserver
    useEffect(() => {
        if (!svgRef.current) return;
        const svgElement = svgRef.current;
        const parent = svgElement.parentElement;
        if (!parent) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setBoyutlar({ genislik: width, yukseklik: Math.max(height, 400) });
                }
            }
        });

        resizeObserver.observe(parent);
        return () => resizeObserver.disconnect();
    }, []);

    // D3 Zoom davranışı
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;

        const svg = select<SVGSVGElement, unknown>(svgRef.current);
        const g = select<SVGGElement, unknown>(gRef.current);

        let labelTimeout: ReturnType<typeof setTimeout>;

        const zoomBehavior = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 15])
            .translateExtent([[0, 0], [boyutlar.genislik, boyutlar.yukseklik]])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                zoomScaleRef.current = event.transform.k;

                // Label güncellemesini debounce et (performans)
                clearTimeout(labelTimeout);
                labelTimeout = setTimeout(() => {
                    setLabelGuncel(prev => prev + 1);
                }, 100);
            });

        svg.call(zoomBehavior)
            .on('dblclick.zoom', null);

        zoomRef.current = zoomBehavior;

        return () => {
            svg.on('.zoom', null);
            clearTimeout(labelTimeout);
        };
    }, [boyutlar.genislik, boyutlar.yukseklik, topoData]);

    // Transform koruma
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const currentTransform = zoomTransform(svgRef.current);
        select(gRef.current).attr('transform', currentTransform.toString());
    });

    const projeksiyon = useMemo(() => {
        return geoEqualEarth()
            .fitSize([boyutlar.genislik, boyutlar.yukseklik], {
                type: 'FeatureCollection',
                features: topoData as unknown as GeoJSON.Feature[],
            });
    }, [boyutlar, topoData]);

    const yolCizici = useMemo(() => geoPath().projection(projeksiyon), [projeksiyon]);

    // SVG path'lerini memoize et
    const pathCache = useMemo(() => {
        const cache = new Map<string, string>();
        topoData.forEach((feature) => {
            const d = yolCizici(feature.geometry as GeoPermissibleObjects) || '';
            cache.set(feature.id, d);
        });
        return cache;
    }, [topoData, yolCizici]);

    // Otomatik odaklama & zoom stabilizasyonu
    useEffect(() => {
        if (!seciliUlke || !svgRef.current || !zoomRef.current || topoData.length === 0) return;

        const feature = topoData.find(f => {
            const u = ulkeyiBul(f.id, ulkeKoduHaritasi);
            return u?.ulkeKodu === seciliUlke.ulkeKodu;
        });

        if (feature) {
            const centroid = geoCentroid(feature.geometry as GeoPermissibleObjects);
            const [x, y] = projeksiyon(centroid) || [0, 0];

            let targetScale = 2.5;
            if (seciliUlke.nufus < 1e6) targetScale = 5;
            else if (seciliUlke.nufus < 10e6) targetScale = 3.5;
            else if (seciliUlke.nufus > 150e6) targetScale = 1.8;

            const newTransform = zoomIdentity
                .translate(boyutlar.genislik / 2, boyutlar.yukseklik / 2)
                .scale(targetScale)
                .translate(-x, -y);

            select(svgRef.current)
                .transition()
                .duration(1000)
                .call(zoomRef.current.transform, newTransform);

            zoomScaleRef.current = targetScale;
            setTimeout(() => setLabelGuncel(prev => prev + 1), 1050);
        }
    }, [seciliUlke, topoData, boyutlar.genislik, boyutlar.yukseklik, projeksiyon]);

    const handleZoomIn = useCallback(() => {
        if (svgRef.current && zoomRef.current) {
            zoomRef.current.scaleBy(select(svgRef.current).transition().duration(250), 1.4);
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (svgRef.current && zoomRef.current) {
            zoomRef.current.scaleBy(select(svgRef.current).transition().duration(250), 1 / 1.4);
        }
    }, []);

    const handleZoomReset = useCallback(() => {
        if (svgRef.current && zoomRef.current) {
            select(svgRef.current)
                .transition()
                .duration(500)
                .call(zoomRef.current.transform, zoomIdentity);
            zoomScaleRef.current = 1;
            setTimeout(() => setLabelGuncel(prev => prev + 1), 550);
        }
    }, []);

    // Renk hesaplama — memoize edilmiş cache
    const renkCache = useMemo(() => {
        const cache = new Map<string, { fill: string; opacity: number; isPassive: boolean }>();

        topoData.forEach((feature) => {
            const ulke = ulkeyiBul(feature.id, ulkeKoduHaritasi);
            if (!ulke || ulke.dinler.length === 0) {
                cache.set(feature.id, { fill: '#0f172a', opacity: 0.1, isPassive: true });
                return;
            }

            // Arama Kontrolü
            const aramaKucuk = aramaMetni.toLocaleLowerCase('tr-TR');
            if (aramaKucuk && !ulke.ulke.toLocaleLowerCase('tr-TR').includes(aramaKucuk)) {
                cache.set(feature.id, { fill: '#0f172a', opacity: 0.1, isPassive: true });
                return;
            }

            if (seciliDinler.length === 0) {
                const baskinDin = ulke.dinler[0];
                const seciliRenk = DIN_RENKLERI[baskinDin.din] || '#94A3B8';
                
                // HSL tabanlı dinamik skala
                const oran = baskinDin.yuzde / 100;
                const scaleValue = scalePow().exponent(0.5).domain([0, 1]).range([0, 1])(oran);
                const baseColor = hsl(seciliRenk);
                
                const targetL = baseColor.l;
                const minL = 0.12; 
                const finalL = minL + scaleValue * (targetL - minL);
                
                const targetS = baseColor.s;
                const minS = targetS * 0.3;
                const finalS = minS + scaleValue * (targetS - minS);

                const finalColor = hsl(baseColor.h, finalS, finalL).formatHex();

                cache.set(feature.id, { fill: finalColor, opacity: 1, isPassive: false });
                return;
            }

            let enYuksekYuzde = 0;
            let seciliRenk = '#0f172a';

            for (const dinVerisi of ulke.dinler) {
                if (!seciliDinler.includes(dinVerisi.din)) continue;

                const mezhepFiltresi = seciliMezhepler[dinVerisi.din];
                if (mezhepFiltresi && mezhepFiltresi.length > 0 && dinVerisi.mezhepler) {
                    const filtrelenmisYuzde = dinVerisi.mezhepler
                        .filter((m) => mezhepFiltresi.includes(m.isim))
                        .reduce((t, m) => t + m.yuzde, 0);
                    if (filtrelenmisYuzde > enYuksekYuzde) {
                        enYuksekYuzde = filtrelenmisYuzde;
                        seciliRenk = DIN_RENKLERI[dinVerisi.din] || '#94A3B8';
                    }
                } else {
                    if (dinVerisi.yuzde > enYuksekYuzde) {
                        enYuksekYuzde = dinVerisi.yuzde;
                        seciliRenk = DIN_RENKLERI[dinVerisi.din] || '#94A3B8';
                    }
                }
            }

            if (enYuksekYuzde === 0) {
                cache.set(feature.id, { fill: '#0f172a', opacity: 0.1, isPassive: true });
                return;
            }

            // HSL tabanlı dinamik skala
            const oran = enYuksekYuzde / 100;
            const scaleValue = scalePow().exponent(0.5).domain([0, 1]).range([0, 1])(oran);
            const baseColor = hsl(seciliRenk);
            
            const targetL = baseColor.l;
            const minL = 0.12; 
            const finalL = minL + scaleValue * (targetL - minL);
            
            const targetS = baseColor.s;
            const minS = targetS * 0.3;
            const finalS = minS + scaleValue * (targetS - minS);

            const finalColor = hsl(baseColor.h, finalS, finalL).formatHex();

            cache.set(feature.id, { fill: finalColor, opacity: 1, isPassive: false });
        });

        return cache;
    }, [topoData, seciliDinler, seciliMezhepler, aramaMetni]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent, ulke: Ulke) => {
            ipucuGoster(ulke, e.clientX, e.clientY);
        },
        [ipucuGoster]
    );

    const handleClick = useCallback(
        (ulke: Ulke) => {
            ulkeSec(seciliUlke?.ulkeKodu === ulke.ulkeKodu ? null : ulke);
        },
        [ulkeSec, seciliUlke]
    );

    // Yükleniyor durumu
    if (yukleniyor) {
        return (
            <div className="harita-yukleniyor">
                <div className="skeleton-harita">
                    <div className="skeleton-shimmer"></div>
                </div>
                <p>Harita verileri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (haritaHatasi) {
        return (
            <div className="harita-hata">
                <div className="hata-ikon">⚠️</div>
                <h3>Harita Yüklenemedi</h3>
                <p>{haritaHatasi}</p>
                <button
                    className="yeniden-dene-btn"
                    onClick={() => window.location.reload()}
                >
                    🔄 Yeniden Dene
                </button>
            </div>
        );
    }

    if (topoData.length === 0) {
        return (
            <div className="harita-yukleniyor">
                <div className="yukleniyor-animasyon"></div>
                <p>Harita yükleniyor...</p>
            </div>
        );
    }

    const currentZoom = zoomScaleRef.current;

    return (
        <div className="harita-svg-wrapper">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${boyutlar.genislik} ${boyutlar.yukseklik}`}
                className="harita-svg"
                preserveAspectRatio="xMidYMid meet"
                style={{ cursor: 'grab', width: '100%', height: '100%' }}
                role="img"
                aria-label="Dünya din dağılımı haritası"
            >
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect width="100%" height="100%" fill="none" pointerEvents="all" />

                <g ref={gRef}>
                    {/* 1. Seçili OLMAYAN Ülkeler */}
                    {topoData
                        .filter(f => ulkeyiBul(f.id, ulkeKoduHaritasi)?.ulkeKodu !== seciliUlke?.ulkeKodu)
                        .map((feature) => {
                            const renk = renkCache.get(feature.id) || { fill: '#0f172a', opacity: 0.1, isPassive: true };
                            const ulke = ulkeyiBul(feature.id, ulkeKoduHaritasi);
                            const isHovered = hoveredId === feature.id;
                            const d = pathCache.get(feature.id) || '';

                            let strokeColor = '#1e293b';
                            let currentStrokeWidth = 0.5;

                            if (isHovered) {
                                strokeColor = renk.isPassive ? '#334155' : '#3b82f6';
                                currentStrokeWidth = 1.2;
                            }

                            return (
                                <path
                                    key={feature.id}
                                    d={d}
                                    fill={renk.fill}
                                    opacity={renk.opacity}
                                    stroke={strokeColor}
                                    strokeWidth={currentStrokeWidth}
                                    className={`ulke-yolu ${renk.isPassive ? 'pasif' : 'aktif'}`}
                                    style={{
                                        filter: isHovered && !renk.isPassive ? 'url(#glow)' : undefined,
                                        transition: 'all 0.1s ease',
                                        pointerEvents: 'all'
                                    }}
                                    onMouseEnter={() => setHoveredId(feature.id)}
                                    onMouseLeave={() => {
                                        setHoveredId(null);
                                        ipucuGizle();
                                    }}
                                    onMouseMove={(e) => ulke && handleMouseMove(e, ulke)}
                                    onClick={() => ulke && handleClick(ulke)}
                                    tabIndex={ulke ? 0 : undefined}
                                    role={ulke ? 'button' : undefined}
                                    aria-label={ulke ? `${ulke.ulke} — ${ulke.dinler[0]?.din} %${ulke.dinler[0]?.yuzde}` : undefined}
                                    onKeyDown={(e) => {
                                        if (ulke && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            handleClick(ulke);
                                        }
                                    }}
                                />
                            );
                        })}

                    {/* 2. SEÇİLİ ÜLKE (En Üstte) */}
                    {topoData
                        .filter(f => ulkeyiBul(f.id, ulkeKoduHaritasi)?.ulkeKodu === seciliUlke?.ulkeKodu)
                        .map((feature) => {
                            const renk = renkCache.get(feature.id) || { fill: '#0f172a', opacity: 0.1, isPassive: false };
                            const ulke = ulkeyiBul(feature.id, ulkeKoduHaritasi);
                            const d = pathCache.get(feature.id) || '';

                            return (
                                <path
                                    key={`selected-${feature.id}`}
                                    d={d}
                                    fill={renk.fill}
                                    opacity={renk.opacity}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    className="ulke-yolu aktif secili"
                                    style={{
                                        filter: 'url(#glow-selected)',
                                        zIndex: 100
                                    }}
                                    onMouseEnter={() => setHoveredId(feature.id)}
                                    onMouseLeave={() => {
                                        setHoveredId(null);
                                        ipucuGizle();
                                    }}
                                    onMouseMove={(e) => ulke && handleMouseMove(e, ulke)}
                                    onClick={() => ulke && handleClick(ulke)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={ulke ? `${ulke.ulke} (seçili)` : undefined}
                                    aria-pressed="true"
                                />
                            );
                        })}

                    {/* 3. İsim Etiketleri */}
                    <g pointerEvents="none" style={{ userSelect: 'none' }}>
                        {(() => {
                            // Nüfusa göre azalan sırada sırala (büyük ülkeler öncelikli yerleşsin)
                            const sortedFeatures = [...topoData].sort((a, b) => {
                                const ua = ulkeyiBul(a.id, ulkeKoduHaritasi);
                                const ub = ulkeyiBul(b.id, ulkeKoduHaritasi);
                                return (ub?.nufus || 0) - (ua?.nufus || 0);
                            });

                            const placedLabels: { x: number, y: number, width: number, height: number }[] = [];

                            return sortedFeatures.map((feature) => {
                                const ulke = ulkeyiBul(feature.id, ulkeKoduHaritasi);
                                if (!ulke) return null;

                                const isSelected = seciliUlke?.ulkeKodu === ulke.ulkeKodu;
                                const merkez = geoCentroid(feature.geometry as GeoPermissibleObjects);
                                const [x, y] = projeksiyon(merkez) || [0, 0];

                                // Yazı boyutunu doğrudan currentZoom ile ters orantılı yapıyoruz.
                                // Böylece ekrandaki fiziksel piksel boyutu hep aynı (örn: 10px veya 14px) kalır.
                                // Zoom yaptıkça SVG uzayındaki font boyutu küçülecek, çarpışma kutuları da küçülecektir!
                                const ekranBoyutu = isSelected ? 14 : 10;
                                const finalFontSize = ekranBoyutu / currentZoom;

                                // Bounding box tahmini hesaplaması
                                const textWidth = ulke.ulke.length * finalFontSize * 0.55;
                                const textHeight = finalFontSize * 1.2;

                                // Çarpışma (Collision) Kontrolü
                                const isOverlapping = placedLabels.some(rect => {
                                    return Math.abs(rect.x - x) < (rect.width + textWidth) / 2 &&
                                           Math.abs(rect.y - y) < (rect.height + textHeight) / 2;
                                });

                                // Seçili olanlar her zaman görünür. Değilse, çakışma varsa gizle.
                                if (isOverlapping && !isSelected) return null;

                                // Haritaya yerleştirilen ismin alanını kaydet ki sonrakiler buna göre hesaplansın
                                placedLabels.push({ x, y, width: textWidth, height: textHeight });

                                return (
                                    <text
                                        key={`label-${feature.id}`}
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dy=".35em"
                                        fill={isSelected ? "#ffffff" : "#f1f5f9"}
                                        fontSize={finalFontSize}
                                        fontWeight={isSelected ? "800" : "600"}
                                        style={{
                                            opacity: isSelected ? 1 : 0.9,
                                            textShadow: isSelected
                                                ? '0px 0px 8px rgba(59, 130, 246, 0.8), 0px 0px 2px rgba(0,0,0,1)'
                                                : '0px 0px 4px rgba(0,0,0,0.9)',
                                            transition: 'opacity 0.3s ease',
                                            pointerEvents: 'none',
                                            fontFamily: 'var(--font-ikincil)',
                                            letterSpacing: isSelected ? '0.2px' : 'normal'
                                        }}
                                    >
                                        {ulke.ulke}
                                    </text>
                                );
                            });
                        })()}
                    </g>
                </g>
            </svg>

            {/* Zoom Kontrolleri */}
            <div className="harita-zoom-kontrolleri">
                <button className="zoom-btn" onClick={handleZoomIn} title="Yakınlaştır" aria-label="Haritayı yakınlaştır">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                </button>
                <button className="zoom-btn" onClick={handleZoomOut} title="Uzaklaştır" aria-label="Haritayı uzaklaştır">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                </button>
                <button className="zoom-btn zoom-reset" onClick={handleZoomReset} title="Sıfırla" aria-label="Haritayı sıfırla">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
            </div>

            {/* Zoom Seviyesi Göstergesi */}
            {currentZoom > 1.1 && (
                <div className="zoom-seviye-badge">
                    {currentZoom.toFixed(1)}x
                </div>
            )}
        </div>
    );
};

export default React.memo(HaritaGrafigi);
