//import './style.css'

import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass} from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';



//LoadingScreen
var RESOURCES_LOADED = false;

var loadingManager = new THREE.LoadingManager( () => {
    const loadingScreen = document.getElementById( 'planet' );
}
);

//camera, renderer, controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGL1Renderer(
  {
    canvas: document.querySelector('#background'),
    antialias: true
  }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);

camera.position.set(-100, 120, 240);
//camera.position.set(30, 10, 0);
renderer.render(scene, camera);

const controls = new OrbitControls( camera, renderer.domElement);
controls.minDistance = 100;
controls.maxDistance = 400;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = Math.PI / 4;   // 45 degrees
controls.maxPolarAngle = Math.PI / 2;   // 90 degrees
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;


//lights
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(0,0,0);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(pointLight, ambientLight);


//helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper);

//bloom renderer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2; //intensity of glow
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//background
const spaceTexture = new THREE.TextureLoader(loadingManager).load('./img/space.jpg');
scene.background = spaceTexture;


//Planet Selection
const raycaster = new THREE.Raycaster();
const hoverRaycaster = new THREE.Raycaster();
const hoverMouse = new THREE.Vector2();
const clickMouse = new THREE.Vector2();
var selectedPlanet = new THREE.Object3D();
var hoverPLanet = new THREE.Object3D();
var planetName = '';
var pivotName = new THREE.Object3D();
var pivotable = new THREE.Object3D();
var isPlanetSelected = false;
var cloudMesh = new THREE.Mesh();

Array(400).fill().forEach(addStar);

//Sun
const sunRad = 40;
const sun = new THREE.Mesh (
  new THREE.SphereGeometry(sunRad, 24, 24),
  new THREE.MeshBasicMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/sun.jpg'),
      side: THREE.DoubleSide
    }
)
);

sun.userData.planetName = 'Sun';
sun.name = 'sunPlanet';

//Mercury
const mercuryX = sunRad+20;
const mercury = new THREE.Mesh (
  new THREE.SphereGeometry(8, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/mercury.jpg')
    }
  )
);

mercury.userData.planetName = 'Mercury';


//Venus
const venusX = sunRad+40;
const venus = new THREE.Mesh (
  new THREE.SphereGeometry(8, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/venus.jpg')
    }
  )
);

venus.userData.planetName = 'Venus';

//Earth
const earthX = sunRad+65;
const earth = new THREE.Mesh (
  new THREE.SphereGeometry(10, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/earth.jpg'),
    }
  )
);


earth.userData.planetName = 'Earth';


//Mars
const marsX = sunRad+85;
const mars = new THREE.Mesh (
  new THREE.SphereGeometry(8, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/mars.jpg'),
    }
  )
);

mars.userData.planetName = 'Mars';

//Jupiter
const jupiterX = sunRad+120;
const jupiter = new THREE.Mesh (
  new THREE.SphereGeometry(20, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/jupiter.jpg')
    }
  )
);

jupiter.userData.planetName = 'Jupiter';

//Saturn
const saturnX = sunRad+170;
const saturn = new THREE.Mesh (
  new THREE.SphereGeometry(15, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/saturn.jpg')
    }
  )
);

saturn.userData.planetName = 'Saturn';
saturn.userData.selectable = true;

//Saturn Ring
const saturnRingX = saturnX;
const saturnTexture = new THREE.TextureLoader(loadingManager).load('./img/saturn_ring.png');
saturnTexture.rotation = 90 * Math.PI / 180;

const saturnRing = new THREE.Mesh (
  new THREE.TorusGeometry( 20, 3, 2, 200),
  new THREE.MeshStandardMaterial(
    {
      map: saturnTexture
    }
  )
);

saturnRing.userData.planetName = 'Saturn Ring';
saturnRing.userData.selectable = true;
saturnRing.rotation.x = 90 * Math.PI / 180;

const saturnWithRing = new THREE.Group();
saturnWithRing.add(saturn);
saturnWithRing.add(saturnRing);
saturnWithRing.userData.planetName = 'Saturn with Ring';

//Uranus
const uranusX = sunRad+200;
const uranus = new THREE.Mesh (
  new THREE.SphereGeometry(10, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/uranus.jpg')
    }
  )
);

uranus.userData.planetName = 'Uranus';

//Neptune
const neptuneX = sunRad+230;
const neptune = new THREE.Mesh (
  new THREE.SphereGeometry(10, 24, 24),
  new THREE.MeshStandardMaterial(
    {
      map : new THREE.TextureLoader(loadingManager).load('./img/neptune.jpg')
    }
  )
);

neptune.userData.planetName = 'Neptune';

var moonGlow = null;

//Planets' Positioning
var planets = [sun, mercury, venus, earth, mars, jupiter, saturnWithRing, uranus, neptune];
var planetsPosX = [0, mercuryX, venusX, earthX, marsX, jupiterX, saturnX, uranusX, neptuneX];

planets.forEach(planetXPosition);


//Make planets selectable
planets.forEach( (planet) => {
  if(planet.userData.planetName != 'Saturn with Ring')
  {
    planet.userData.selectable = true;
  }
  
});

//Planets' orbits
const mercuryOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( mercuryX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const venusOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( venusX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const earthOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( earthX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const marsOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( marsX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const jupiterOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( jupiterX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const saturnOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( saturnX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const uranusOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( uranusX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

const neptuneOrbit = new THREE.Mesh (
  new THREE.TorusGeometry( neptuneX, 0.5, 30, 200),
  new THREE.MeshBasicMaterial(
    {
      color: 0xe6e6e6,
      opacity: 0.4,
      transparent: true
    }
  )
);

//Planets' Orbit creation
var planetOrbits = [mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnOrbit, uranusOrbit, neptuneOrbit];
planetOrbits.forEach((orbit) => {
  orbit.rotation.x = 90 * Math.PI / 180;
  scene.add(orbit);
});

//Axis of rotation
const axis = new THREE.Vector3(0, 1, 0);
const saturn_axis = new THREE.Vector3(0, 0, 1);

//parent
var parent = new THREE.Object3D();

//Pivots Creation
var mercuryPivot = new THREE.Object3D();
var venusPivot = new THREE.Object3D();
var earthPivot = new THREE.Object3D();
var marsPivot = new THREE.Object3D();
var jupiterPivot = new THREE.Object3D();
var saturnWithRingPivot = new THREE.Group();
var uranusPivot = new THREE.Object3D();
var neptunePivot = new THREE.Object3D();

scene.add (parent);
mercuryPivot.add(mercury);
venusPivot.add(venus);
earthPivot.add(earth);
marsPivot.add(mars);
jupiterPivot.add(jupiter);
saturnWithRingPivot.add(saturnWithRing);
uranusPivot.add(uranus);
neptunePivot.add(neptune);

//Solar System Rotation around Sun
parent.add(mercuryPivot);
parent.add(venusPivot);
parent.add(earthPivot);
parent.add(marsPivot);
parent.add(jupiterPivot);
parent.add(saturnWithRingPivot);
//parent.add(saturnPivot);
//parent.add(saturnRingPivot);
parent.add(uranusPivot);
parent.add(neptunePivot);
parent.add(sun);

var planetPivots = [mercuryPivot, venusPivot, earthPivot, marsPivot, jupiterPivot, saturnWithRingPivot,  uranusPivot, neptunePivot];

mercury.userData.pivotName = mercuryPivot;
venus.userData.pivotName = venusPivot;
earth.userData.pivotName = earthPivot;
mars.userData.pivotName = marsPivot;
jupiter.userData.pivotName = jupiterPivot;
saturn.userData.pivotName = saturnWithRingPivot;
saturnRing.userData.pivotName = saturnWithRingPivot;
uranus.userData.pivotName = uranusPivot;
neptune.userData.pivotName = neptunePivot;

//One Earth's rotation around Sun
const yearEarth = 6 * Math.PI * (1/60) * (1/60);

//Make planets randomly positioned
planetOrbitPosition();
setPlanetsPivotable();

//EventListeners
//Planet Selector
document.addEventListener('click', event => {

    event.preventDefault();
    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( clickMouse, camera );
    let found = raycaster.intersectObjects ( scene.children, true );
    if (found.length > 0 && found[0].object.userData.selectable)
    {
      selectedPlanet = found[0].object;
      if (selectedPlanet.userData.planetName == 'Saturn' || selectedPlanet.userData.planetName == 'Saturn Ring') {
        selectedPlanet = saturnWithRing;
      }
      isPlanetSelected = true;
      console.log('Selected Planet', selectedPlanet.userData.planetName);
      localStorage.setItem('selectedPlanet', selectedPlanet.userData.planetName);
      location.href = './planet.html';
    }
  }
);

//Functions

//loadingManager
loadingManager.onLoad = function () {
    console.log('All resources Loaded.');
    RESOURCES_LOADED = true;
    animate();
}

//planets positioning
function planetOrbitPosition () {
  planetPivots.forEach((pivot) => {
    pivot.rotation.y += Math.floor(Math.random() * 100);
  })
}

//stars generator
function addStar () {
  const starGeometry = new THREE.SphereGeometry(0.25, 24, 24);
  const starMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff});
  const star = new THREE.Mesh(starGeometry, starMaterial);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 400 ));

  star.position.set(x,y,z);
  scene.add(star);
}

//Planet positioning
function planetXPosition(value, index)
{
  value.position.set (planetsPosX[index], 0, 0);
}
//Make all planets pivot around sun
function setPlanetsPivotable ()
{
  planetPivots.forEach((pivot) => {
    pivot.userData.pivotable = true;
  });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function createEarth()
{
  camera.position.set(20,0,0);
  var cloudGeometry   = new THREE.SphereGeometry(5.1, 24, 24);
  var cloudMaterial  = new THREE.MeshPhongMaterial({
  map     : new THREE.TextureLoader(loadingManager).load('./img/clouds.png'),
  side        :  THREE.DoubleSide,
  opacity     : 0.8,
  transparent : true,
  depthWrite  : false,
})
cloudMesh.material = cloudMaterial;
cloudMesh.geometry = cloudGeometry;
earth.add(cloudMesh);

}

function animate() {

  requestAnimationFrame(animate);
  //Speed of rotation around the sun
  mercuryPivot.rotation.y += yearEarth * 1.5;
  venusPivot.rotation.y += yearEarth * 1.5;
  earthPivot.rotation.y += yearEarth;
  marsPivot.rotation.y += yearEarth * 0.5;
  jupiterPivot.rotation.y += yearEarth * 1/12;
  saturnWithRingPivot.rotation.y += yearEarth * 1/29;
  uranusPivot.rotation.y += yearEarth * 1/84;
  neptunePivot.rotation.y += yearEarth * 1/165;

  //Rotation around planet self
  sun.rotation.y += 0.001;

  planets.forEach((planet) => {
   if (planet.userData.planetName != 'sun')
    {
      planet.rotateOnAxis (axis, 0.006);
    }
  });

  controls.update();
  renderer.render (scene, camera);

}

