/**
 * test.ts - Curve and Physics Test Utilities
 * 
 * Run at startup in dev mode to validate curve and physics calculations.
 * Tests extreme points, boundaries, and pitch calculations.
 */

import * as THREE from 'three';
import { cityCurve, mapScrollToCurve, getCurveExtremes, CURVE_START, CURVE_END } from './curve';

interface TestResult {
    name: string;
    passed: boolean;
    details: string;
}

/**
 * Test curve boundaries at scroll extremes
 */
function testCurveBoundaries(): TestResult[] {
    const results: TestResult[] = [];

    // Test t=0 (scroll start)
    const startT = mapScrollToCurve(0);
    const startPoint = new THREE.Vector3();
    cityCurve.getPointAt(startT, startPoint);
    results.push({
        name: 'Curve Start (scroll=0)',
        passed: startT === CURVE_START,
        details: `t=${startT.toFixed(3)}, pos=(${startPoint.x.toFixed(2)}, ${startPoint.y.toFixed(2)}, ${startPoint.z.toFixed(2)})`
    });

    // Test t=0.5 (middle)
    const midT = mapScrollToCurve(0.5);
    const midPoint = new THREE.Vector3();
    cityCurve.getPointAt(midT, midPoint);
    results.push({
        name: 'Curve Middle (scroll=0.5)',
        passed: Math.abs(midT - 0.5) < 0.001,
        details: `t=${midT.toFixed(3)}, pos=(${midPoint.x.toFixed(2)}, ${midPoint.y.toFixed(2)}, ${midPoint.z.toFixed(2)})`
    });

    // Test t=1 (scroll end)
    const endT = mapScrollToCurve(1);
    const endPoint = new THREE.Vector3();
    cityCurve.getPointAt(endT, endPoint);
    results.push({
        name: 'Curve End (scroll=1)',
        passed: endT === CURVE_END,
        details: `t=${endT.toFixed(3)}, pos=(${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})`
    });

    return results;
}

/**
 * Test extreme Y points (highest and lowest)
 */
function testExtremePoints(): TestResult[] {
    const results: TestResult[] = [];
    const extremes = getCurveExtremes();

    results.push({
        name: 'Highest Point',
        passed: extremes.highest.y > 0,
        details: `t=${extremes.highest.t.toFixed(3)}, y=${extremes.highest.y.toFixed(2)}, pos=(${extremes.highest.point.x.toFixed(2)}, ${extremes.highest.point.y.toFixed(2)}, ${extremes.highest.point.z.toFixed(2)})`
    });

    results.push({
        name: 'Lowest Point',
        passed: extremes.lowest.y < extremes.highest.y,
        details: `t=${extremes.lowest.t.toFixed(3)}, y=${extremes.lowest.y.toFixed(2)}, pos=(${extremes.lowest.point.x.toFixed(2)}, ${extremes.lowest.point.y.toFixed(2)}, ${extremes.lowest.point.z.toFixed(2)})`
    });

    results.push({
        name: 'Max Curvature (Sharpest Turn)',
        passed: extremes.maxCurvature.curvature > 0,
        details: `t=${extremes.maxCurvature.t.toFixed(3)}, curvature=${extremes.maxCurvature.curvature.toFixed(4)}`
    });

    return results;
}

/**
 * Test pitch calculations at various points
 */
function testPitchCalculations(): TestResult[] {
    const results: TestResult[] = [];
    const testPoints = [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

    for (const scroll of testPoints) {
        const t = mapScrollToCurve(scroll);
        const point = new THREE.Vector3();
        cityCurve.getPointAt(t, point);

        // Get tangent to calculate expected pitch
        const tangent = cityCurve.getTangentAt(t);
        const pitch = Math.atan2(tangent.y, Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z));
        const pitchDegrees = (pitch * 180) / Math.PI;

        results.push({
            name: `Pitch at scroll=${scroll.toFixed(2)}`,
            passed: !isNaN(pitch),
            details: `t=${t.toFixed(3)}, pitch=${pitchDegrees.toFixed(2)}°, tangent=(${tangent.x.toFixed(3)}, ${tangent.y.toFixed(3)}, ${tangent.z.toFixed(3)})`
        });
    }

    return results;
}

/**
 * Run all tests and log results
 */
export function runCurveTests(): void {
    console.group('🏎️ CURVE & PHYSICS TESTS');
    console.log('='.repeat(60));

    const allResults: TestResult[] = [
        ...testCurveBoundaries(),
        ...testExtremePoints(),
        ...testPitchCalculations()
    ];

    let passed = 0;
    let failed = 0;

    for (const result of allResults) {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        console.log(`   ${result.details}`);

        if (result.passed) passed++;
        else failed++;
    }

    console.log('='.repeat(60));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.groupEnd();
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Defer to avoid blocking initial load
    setTimeout(() => {
        runCurveTests();
    }, 1000);
}
