import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(-33, 22, 1.8); // Artık doğru yerde tanımlandı

export default class SectionConcert {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, car, passes, camera, zones, time, areas }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;
    this.passes = passes;
    this.camera = camera;
    this.zones = zones;
    this.car = car;
    this.time = time;
    this.areas = areas;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.container = new THREE.Object3D();
    this.position = DEFAULT_POSITION.clone();

    this._buildModel();
    this.scene.add(this.container);

    this._createPopup()
    this._setZone()
  }

  _buildModel() {
    const gltf = this.resources.items.Concert;
    if (!gltf || !gltf.scene) {
      console.error('Konser modeli bulunamadı');
      return;
    }

    // Modeli klonla ve malzemeleri kopyala
    const model = gltf.scene.clone(true);
    model.traverse(child => {
      if (child.isMesh) {
        const origMat = child.material;
        const mat = origMat.clone();
        if (origMat.map) mat.map = origMat.map;
        if (origMat.normalMap) mat.normalMap = origMat.normalMap;
        if (origMat.roughnessMap) mat.roughnessMap = origMat.roughnessMap;
        if (origMat.metalnessMap) mat.metalnessMap = origMat.metalnessMap;
        mat.needsUpdate = true;
        child.material = mat;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Model pozisyonu ve dönüşü
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    this.container.add(model);

    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());

    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x / 2.5, size.y / 2.5, 1.2); // Modelin boyutlarına göre dikdörtgen collision
    const boxShape = new CANNON.Box(halfExtents);

    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(this.position.x, this.position.y, 0),
      material: this.physics.materials.items.floor
    });

    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    body.quaternion.copy(quat);

    body.addShape(boxShape);
    this.physics.world.addBody(body);

    // Obje sistemine ekle
    if (this.objects) {
      const children = model.children.slice();
      const objectEntry = this.objects.add({
        base: { children },
        collision: { children },
        offset: this.position.clone(),
        mass: 0
      });
      objectEntry.collision = { body };
      if (objectEntry.container) {
        this.container.add(objectEntry.container);
      }
    }
  }

  _createPopup() {
    this.playButton = new PlayButton("♫⋆｡♪ ₊˚♬ ﾟ.", () => {
      const body = this.areas.car.physics.car.chassis.body;
      body.position.copy(new CANNON.Vec3(-32.5, 21.5, 1.8));
      body.quaternion.copy(new CANNON.Quaternion(0, 0, -Math.PI / 3, 1));
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
      body.wakeUp();
    });

    this.time.on('tick', () => {
      
      const distance = this.car.position.distanceTo(this.position);

      if (distance < 10) {
        this.playButton.enable();
      } else {
        this.playButton.disable();
      }
      
      if (!this.dancing) return;
      
      const deltaTime = this.time.delta / 1000;
      this.danceTimer += deltaTime;
      
      // Make the car jump every ~1s
      if (this.danceTimer >= 0.8) {
        this.physics.car.jump(true, 30);
        this.danceTimer = 0;

        const randomToggle = Math.random() > 0.5 ? 1 : 0;
        this.rotationToggle = randomToggle === 1;
        const angle = this.rotationToggle ? Math.PI / 48 : -Math.PI / 48;
        this.areas.car.physics.car.chassis.body.quaternion.x = angle
      }
    });
  }

  _setZone() {
    this.sectionConcertSound = new Howl({
      src: ['./sounds/SectionConcert/sound.mp3'],
      loop: true,
      volume: 1
    });

    this.dancing = false;
    this.danceTime = 0;

    const zone = this.zones.add({
      position: { x: this.position.x, y: this.position.y },
      halfExtents: { x: 2, y: 2 },
    });

    zone.on('in', (_data) => {
      this.sectionConcertSound.play();
      this.dancing = true;
      this.danceTimer = 0;
    });

    zone.on('out', () => {
      this.sectionConcertSound.stop();
      this.dancing = false;
    });
  }
}

class PlayButton {
  constructor(text, onclick) {
    // Create style element
    this.style = document.createElement("style");
    this.style.textContent = `
      .rainbow-button-wrapper {
        position: absolute;
        bottom: -100px; /* Start hidden for animation */
        left: 50%;
        transform: translateX(-50%);
        transition: bottom 0.5s ease-in-out, opacity 0.5s ease-in-out;
        opacity: 0;
        z-index: 9999;
      }

      .rainbow-button {
        width: 200px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        color: #fff;
        font-size: 24px;
        text-transform: uppercase;
        text-decoration: none;
        font-family: sans-serif;
        box-sizing: border-box;
        background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
        background-size: 400%;
        border-radius: 30px;
        position: relative;
        z-index: 1;
        transition: 0.5s;
        animation: rainbow-glow 8s linear infinite;
        cursor: pointer;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
      }

      .rainbow-button::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        z-index: -1;
        background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
        background-size: 400%;
        border-radius: 40px;
        transition: 0.5s;
        filter: blur(20px);
        opacity: 1;
        animation: rainbow-glow 8s linear infinite;
      }

      @keyframes rainbow-glow {
        0% {
          background-position: 0%;
        }
        100% {
          background-position: 400%;
        }
      }
    `;
    document.head.appendChild(this.style);

    // Create button wrapper and element
    this.wrapper = document.createElement("div");
    this.wrapper.className = "rainbow-button-wrapper";

    this.button = document.createElement("div");
    this.button.className = "rainbow-button";
    this.button.textContent = text;

    this.button.addEventListener("click", onclick)

    this.wrapper.appendChild(this.button);
    document.body.appendChild(this.wrapper);

    // Auto-enable on init
    requestAnimationFrame(() => this.enable());
  }

  enable() {
    this.wrapper.style.bottom = "20px";
    this.wrapper.style.opacity = "1";
  }

  disable() {
    this.wrapper.style.bottom = "-100px";
    this.wrapper.style.opacity = "0";
  }
}