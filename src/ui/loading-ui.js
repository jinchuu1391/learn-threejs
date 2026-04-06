import * as THREE from "three";

function createLoadingDOM() {
  const el = document.createElement("div");
  el.id = "loading";
  el.innerHTML = `
    <div>Loading...</div>
    <div id="progress-bar-container">
      <div id="progress-bar"></div>
    </div>
    <div id="progress-text">0%</div>
  `;
  document.body.prepend(el);
  return el;
}

export function createLoadingManager() {
  const loadingEl = createLoadingDOM();
  const progressBar = loadingEl.querySelector("#progress-bar");
  const progressText = loadingEl.querySelector("#progress-text");

  const manager = new THREE.LoadingManager();

  manager.onProgress = (url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
  };

  manager.onLoad = () => {
    loadingEl.classList.add("hidden");
  };

  return manager;
}
