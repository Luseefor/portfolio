import * as THREE from 'three';

// Winding path with Elevation Changes (Highs and Lows)
export const cityCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 10),    // BUFFER START
    new THREE.Vector3(0, 0, 0),     // START
    new THREE.Vector3(0, 0, -50),   // STRAIGHT
    new THREE.Vector3(20, 5, -100), // UP HILL + RIGHT
    new THREE.Vector3(20, 10, -150),// PEAK
    new THREE.Vector3(0, 0, -250),  // DOWNHILL + LEFT (Valley)
    new THREE.Vector3(-30, -5, -350), // LOW POINT
    new THREE.Vector3(-30, 0, -450),// CLIMBING OUT
    new THREE.Vector3(0, 15, -550), // BIG CLIMB TO END
    new THREE.Vector3(0, 20, -600), // FINAL PLATFORM
]);
