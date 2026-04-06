import * as THREE from "three";

export function createLoadingManager() {
  const loadingEl = document.createElement("div");
  loadingEl.style.cssText = `
  position:fixed; inset:0; background:#000;
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; color:#fff; font-family:sans-serif; gap:12px;
  transition:opacity 0.5s;
`;
  loadingEl.innerHTML = `
  <div>Loading...</div>
  <div style="width:200px;height:4px;background:#333;border-radius:2px">
    <div id="progress-bar" style="height:100%;width:0%;background:#4af;border-radius:2px;transition:width 0.1s"></div>
  </div>
  <div id="progress-text">0%</div>
`;
  document.body.prepend(loadingEl);

  const progressBar = loadingEl.querySelector<HTMLDivElement>("#progress-bar");
  const progressText =
    loadingEl.querySelector<HTMLDivElement>("#progress-text");

  const loadingManager = new THREE.LoadingManager();

  loadingManager.onProgress = (url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    if (!progressBar || !progressText) {
      return;
    }
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
  };
  loadingManager.onLoad = () => {
    loadingEl.style.opacity = "0";
    loadingEl.style.pointerEvents = "none";
  };

  return loadingManager;
}
