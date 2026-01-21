import * as THREE from 'three';

// Define path: Start -> Experience -> Skills -> Projects -> Contact
export const cityCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -20),   // Experience
    new THREE.Vector3(20, 0, -40),  // Skills (Curve right)
    new THREE.Vector3(0, 0, -80),   // Projects (Curve left/back)
    new THREE.Vector3(0, 10, -120), // Contact / CPU Palace (Upward ramp)
], false, 'catmullrom', 0.5);
