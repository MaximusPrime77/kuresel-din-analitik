import { useState, useEffect } from 'react';

type Breakpoint = 'mobil' | 'phablet' | 'tablet' | 'desktop' | 'genis';

const BREAKPOINTS = {
    mobil: 480,
    phablet: 768,
    tablet: 1024,
    desktop: 1440,
};

function getBreakpoint(width: number): Breakpoint {
    if (width < BREAKPOINTS.mobil) return 'mobil';
    if (width < BREAKPOINTS.phablet) return 'phablet';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    if (width < BREAKPOINTS.desktop) return 'desktop';
    return 'genis';
}

/**
 * Responsive breakpoint hook
 * Ekran boyutuna göre mevcut breakpoint'i döndürür
 */
export function useMediaQuery() {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getBreakpoint(window.innerWidth));
    const [genislik, setGenislik] = useState(window.innerWidth);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const handleResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const yeniGenislik = window.innerWidth;
                setGenislik(yeniGenislik);
                setBreakpoint(getBreakpoint(yeniGenislik));
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeout);
        };
    }, []);

    const isMobil = breakpoint === 'mobil' || breakpoint === 'phablet';
    const isTablet = breakpoint === 'tablet';
    const isDesktop = breakpoint === 'desktop' || breakpoint === 'genis';

    return { breakpoint, genislik, isMobil, isTablet, isDesktop };
}
