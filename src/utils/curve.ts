import * as THREE from 'three';

// Flat winding path - no elevation changes
export const cityCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 10),      // BUFFER START
    new THREE.Vector3(0, 0, 0),       // START
    new THREE.Vector3(0, 0, -50),     // STRAIGHT
    new THREE.Vector3(10, 0, -80),    // TURN RIGHT
    new THREE.Vector3(20, 0, -100),   // CONTINUE RIGHT
    new THREE.Vector3(20, 0, -150),   // STRAIGHT
    new THREE.Vector3(0, 0, -250),    // TURN LEFT
    new THREE.Vector3(-30, 0, -350),  // CONTINUE LEFT
    new THREE.Vector3(-30, 0, -450),  // STRAIGHT
    new THREE.Vector3(0, 0, -550),    // TURN RIGHT
    new THREE.Vector3(0, 0, -800),    // STRAIGHT
    new THREE.Vector3(50, 0, -1200),  // WIDE TURN
    new THREE.Vector3(0, 0, -2000),   // STRAIGHT
    new THREE.Vector3(-50, 0, -2500), // NEW END
]);

// === CURVE TRIMMING FOR ROAD CONTINUITY ===
// Trim 10% from start and end so road appears continuous during scrolling
export const CURVE_START = 0.1;  // Start 10% into the curve
export const CURVE_END = 0.9;    // End 10% before the curve ends

/**
 * Maps scroll offset [0, 1] to the trimmed curve range [CURVE_START, CURVE_END]
 * This ensures the road is visible before and after the car's travel path
 */
export function mapScrollToCurve(scrollOffset: number): number {
    const clampedOffset = Math.max(0, Math.min(1, scrollOffset));
    return CURVE_START + clampedOffset * (CURVE_END - CURVE_START);
}

/**
 * Find extreme points on the curve for debugging/testing
 */
export function getCurveExtremes() {
    const samples = 100;
    let highest = { t: 0, y: -Infinity, point: new THREE.Vector3() };
    let lowest = { t: 0, y: Infinity, point: new THREE.Vector3() };
    let maxCurvature = { t: 0, curvature: 0 };

    const point = new THREE.Vector3();
    const prevPoint = new THREE.Vector3();
    const prevTangent = new THREE.Vector3();

    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        cityCurve.getPointAt(t, point);

        // Track highest/lowest Y
        if (point.y > highest.y) {
            highest = { t, y: point.y, point: point.clone() };
        }
        if (point.y < lowest.y) {
            lowest = { t, y: point.y, point: point.clone() };
        }

        // Approximate curvature from tangent change
        if (i > 0) {
            const tangent = cityCurve.getTangentAt(t);
            const curvature = tangent.clone().sub(prevTangent).length();
            if (curvature > maxCurvature.curvature) {
                maxCurvature = { t, curvature };
            }
            prevTangent.copy(tangent);
        } else {
            cityCurve.getTangentAt(t, prevTangent);
        }

        prevPoint.copy(point);
    }

    return { highest, lowest, maxCurvature };
}

