import * as THREE from "three";
import vertexShader from "../../shaders/vertex.glsl";
import fragmentShader from "../../shaders/fragment.glsl";
import { CONFIG } from "./config.js";

export function createClouds({ cloudsMap }) {
  const geometry = new THREE.SphereGeometry(CONFIG.earth.radius + 0.05, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    alphaMap: cloudsMap,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateY(-0.3);
  return mesh;
}

export function createAtmosphere() {
  const geometry = new THREE.SphereGeometry(CONFIG.atmosphere.radius, 64, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      atmOpacity: { value: CONFIG.atmosphere.opacity },
      atmPowFactor: { value: CONFIG.atmosphere.powFactor },
      atmMultiplier: { value: CONFIG.atmosphere.multiplier },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  return new THREE.Mesh(geometry, material);
}

export function createEarth({
  albedoMap,
  bumpMap,
  oceanMap,
  lightsMap,
  cloudsMap,
}) {
  const geometry = new THREE.SphereGeometry(CONFIG.earth.radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: albedoMap,
    bumpMap,
    bumpScale: 0.03,
    roughnessMap: oceanMap,
    metalness: 0.1,
    metalnessMap: oceanMap,
    emissiveMap: lightsMap,
    emissive: new THREE.Color(0xffff88),
  });
  applyEarthShader(material, cloudsMap);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotateY(-0.3);
  return mesh;
}

function applyEarthShader(material, cloudsMap) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.tClouds = { value: cloudsMap };
    shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping;
    shader.uniforms.uv_xOffset = { value: 0 };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `
        #include <common>
        uniform sampler2D tClouds;
        uniform float uv_xOffset;
      `,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `
        float roughnessFactor = roughness;

        #ifdef USE_ROUGHNESSMAP

          vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
          texelRoughness = vec4(1.0) - texelRoughness;

          roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);

        #endif
      `,
      )
      .replace(
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
    material.userData.shader = shader;
  };
}
