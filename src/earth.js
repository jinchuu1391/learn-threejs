// 카메라, 씬, 빛, 지구(geo, mat -> mesh)
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.outputColorSpace = THREE.SRGBColorSpace;

const fov = 45;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const controls = new OrbitControls(camera, canvas);
camera.position.set(0, 0, 30);
controls.update();

const textureLoader = new THREE.TextureLoader();
const albedoMap = textureLoader.load("/Albedo.jpg");
albedoMap.colorSpace = THREE.SRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (23.5 / 360) * 2 * Math.PI;

const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({ map: albedoMap });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);
scene.add(earthGroup);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(-50, 0, 30);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  controls.update();
  renderer.render(scene, camera);
}

animate();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}
