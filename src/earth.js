import * as THREE from "three";
import { loadTextures, createLoadingManager } from "./utils/index.ts";
import { CONFIG } from "./earth/config.js";
import { createEarth, createClouds, createAtmosphere } from "./earth/meshes.js";
import {
  createRenderer,
  createCamera,
  resizeRendererToDisplaySize,
} from "./utils/renderer.js";

// --- Renderer & Scene ---
THREE.ColorManagement.enabled = true;
const canvas = document.querySelector("#c");
const renderer = createRenderer(canvas);
const scene = new THREE.Scene();

// --- Camera & Controls ---
const { camera, controls } = createCamera(canvas, CONFIG.camera);

// --- Textures ---
const loadingManager = createLoadingManager();
const { albedoMap, bumpMap, oceanMap, lightsMap, backgroundMap, cloudsMap } =
  await loadTextures(loadingManager);

scene.background = backgroundMap;

// --- Build Scene ---
const earthGroup = new THREE.Group();
earthGroup.rotation.z = CONFIG.axialTilt;

const earth = createEarth({
  albedoMap,
  bumpMap,
  oceanMap,
  lightsMap,
  cloudsMap,
});
const clouds = createClouds({ cloudsMap });
const atmosphere = createAtmosphere();
earthGroup.add(earth, clouds, atmosphere);

const light = new THREE.DirectionalLight(0xffffff, CONFIG.sun.intensity);
light.position.set(...CONFIG.sun.position);
scene.add(light, earthGroup);

// --- Animation ---
const timer = new THREE.Timer();

function animate() {
  timer.update();
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect =
      renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();

  const delta = timer.getDelta();
  earth.rotateY(
    CONFIG.earth.rotationSpeed * CONFIG.earth.rotationCoeff * delta,
  );
  clouds.rotateY(
    CONFIG.earth.rotationSpeed * CONFIG.clouds.rotationCoeff * delta,
  );

  const shader = earth.material.userData.shader;
  if (shader) {
    shader.uniforms.uv_xOffset.value +=
      ((delta * CONFIG.earth.rotationCoeff * CONFIG.earth.rotationSpeed) /
        (2 * Math.PI)) %
      1;
  }

  renderer.render(scene, camera);
}

animate();
