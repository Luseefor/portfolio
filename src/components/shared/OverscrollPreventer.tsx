'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * OverscrollPreventer
 * Prevents browser "rubber-banding" on the landing page only.
 * This maintains the solid "OS-like" feel on the root, but allows
 * normal scrolling on all other pages.
 */
export default function OverscrollPreventer() {
  const pathname = usePathname();

  useEffect(() => {
    const isLanding = pathname === '/';
    const overflowValue = isLanding ? 'hidden' : 'auto';
    const overscrollValue = isLanding ? 'none' : 'auto';

    // Apply overscroll behavior prevention globally
    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverscroll = html.style.overscrollBehavior;
    const originalBodyOverscroll = body.style.overscrollBehavior;

    html.style.overscrollBehavior = overscrollValue;
    body.style.overscrollBehavior = overscrollValue;

    // Additional CSS to prevent bouncing on iOS
    const style = document.createElement('style');
    style.id = 'overscroll-preventer-style';
    style.innerHTML = `
      html, body {
        height: 100%;
        overflow: ${overflowValue};
        overscroll-behavior: ${overscrollValue};
      }

      #__next, main {
        height: 100%;
        overflow: ${overflowValue};
      }
    `;
    document.head.appendChild(style);

    return () => {
      html.style.overscrollBehavior = originalHtmlOverscroll;
      body.style.overscrollBehavior = originalBodyOverscroll;
      const existingStyle = document.getElementById('overscroll-preventer-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [pathname]);

  return null;
}
