import * as THREE from "three";

const FRAGS = import.meta.glob("./*/frag.glsl", { query: "?raw", import: "default" });
const VERTS = import.meta.glob("./*/vert.glsl", { query: "?raw", import: "default" });

import commonVert from "./vert.glsl?raw";

function listExamples() {
  return Object.keys(FRAGS)
    .map((k) => k.split("/")[1]) // "./01-gradient/frag.glsl" -> "01-gradient"
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function pickExample(examples) {

  const urlEx = new URLSearchParams(location.search).get("ex");
  const envEx = import.meta.env.VITE_EXAMPLE;
  const fallback = examples[0] ?? "01-gradient";
  return urlEx || envEx || fallback;
}

const examples = listExamples();
const example = pickExample(examples);

if (!examples.includes(example)) {
  const msg = `Unknown example "${example}". Available: ${examples.join(", ")}`;
  console.error(msg);
  alert(msg);
  throw new Error(msg);
}

document.getElementById("exName").textContent = example;

// --- Three.js minimal fullscreen quad setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uMouse: { value: new THREE.Vector2(0, 0) } // pixels, origin bottom-left
};

const fragKey = `./${example}/frag.glsl`;
const vertKey = `./${example}/vert.glsl`;

async function loadShaders() {
  const fragmentShader = await FRAGS[fragKey]();
  const vertexShader = VERTS[vertKey] ? await VERTS[vertKey]() : commonVert;
  return { fragmentShader, vertexShader };
}

const initial = await loadShaders();

const material = new THREE.ShaderMaterial({
  vertexShader: initial.vertexShader,
  fragmentShader: initial.fragmentShader,
  uniforms
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
quad.frustumCulled = false;
scene.add(quad);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  uniforms.uResolution.value.set(w, h);
}
window.addEventListener("resize", resize);
resize();


window.addEventListener("pointermove", (e) => {
  uniforms.uMouse.value.set(e.clientX, window.innerHeight - e.clientY);
});

// Optional: left/right cycle through examples (updates URL, full reload)
window.addEventListener("keydown", (e) => {

  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();

  const i = examples.indexOf(example);
  const dir = e.key === "ArrowRight" ? 1 : -1;

  const next = examples[(i + dir + examples.length) % examples.length];

  const url = new URL(location.href);
  url.searchParams.set("ex", next);
  location.href = url.toString();
});

let last = performance.now();
function loop(now) {

  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  uniforms.uTime.value += dt;
  renderer.render(scene, camera);
}
requestAnimationFrame(loop);
