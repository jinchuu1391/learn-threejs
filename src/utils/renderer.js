import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  return renderer;
}

export function createCamera(canvas, { fov, near, far, position }) {
  const camera = new THREE.PerspectiveCamera(
    fov,
    canvas.clientWidth / canvas.clientHeight,
    near,
    far,
  );
  camera.position.set(...position);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.update();
  return { camera, controls };
}

export function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const needResize =
    canvas.width !== canvas.clientWidth ||
    canvas.height !== canvas.clientHeight;
  if (needResize) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }
  return needResize;
}
