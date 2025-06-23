import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

const canvasContainer = document.querySelector('#canvasContainer');
const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector('#planetCanvas'),
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

const scene = new THREE.Scene();
scene.background = new THREE.TextureLoader().load('./img/space.jpg');

const camera = new THREE.PerspectiveCamera(75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000);
camera.position.set(2, 1, 6);

const controls = new OrbitControls(camera, renderer.domElement);

// Lights
function addSceneLights() {
    const lights = [
        new THREE.AmbientLight(0xffffff),
        new THREE.PointLight(0xffffff, 0.7).position.set(0, 0, 80),
        new THREE.PointLight(0xffffff, 0.7).position.set(0, 0, -80),
        new THREE.PointLight(0xffffff, 0.7).position.set(80, 0, 0),
        new THREE.PointLight(0xffffff, 0.7).position.set(-80, 0, 0),
        new THREE.PointLight(0xffffff, 0.7).position.set(0, 80, 0),
        new THREE.PointLight(0xffffff, 0.7).position.set(0, -80, 0)
    ];
    lights.forEach(light => scene.add(light));
}
addSceneLights();

// Planet Setup
const planetGeometry = new THREE.SphereGeometry(2, 64, 32);
let planet = new THREE.Mesh(planetGeometry);
scene.add(planet);

const resizeObserver = new ResizeObserver(() => {
    const width = canvasContainer.offsetWidth;
    const height = canvasContainer.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
resizeObserver.observe(canvasContainer);


// Add-ons
const cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.03, 24, 24),
    new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('./img/clouds.png'),
        opacity: 0.4,
        transparent: true,
    })
);

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 24),
    new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('./img/moon.jpg'),
        normalMap: new THREE.TextureLoader().load('./img/moon_normal.jpg'),
        shininess: 1,
        reflectivity: 0.02
    })
);
moon.position.set(2.8, 0.6, 0);

const saturnRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.4, 2, 200),
    new THREE.MeshPhongMaterial({
        map: (() => {
            const tex = new THREE.TextureLoader().load('./img/saturn_ring.png');
            tex.rotation = Math.PI / 2;
            return tex;
        })()
    })
);
saturnRing.rotation.x = Math.PI * 1.5;

// Planet materials config
const planetConfigs = {
    Earth: {
        texture: './img/earth.jpg',
        bump: './img/earth_bump.jpg',
        specular: './img/earth_specular.jpg',
        addons: [cloudMesh, moon]
    },
    Sun: {
        texture: './img/sun.jpg',
        normal: './img/sun_normal.jpg',
    },
    Mercury: {
        texture: './img/mercury.jpg',
        normal: './img/mercury_normal.png'
    },
    Venus: {
        texture: './img/venus.jpg',
        normal: './img/venus_normal.png'
    },
    Mars: {
        texture: './img/mars.jpg',
        normal: './img/mars_normal.jpg'
    },
    Jupiter: {
        texture: './img/jupiter.jpg'
    },
    'Saturn with Ring': {
        texture: './img/saturn.jpg',
        addons: [saturnRing]
    },
    Uranus: {
        texture: './img/uranus.jpg'
    },
    Neptune: {
        texture: './img/neptune.jpg'
    }
};

// Material builder
function buildPlanetMaterial({ texture, bump, normal, specular }) {
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshPhongMaterial({
        map: loader.load(texture),
        bumpMap: bump ? loader.load(bump) : null,
        normalMap: normal ? loader.load(normal) : null,
        specularMap: specular ? loader.load(specular) : null,
        shininess: 1,
        reflectivity: 0.02
    });

    ['map', 'bumpMap', 'normalMap', 'specularMap'].forEach(key => {
        if (material[key]) {
            material[key].minFilter = THREE.LinearMipMapLinearFilter;
            material[key].magFilter = THREE.LinearFilter;
            material[key].anisotropy = renderer.capabilities.getMaxAnisotropy();
        }
    });

    return material;
}

// Setup selected planet
function setupPlanet(name) {
    const config = planetConfigs[name];
    if (!config) {
        planet.visible = false;
        return;
    }

    planet.material = buildPlanetMaterial(config);

    if (config.addons) {
        config.addons.forEach(child => planet.add(child));
    }

    scene.add(planet);
}
const myPlanetName = localStorage.getItem('selectedPlanet');
setupPlanet(myPlanetName);
generateInfo(myPlanetName);

// Animate
function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += 0.004;
    moon.rotation.y += 0.009;
    cloudMesh.rotation.y += 0.008;
    saturnRing.rotation.z -= 0.004;
    renderer.render(scene, camera);
}
animate();

// Info
function generateInfo(name) {
    const title = document.getElementById('planetName');
    const info = document.getElementById('planetInfo');
    title.textContent = name === 'Saturn with Ring' ? 'Saturn' : name;

    const descriptions = {
        Sun: "The Sun is a 4.5 billion-year-old star – a hot glowing ball of hydrogen and helium at the center of our solar system. It is about 93 million miles (150 million kilometers) from Earth, and without its energy, life as we know it could not exist here on our home planet.<br><br>The Sun is the largest object in our solar system. The Sun’s volume would need 1.3 million Earths to fill it. Its gravity holds the solar system together, keeping everything from the biggest planets to the smallest bits of debris in orbit around it. The hottest part of the Sun is its core, where temperatures top 27 million degrees Fahrenheit (15 million degrees Celsius).<br><br> The Sun’s activity, from its powerful eruptions to the steady stream of charged particles it sends out, influences the nature of space throughout the solar system. NASA and other international space agencies monitor the Sun 24",
        Mercury: 'The smallest planet in our solar system and nearest to the Sun, Mercury is only slightly larger than Earth\'s Moon.<br><br>From the surface of Mercury, the Sun would appear more than three times as large as it does when viewed from Earth, and the sunlight would be as much as seven times brighter. Despite its proximity to the Sun, Mercury is not the hottest planet in our solar system – that title belongs to nearby Venus, thanks to its dense atmosphere.<br><br>Because of Mercury\'s elliptical – egg-shaped – orbit, and sluggish rotation, the Sun appears to rise briefly, set, and rise again from some parts of the planet\'s surface. The same thing happens in reverse at sunset.',
        Venus: 'Venus is the second planet from the Sun and is Earth’s closest planetary neighbor. It’s one of the four inner, terrestrial (or rocky) planets, and it’s often called Earth’s twin because it’s similar in size and density. These are not identical twins, however – there are radical differences between the two worlds.<br><br>Venus has a thick, toxic atmosphere filled with carbon dioxide and it’s perpetually shrouded in thick, yellowish clouds of sulfuric acid that trap heat, causing a runaway greenhouse effect. It’s the hottest planet in our solar system, even though Mercury is closer to the Sun. Surface temperatures on Venus are about 900 degrees Fahrenheit (475 degrees Celsius) – hot enough to melt lead. The surface is a rusty color and it’s peppered with intensely crunched mountains and thousands of large volcanoes. Scientists think it’s possible some volcanoes are still active.<br><br>Venus has crushing air pressure at its surface – more than 90 times that of Earth – similar to the pressure you\'d encounter a mile below the ocean on Earth.',
        Earth: 'Earth is the third planet from the Sun, and the only place we know of so far that’s inhabited by living things.<br><br>While Earth is only the fifth largest planet in the solar system, it is the only world in our solar system with liquid water on the surface. Just slightly larger than nearby Venus, Earth is the biggest of the four planets closest to the Sun, all of which are made of rock and metal.<br><br>The name Earth is at least 1,000 years old. All of the planets, except for Earth, were named after Greek and Roman gods and goddesses. However, the name Earth is a Germanic word, which simply means “the ground.”',
        Mars: 'Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere. Mars is also a dynamic planet with seasons, polar ice caps, canyons, extinct volcanoes, and evidence that it was even more active in the past.<br><br>Mars is one of the most explored bodies in our solar system, and it\'s the only planet where we\'ve sent rovers to roam the alien landscape.<br><br>NASA currently has two rovers (Curiosity and Perseverance), one lander (InSight), and one helicopter (Ingenuity) exploring the surface of Mars.',
        Jupiter: 'Jupiter has a long history of surprising scientists – all the way back to 1610 when Galileo Galilei found the first moons beyond Earth. That discovery changed the way we see the universe.<br><br>Fifth in line from the Sun, Jupiter is, by far, the largest planet in the solar system – more than twice as massive as all the other planets combined.<br><br>Jupiter\'s familiar stripes and swirls are actually cold, windy clouds of ammonia and water, floating in an atmosphere of hydrogen and helium. Jupiter’s iconic Great Red Spot is a giant storm bigger than Earth that has raged for hundreds of years.<br><br>One spacecraft – NASA\'s Juno orbiter – is currently exploring this giant world.',
        'Saturn with Ring': 'Saturn is the sixth planet from the Sun and the second-largest planet in our solar system.<br><br>Adorned with thousands of beautiful ringlets, Saturn is unique among the planets. It is not the only planet to have rings – made of chunks of ice and rock – but none are as spectacular or as complicated as Saturn\'s.<br><br>Like fellow gas giant Jupiter, Saturn is a massive ball made mostly of hydrogen and helium.',
        Uranus: 'Uranus is the seventh planet from the Sun, and has the third-largest diameter in our solar system. It was the first planet found with the aid of a telescope, Uranus was discovered in 1781 by astronomer William Herschel, although he originally thought it was either a comet or a star.<br><br>It was two years later that the object was universally accepted as a new planet, in part because of observations by astronomer Johann Elert Bode. Herschel tried unsuccessfully to name his discovery Georgium Sidus after King George III. Instead, the scientific community accepted Bode\'s suggestion to name it Uranus, the Greek god of the sky, as suggested by Bode.\u200B',
        Neptune: 'Dark, cold, and whipped by supersonic winds, ice giant Neptune is the eighth and most distant planet in our solar system.<br><br>More than 30 times as far from the Sun as Earth, Neptune is the only planet in our solar system not visible to the naked eye and the first predicted by mathematics before its discovery. In 2011 Neptune completed its first 165-year orbit since its discovery in 1846.<br><br>NASA\'s Voyager 2 is the only spacecraft to have visited Neptune up close. It flew past in 1989 on its way out of the solar system.',
    };

    info.innerHTML = descriptions[name] || 'Complete nothingness.';
}
