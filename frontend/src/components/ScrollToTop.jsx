import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis) {
            // Fallback to native smooth scroll if lenis is not initialized yet
            if (hash) {
                setTimeout(() => {
                    const id = hash.replace('#', '');
                    const element = document.getElementById(id);
                    if (element) {
                        const y = element.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }, 100);
            } else {
                window.scrollTo(0, 0);
            }
            return;
        }

        if (hash) {
            setTimeout(() => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    lenis.scrollTo(element, { offset: -100 });
                }
            }, 100);
        } else {
            lenis.scrollTo(0, { immediate: true });
            // Also call native window.scrollTo as a fallback ensuring no layout shift issues
            window.scrollTo(0, 0);
        }
    }, [pathname, hash, lenis]);

    return null;
};

export default ScrollToTop;
