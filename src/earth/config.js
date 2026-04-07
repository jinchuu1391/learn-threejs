export const CONFIG = {
  axialTilt: (23.5 / 360) * 2 * Math.PI,
  camera: { fov: 45, near: 1, far: 1000, position: [0, 0, 30] },
  earth: {
    radius: 10,
    rotationSpeed: 2,
    rotationCoeff: 0.005,
  },
  clouds: {
    rotationCoeff: 0.01,
  },
  atmosphere: {
    radius: 12.5,
    opacity: 0.7,
    powFactor: 4.1,
    multiplier: 9.5,
  },
  sun: {
    intensity: 2.5,
    position: [-50, 0, 30],
  },
};
