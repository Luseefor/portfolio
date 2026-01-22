'use client';

import { useEffect, useRef } from 'react';

export default function TechCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
            }
        };

        window.addEventListener('mousemove', moveCursor, { passive: true });

        // Inject global cursor styles
        const style = document.createElement('style');
        style.innerHTML = `
      * {
        cursor: none !important;
      }
      body, html, a, button, input, textarea, select {
        cursor: none !important;
      }
    `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-8 w-8 items-center justify-center mix-blend-difference will-change-transform"
            style={{
                opacity: 1,
                transition: 'opacity 0.2s ease',
            }}
        >
            <div className="relative h-2 w-2">
                {/* Center Dot */}
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />

                {/* Crosshair */}
                <div className="absolute left-1/2 top-1/2 h-8 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-white/20" />
                <div className="absolute left-1/2 top-1/2 h-[1px] w-8 -translate-x-1/2 -translate-y-1/2 bg-white/20" />

                {/* Corners */}
                <div className="absolute -left-2 -top-2 h-2 w-2 border-l border-t border-white/50" />
                <div className="absolute -right-2 -top-2 h-2 w-2 border-r border-t border-white/50" />
                <div className="absolute -left-2 -bottom-2 h-2 w-2 border-l border-b border-white/50" />
                <div className="absolute -right-2 -bottom-2 h-2 w-2 border-r border-b border-white/50" />
            </div>
        </div>
    );
}
