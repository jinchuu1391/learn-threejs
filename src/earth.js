// 카메라, 씬, 빛, 지구(geo, mat -> mesh)
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";

const BASE_URL = import.meta.env.BASE_URL;

THREE.ColorManagement.enabled = true;
const scene = new THREE.Scene();

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const fov = 45;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const controls = new OrbitControls(camera, canvas);
camera.position.set(0, 0, 30);
controls.update();

const textureLoader = new THREE.TextureLoader();
const albedoMap = textureLoader.load(BASE_URL + "Albedo.jpg");
albedoMap.colorSpace = THREE.SRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (23.5 / 360) * 2 * Math.PI;

const bumpMap = textureLoader.load(BASE_URL + "Bump.jpg");
const oceanMap = textureLoader.load(BASE_URL + "Ocean.png");
const lightsMap = textureLoader.load(BASE_URL + "night_lights.png");
const backgroundMap = textureLoader.load(BASE_URL + "Gaia_EDR3_darkened.png");
backgroundMap.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundMap;

const earthRadius = 10;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap,
  bumpScale: 0.03,
  roughnessMap: oceanMap,
  metalness: 0.1,
  metalnessMap: oceanMap,
  emissiveMap: lightsMap,
  emissive: new THREE.Color(0xffff88),
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

const cloudsMap = textureLoader.load(BASE_URL + "Clouds.png");
const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 64, 64);
const cloudsMaterial = new THREE.MeshStandardMaterial({
  alphaMap: cloudsMap,
  transparent: true,
});
const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
earth.rotateY(-0.3);
clouds.rotateY(-0.3);
earthGroup.add(clouds);

const atmosGeometry = new THREE.SphereGeometry(12.5, 64, 64);
const atmosMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    atmOpacity: { value: 0.7 },
    atmPowFactor: { value: 4.1 },
    atmMultiplier: { value: 9.5 },
  },
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});
const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
earthGroup.add(atmosphere);

const clock = new THREE.Clock();
const earthRotationSpeed = 2;

const sunIntensity = 2.5;
const light = new THREE.DirectionalLight(0xffffff, sunIntensity);
light.position.set(-50, 0, 30);
scene.add(light);

scene.add(earthGroup);

earthMaterial.onBeforeCompile = function (shader) {
  shader.uniforms.tClouds = { value: cloudsMap };
  shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping;
  shader.uniforms.uv_xOffset = { value: 0 };
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `
        #include <common>
        uniform sampler2D tClouds;
        uniform float uv_xOffset;
      `,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <roughnessmap_fragment>",
    `
        float roughnessFactor = roughness;

        #ifdef USE_ROUGHNESSMAP

          vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
          texelRoughness = vec4(1.0) - texelRoughness;

          roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);

        #endif
      `,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <emissivemap_fragment>",
    `
        #ifdef USE_EMISSIVEMAP

          vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

          emissiveColor *= 1.0 - smoothstep(-0.02, 0.0, dot(normal, directionalLights[0].direction));

          totalEmissiveRadiance *= emissiveColor.rgb;

        #endif

        float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;

        diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2 );

        float intensity = 1.4 - dot( normal, vec3( 0.0, 0.0, 1.0 ) );
        vec3 atmosphere = vec3( 0.3, 0.6, 1.0 ) * pow(intensity, 5.0);
        diffuseColor.rgb += atmosphere;
      `,
  );

  earthMaterial.userData.shader = shader;
};

function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();

  const delta = clock.getDelta();
  earth.rotateY(earthRotationSpeed * 0.005 * delta);
  clouds.rotateY(earthRotationSpeed * 0.01 * delta);

  const shader = earth.material.userData.shader;
  if (shader) {
    let offset = (delta * 0.005 * earthRotationSpeed) / (2 * Math.PI);
    shader.uniforms.uv_xOffset.value += offset % 1;
  }
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
