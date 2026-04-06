// 카메라, 씬, 빛, 지구(geo, mat -> mesh)
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

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
const albedoMap = textureLoader.load("/Albedo.jpg");
albedoMap.colorSpace = THREE.SRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (23.5 / 360) * 2 * Math.PI;

const bumpMap = textureLoader.load("/Bump.jpg");
const oceanMap = textureLoader.load("/Ocean.png");

const earthRadius = 10;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: albedoMap,
  bumpMap,
  roughnessMap: oceanMap,
  metalness: 0.1,
  metalnessMap: oceanMap,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);
scene.add(earthGroup);

const cloudsMap = textureLoader.load("/Clouds.png");
const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 64, 64);
const cloudsMaterial = new THREE.MeshStandardMaterial({
  alphaMap: cloudsMap,
  transparent: true,
});
const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
earth.rotateY(-0.3);
clouds.rotateY(-0.3);
earthGroup.add(clouds);

const clock = new THREE.Clock();
const earthRotationSpeed = 2;

const sunIntensity = 1.3;
const light = new THREE.DirectionalLight(0xffffff, sunIntensity);
light.position.set(-50, 0, 30);
scene.add(light);

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

  // need save to userData.shader in order to enable our code to update values in the shader uniforms,
  // reference from https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_modified.html

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
