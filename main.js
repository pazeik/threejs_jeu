import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Add a skybox
let skyGeo = new THREE.SphereGeometry(300, 25, 25);
skyGeo.position = new THREE.Vector3(0, 0, 0);
var skyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// Set the gradient color
skyMaterial.vertexColors = [
  new THREE.Color(0x87ceeb), // Start color
  new THREE.Color(0x0000ff), // End color
];

var sky = new THREE.Mesh(skyGeo, skyMaterial);
sky.material.side = THREE.BackSide;
scene.add(sky);

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
const player = new THREE.Mesh(geometry, material);
scene.add(player);

camera.position.z = 5;

//Add a ground plane and handle collision with the player
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5dc });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -2;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

//add camera controls
const controls = new OrbitControls(camera, renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.copy(camera.position);
scene.add(light);

function checkCollision() {
  if (player.position.y <= -1) {
    player.position.y = -1;
  }
}

// Add controls for player with arrow keys
const speed = 1;
const arrowKeys = { left: 37, up: 38, right: 39, down: 40 };
const keysPressed = {};

window.addEventListener("keydown", (event) => {
  keysPressed[event.keyCode] = true;

  if (keysPressed[arrowKeys.left] || keysPressed[81]) {
    player.position.x -= speed;
  }

  if (keysPressed[arrowKeys.up] || keysPressed[90]) {
    player.position.z -= speed;
  }

  if (keysPressed[arrowKeys.right] || keysPressed[68]) {
    player.position.x += speed;
  }

  if (keysPressed[arrowKeys.down] || keysPressed[83]) {
    player.position.z += speed;
    checkCollision();
  }
});

//Make spheres fall around the player from the sky on the ground at random positions

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const spheres = [];

const sphereType = [
  "Sphere",
  "Box",
  "Cone",
  "Cylinder",
  "Dodecahedron",
  "Torus",
  "Tetrahedron",
  "Octahedron",
  "Icosahedron",
  "Ring",
];

const color = [
  0x0000ff, 0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff,
  0x000000, 0x800000, 0x808000,
];

//create a list of 10 different markers
const spheresType = [];

for (let i = 0; i < 10; i++) {
  const sphereGeometry = new THREE[sphereType[i] + "Geometry"]();
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color[i] });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = Math.random() * 100 - 50;
  sphere.position.z = Math.random() * 100 - 50;
  sphere.position.y = -2;
  spheresType.push(sphere);
}

//Falling spheres

for (let i = 0; i < 10; i++) {
  //select random sphere from spheresType
  const sphere = spheresType[Math.floor(Math.random() * 10)];
  sphere.position.z = Math.random() * 100 - 50;
  sphere.position.y = Math.random() * 100 - 50;
  scene.add(sphere);
  spheres.push(sphere);
}

window.addEventListener("keyup", (event) => {
  keysPressed[event.keyCode] = false;
});

function updateCamera() {
  camera.position.copy(player.position).add(new THREE.Vector3(0, 5, 10));
  camera.lookAt(player.position);
}

//create a map between markers and spheres
const markerMap = new Map();

for (let i = 0; i < spheres.length; i++) {
  const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.x = spheres[i].position.x;
  marker.position.z = spheres[i].position.z;
  marker.position.y = -2;
  scene.add(marker);
  markerMap.set(spheres[i], marker);
}

function animate() {
  for (let i = 1; i < spheres.length; i++) {
    spheres[i].position.y -= Math.random() * 1;
    //add marker on the ground where the sphere falls
    const marker = markerMap.get(spheres[i]); // Get the assigned marker from the map
    marker.position.x = spheres[i].position.x;
    marker.position.z = spheres[i].position.z;
    marker.position.y = ground.position.y;
    scene.add(marker);
    if (spheres[i].position.y < ground.position.y) {
      spheres[i].position.y = 50;
      spheres[i].position.x = Math.random() * 60 - 5;
      spheres[i].position.z = Math.random() * 60 - 5;
      scene.remove(marker); // Remove the marker from the scene
    }
  }
  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}
animate();
