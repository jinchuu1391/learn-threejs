import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  // 시야각
  75,
  // 화면 비율
  window.innerWidth / window.innerHeight,
  // 가까운 거리(이 값보다 가까우면 보이지 않음)
  0.1,
  // 먼 거리(이 값보다 멀면 보이지 않음)
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer element(canvas)를 body에 추가
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate(time) {
  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;

  renderer.render(scene, camera);
}
// 내부적으로 requestAnimationFrame을 사용해 매 프레임마다 animate 함수를 호출해 장면을 다시 그린다
renderer.setAnimationLoop(animate);
