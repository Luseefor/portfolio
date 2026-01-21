'use client';

export function HUD() {
    return (
        <div className="fixed inset-0 pointer-events-none p-8 flex flex-col justify-between text-cyan-500 font-mono z-50">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                        Motherboard City
                    </h1>
                    <p className="text-sm opacity-80 animate-pulse">System Online</p>
                </div>
                <div className="text-right">
                    <p className="text-xs">COORDS: [45.2, -12.0, 88.1]</p>
                    <p className="text-xs">TEMP: 65°C</p>
                </div>
            </div>

            {/* Footer / Speedometer placeholder */}
            <div className="flex justify-between items-end">
                <div className="w-64">
                    <div className="h-2 bg-gray-900 border border-cyan-900 overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[45%] animate-[wiggle_1s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-xs mt-1">CPU USAGE</p>
                </div>
                <div className="text-right">
                    <div className="text-6xl font-bold italic">SCROLL</div>
                    <p className="text-sm">TO NAVIGATE</p>
                </div>
            </div>
        </div>
    );
}
