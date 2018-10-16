import THREE from "../three-bundle";

export const bindControls = (camera: THREE.Camera) => {
  let controls = new THREE.OrbitControls( camera);
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.minDistance = 30;
  controls.enablePan = true;
  controls.minPolarAngle = Math.PI / 8; // radians
  controls.maxPolarAngle = Math.PI / 2.2; // radians
  
  return controls;
}


export default bindControls;