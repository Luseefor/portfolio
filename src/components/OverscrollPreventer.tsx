'use client';

import { useEffect } from 'react';

/**
 * OverscrollPreventer
 * Prevents browser "rubber-banding" and rubber-band scrolling effects,
 * particularly on iOS Safari and modern desktop browsers.
 * This is crucial for maintaining a solid "OS-like" interface.
 */
export default function OverscrollPreventer() {
    useEffect(() => {
        // Apply overscroll behavior prevention globally
        const html = document.documentElement;
        const body = document.body;

        const originalHtmlOverscroll = html.style.overscrollBehavior;
        const originalBodyOverscroll = body.style.overscrollBehavior;

        html.style.overscrollBehavior = 'none';
        body.style.overscrollBehavior = 'none';

        // Additional CSS to prevent bouncing on iOS
        const style = document.createElement('style');
        style.id = 'overscroll-preventer-style';
        style.innerHTML = `
      html, body {
        height: 100%;
        overflow: hidden;
        overscroll-behavior: none;
      }

      #__next, main {
        height: 100%;
        overflow: hidden;
      }

      /* Allow scrolling only in specific containers if needed in the future */
      .allow-scroll {
        overflow: auto;
        overscroll-behavior: contain;
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
    }, []);

    return null;
}
