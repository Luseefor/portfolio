import * as THREE from 'three';

// Long, winding path for a full portfolio journey
export const cityCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 10), // START BUFFER
    new THREE.Vector3(0, 0, 0), // START
    new THREE.Vector3(0, 0, -50), // STRAIGHT 1
    new THREE.Vector3(20, 0, -100), // CURVE RIGHT
    new THREE.Vector3(20, 0, -200), // STRAIGHT 2
    new THREE.Vector3(-30, 0, -300), // BIG CURVE LEFT
    new THREE.Vector3(-30, 0, -450), // STRAIGHT 3
    new THREE.Vector3(0, 10, -550), // RISE UP (Bridge?)
    new THREE.Vector3(0, 20, -600), // FINAL PLATFORM
]);
