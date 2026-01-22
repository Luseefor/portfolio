import * as THREE from 'three';

export const PCBShader = {
    uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color('#0a2510') }, // Dark Forest Green
        uTraceColor: { value: new THREE.Color('#b8860b') }, // Metallic Gold
    },
    vertexShader: `
        varying vec3 vWorldPos;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uTraceColor;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vWorldPos.xz * 0.25; // Scale the circuit pattern based on world pos
            vec2 grid = floor(uv);
            vec2 f = fract(uv);

            // Base Green
            vec3 color = uBaseColor;

            // Copper Traces (Procedural Grid)
            float h = hash(grid);
            float trace = 0.0;
            
            // Draw horizontal or vertical traces
            if (h < 0.3) {
                trace = step(0.95, f.x) + step(0.95, f.y);
            } else if (h < 0.6) {
                trace = step(0.95, f.x);
            } else if (h < 0.9) {
                trace = step(0.95, f.y);
            }

            // Junction Pads
            float d = length(f - 0.5);
            float pad = 1.0 - smoothstep(0.1, 0.15, d);
            if (hash(grid + 0.1) > 0.8) {
                trace += pad;
            }

            color = mix(color, uTraceColor, clamp(trace, 0.0, 1.0));

            // Subtle pulsing data light in some traces
            if (trace > 0.5 && hash(grid + 0.5) > 0.95) {
                float pulse = step(0.5, fract(uv.x * 0.1 - uTime * 2.0));
                color = mix(color, vec3(1.0, 1.0, 1.0), pulse * 0.5);
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `
};
