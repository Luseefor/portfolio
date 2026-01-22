'use client';

import React, { useRef } from 'react';
import { useScroll, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function HUD() {
    const scroll = useScroll();
    const speedTextRef = useRef<HTMLSpanElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useFrame(() => {
        const velocity = Math.abs(scroll.delta) * 500;
        const speed = Math.floor(Math.min(velocity, 220));
        const progress = Math.floor(scroll.offset * 100);

        // Direct DOM updates to avoid React re-renders every frame
        if (speedTextRef.current) speedTextRef.current.textContent = speed.toString().padStart(3, '0');
        if (progressTextRef.current) progressTextRef.current.textContent = `${progress}%`;
        if (progressBarRef.current) progressBarRef.current.style.width = `${progress}%`;
    });

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                fontFamily: '"JetBrains Mono", monospace', // Use mono for numbers
                color: 'white',
                position: 'relative'
            }}>
                {/* Speedometer Area */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minWidth: '160px'
                }}>
                    <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', fontWeight: 600, fontFamily: 'sans-serif' }}>SPEED</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span ref={speedTextRef} style={{ fontSize: '32px', fontWeight: 800 }}>000</span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>KM/H</span>
                    </div>
                </div>

                {/* Progress Bar Area */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minWidth: '240px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', opacity: 0.5, fontWeight: 600, letterSpacing: '1px', fontFamily: 'sans-serif' }}>
                        <span>JOURNEY PROGRESS</span>
                        <span ref={progressTextRef}>0%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div ref={progressBarRef} style={{
                            width: '0%',
                            height: '100%',
                            background: '#f0c040',
                            boxShadow: '0 0 10px rgba(240, 192, 64, 0.5)'
                        }} />
                    </div>
                </div>
            </div>
        </Html>
    );
}
