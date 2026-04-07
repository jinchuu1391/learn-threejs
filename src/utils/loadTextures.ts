import { LoadingManager } from "three";
import * as THREE from "three";

const BASE_URL = import.meta.env.BASE_URL;

export async function loadTextures(manager: LoadingManager) {
  const loader = new THREE.TextureLoader(manager);
  const [albedoMap, bumpMap, oceanMap, lightsMap, backgroundMap, cloudsMap] =
    await Promise.all([
      loader.loadAsync(BASE_URL + "Albedo.jpg"),
      loader.loadAsync(BASE_URL + "Bump.jpg"),
      loader.loadAsync(BASE_URL + "Ocean.png"),
      loader.loadAsync(BASE_URL + "night_lights.png"),
      loader.loadAsync(BASE_URL + "Gaia_EDR3_darkened.png"),
      loader.loadAsync(BASE_URL + "Clouds.png"),
    ]);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  backgroundMap.mapping = THREE.EquirectangularReflectionMapping;

  return { albedoMap, bumpMap, oceanMap, lightsMap, backgroundMap, cloudsMap };
}
