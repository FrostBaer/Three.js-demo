import './style.css'

import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//Shadow settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.setZ(50);
camera.position.setX(-3);

renderer.render(scene, camera);

//DRAW

const geometry = new THREE.TorusGeometry(10, 1, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xeb4f34 });
const torus = new THREE.Mesh(geometry, material);

torus.position.set(camera.position.x, camera.position.y, camera.position.z);
torus.receiveShadow = true;

scene.add(torus);

//TEXTURE MAPPING

//Cube
const profileTexture = new THREE.TextureLoader().load('cat.jpg');
const profile = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 3, 3),
  //new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ map: profileTexture })
);

//scene.add(profile);

//Moon
const moonTexture = new THREE.TextureLoader().load('2k_moon.jpg');
const normalTexture = new THREE.TextureLoader().load('moon-normalmap.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
);
scene.add(moon);
moon.position.set(-30, 0, 30);
moon.castShadow = true;

//Earth
const earthTexture = new THREE.TextureLoader().load('earth_daymap.jpg');
const earthNormal = new THREE.TextureLoader().load('2k_earth_normal_map.png');

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(16, 128, 128),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
    normalMap: earthNormal
  })
);

earth.receiveShadow = true;
scene.add(earth);

//Sun
const sunTexture = new THREE.TextureLoader().load('2k_sun.jpg');
const sunNormal = new THREE.TextureLoader().load('2k_sun.jpg');

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(24, 64, 64),
  new THREE.MeshStandardMaterial({
    map: sunTexture,
    normalMap: sunNormal
  })
);
scene.add(sun);

sun.position.x = -90;
sun.position.y = 50;
sun.position.z = 90;

//Fog
scene.fog = new THREE.FogExp2(0xcccccc, 0.001);

//LIGHT

//Point
const pointLightMoon = new THREE.PointLight(0xebd394, 100, 500);
pointLightMoon.position.set(-30, 0, 30);

const pointLightSun = new THREE.PointLight(0xebd394, 100, 1000, 0.7);
pointLightSun.position.set(-90, 50, 90);
pointLightSun.castShadow = true;
pointLightSun.shadow.mapSize.width = 2048;
pointLightSun.shadow.mapSize.height = 2048;

//Spot
const spotLight = new THREE.SpotLight(0xffffff, 400);
spotLight.position.set(-20, 10, 15);
spotLight.castShadow = true;
spotLight.target = profile;

//Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);

scene.add(/*spotLight,*/ pointLightMoon, pointLightSun, /*ambientLight*/);

//HELPERS
//////////////////////////////////////////////////////////////////////////////////////

// const lightHelperSun = new THREE.PointLightHelper(pointLightSun);
// const lightHelperMoon = new THREE.PointLightHelper(pointLightMoon);
// const gridHelper = new THREE.GridHelper(200, 50);

// scene.add(lightHelperSun, lightHelperMoon, gridHelper);
// const controls = new OrbitControls(camera, renderer.domElement);

//////////////////////////////////////////////////////////////////////////////////////

// FILL BG WITH STARS
function addStar() {
  const starNormalTexture = new THREE.TextureLoader().load('normal.jpg');
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial
    ({
      color: 0xffffff,
      normalMap: starNormalTexture
    });
  const star = new THREE.Mesh(geometry, material);

  //Generate a random position for the star
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  star.castShadow = true;
  scene.add(star);
}

function addStarBig() {
  const starNormalTexture = new THREE.TextureLoader().load('normal.jpg');
  const geometry = new THREE.SphereGeometry(0.75, 24, 24);
  const material = new THREE.MeshStandardMaterial
    ({
      color: 0xffffff,
      normalMap: starNormalTexture
    });
  const star = new THREE.Mesh(geometry, material);

  //Generate a random position for the star
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  star.castShadow = true;
  scene.add(star);
}
// Generate 200 stars
Array(80).fill().forEach(addStar);
Array(10).fill().forEach(addStarBig);

//BACKGROUND

const spaceTexture = new THREE.TextureLoader().load('2k_stars_milky_way.jpg');
scene.background = spaceTexture;

//MOVE CAMERA

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  earth.rotation.y += 0.005;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.002;
  camera.position.y = t * 0.002;

  earth.position.y = Math.sin(camera.position.y / 4 - 0.5 * Math.PI) * 10 - 20;
  //pointLightEarth.position.y = earth.position.y;

  torus.position.set(camera.position.x, camera.position.y, camera.position.z - 6);
  profile.position.set(torus.position.x + 5.3, torus.position.y + 2, torus.position.z + 2);
}

document.body.onscroll = moveCamera;

//MOVE OBJECT

// Move moon

var forwardMoon = true;

function moveMoon(obj, light, speed) {

  const posMax = new THREE.Vector3(30, 0, 30);
  const posMin = new THREE.Vector3(-30, 0, -30);

  if (posMax.x < obj.position.x + speed && forwardMoon) {
    forwardMoon = false;
  }
  if (posMin.x > obj.position.x + speed && !forwardMoon) {
    forwardMoon = true;
  }
  if (forwardMoon) {
    obj.position.x += speed;
    const b = Math.abs(posMax.z - posMin.z) / 2;
    const a = Math.abs(posMax.x - posMin.x) / 2;
    obj.position.z = Math.sqrt((1 - (Math.pow(obj.position.x, 2) / Math.pow(a, 2))) * Math.pow(b, 2));

  }
  else {
    obj.position.x -= speed;
    const b = Math.abs(posMax.z - posMin.z) / 2;
    const a = Math.abs(posMax.x - posMin.x) / 2;
    obj.position.z = -1 * Math.sqrt((1 - (Math.pow(obj.position.x, 2) / Math.pow(a, 2))) * Math.pow(b, 2));
  }
  light.position.set(obj.position.x, obj.position.y, obj.position.z);
}

// Move sun

var forwardSun = true;

function moveSun(obj, light, speed) {

  const posMax = new THREE.Vector3(90, 50, 90);
  const posMin = new THREE.Vector3(-90, 50, -90);

  if (posMax.x < obj.position.x + speed && forwardSun) {
    forwardSun = false;
  }
  if (posMin.x > obj.position.x + speed && !forwardSun) {
    forwardSun = true;
  }
  if (forwardSun) {
    obj.position.x += speed;
    const b = Math.abs(posMax.z - posMin.z) / 2;
    const a = Math.abs(posMax.x - posMin.x) / 2;
    obj.position.z = Math.sqrt((1 - (Math.pow(obj.position.x, 2) / Math.pow(a, 2))) * Math.pow(b, 2));
  }
  else {
    obj.position.x -= speed;
    const b = Math.abs(posMax.z - posMin.z) / 2;
    const a = Math.abs(posMax.x - posMin.x) / 2;
    obj.position.z = -1 * Math.sqrt((1 - (Math.pow(obj.position.x, 2) / Math.pow(a, 2))) * Math.pow(b, 2));
  }
  light.position.set(obj.position.x, obj.position.y, obj.position.z);
}

// Move profile



//ANIMATE
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.0003;

  sun.rotation.x -= 0.0005;

  moon.rotation.x += 0.001;
  moon.rotation.y += 0.001;
  moon.rotation.z += 0.0002;

  const moonSpeed = 0.01;
  moveMoon(moon, pointLightMoon, moonSpeed);

  const sunSpeed = 0.1;
  moveSun(sun, pointLightSun, sunSpeed);

  //controls.update();

  renderer.render(scene, camera);
}

animate();
