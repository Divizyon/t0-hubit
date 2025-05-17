import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(0, 20, 0);

export default class SectionSoccer {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, scale }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;
    this.scale = scale;

    this.container = new THREE.Object3D();
    this.position = DEFAULT_POSITION.clone();

    this._createModel();
    this._buildModel();
    this._addSoccerBall(); // Topu ekle
    this.scene.add(this.container);
  }

  _addGoalDetection() {
      const goalWidth = 7.32;
      const goalHeight = 2.44;
      const goalDepth = 2;

      const goalShape = new CANNON.Box(new CANNON.Vec3(goalWidth / 2, goalHeight / 2, goalDepth / 2));
      const goalBody = new CANNON.Body({
          mass: 0,
          shape: goalShape,
          position: new CANNON.Vec3(0, goalHeight / 2, 52.5 - goalDepth / 2),
      });

      this.physics.world.addBody(goalBody);

      goalBody.addEventListener('collide', (event) => {
          if (event.body === this.ball.body) {
              this._showGoalMessage();
          }
      });
  }

  _showGoalMessage() {
      const goalMessage = document.createElement('div');
      goalMessage.innerText = 'GOL!';
      goalMessage.style.position = 'absolute';
      goalMessage.style.top = '50%';
      goalMessage.style.left = '50%';
      goalMessage.style.transform = 'translate(-50%, -50%)';
      goalMessage.style.fontSize = '48px';
      goalMessage.style.color = 'red';
      goalMessage.style.fontWeight = 'bold';
      goalMessage.style.zIndex = '1000';
      document.body.appendChild(goalMessage);

      setTimeout(() => {
          document.body.removeChild(goalMessage);
      }, 2000);
  }
    
  _createModel() {
    // Yarım futbol sahası boyutları (metre cinsinden)
    const fieldWidth = 34; // Tam genişlik 68m
    const fieldLength = 52.5; // Tam uzunluk 105m, yarısı 52.5m
    
    // Zemin oluşturma
    const fieldGeometry = new THREE.PlaneGeometry(fieldWidth, fieldLength);
    
    // Texture'ı yükle
    const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
          './models/SectionSoccer/background.jpg',
          (texture) => {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.repeat.set(1, 1);
              
              const fieldMaterial = new THREE.MeshStandardMaterial({ 
                  map: texture,
                  roughness: 0.8,
                  metalness: 0.2,
                  side: THREE.DoubleSide
              });
              
              const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
              field.rotation.x = -Math.PI;
              field.receiveShadow = true;
              field.position.y = 0.01;
              this.container.add(field);
          },
          undefined,
          (error) => {
              console.error('Texture yüklenirken hata oluştu:', error);
              const fieldMaterial = new THREE.MeshStandardMaterial({ 
                  color: 0x00ff00,
                  roughness: 0.8,
                  metalness: 0.2,
                  side: THREE.DoubleSide
              });
              
              const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
              field.rotation.x = 0;
              field.receiveShadow = true;
              field.position.y = 0;
              field.position.z = 0;
              this.container.add(field);
          }
      );
    
    this._createFieldLines(fieldWidth, fieldLength);
    
    this._addGoalModel();
    
    this._addLights();
  }

  _addLights() {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 0);
      directionalLight.castShadow = true;
      this.container.add(directionalLight);
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.container.add(ambientLight);
  }

  _createFieldLines(fieldWidth, fieldLength) {
      const lineMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFFFFF,
          side: THREE.DoubleSide
      });
      const lineWidth = 0.25;
      
      const lineHeight = 0.02;
      
      this._createLine(fieldWidth, lineWidth, 0, -fieldLength/2, false, lineHeight); // Alt çizgi
      this._createLine(fieldWidth, lineWidth, 0, fieldLength/2, false, lineHeight); // Üst çizgi
      this._createLine(lineWidth, fieldLength, -fieldWidth/2, -26.3, true, lineHeight); // Sol çizgi
      this._createLine(lineWidth, fieldLength, fieldWidth/2, -26.3, true, lineHeight); // Sağ çizgi
      
      // Orta saha çizgisi
      this._createLine(fieldWidth, lineWidth, 0, 0, false, lineHeight);
      
      // Orta saha dairesi
      const centerCircleRadius = 9.15;
      const centerCircle = new THREE.RingGeometry(centerCircleRadius - lineWidth/2, centerCircleRadius + lineWidth/2, 64);
      const centerCircleMesh = new THREE.Mesh(centerCircle, lineMaterial);

      centerCircleMesh.rotation.x = 0;
      centerCircleMesh.position.y = 0;
      centerCircleMesh.position.z = lineHeight;
      this.container.add(centerCircleMesh);
      
      // Ceza sahası
      const penaltyBoxWidth = 22.75;
      const penaltyBoxLength = 9;
      this._createLine(penaltyBoxWidth, lineWidth, 0, fieldLength/2 - penaltyBoxLength/2 -4.6, false, lineHeight); // Üst çizgi
      this._createLine(lineWidth, penaltyBoxLength, -penaltyBoxWidth/2 , fieldLength/2 - penaltyBoxLength/2 -4.6, true, lineHeight); // Sol çizgi
      this._createLine(lineWidth, penaltyBoxLength, penaltyBoxWidth/2 , fieldLength/2 - penaltyBoxLength/2 -4.6, true, lineHeight); // Sağ çizgi
      
      // Kale sahası
      const goalAreaWidth = 18.32;
      const goalAreaLength = 5.5;
      this._createLine(goalAreaWidth, lineWidth, 0, fieldLength/2 - goalAreaLength/2 -2.8, false, lineHeight); // Üst çizgi
      this._createLine(lineWidth, goalAreaLength, -goalAreaWidth/2, fieldLength/2 - goalAreaLength/2 -2.8, true, lineHeight); // Sol çizgi
      this._createLine(lineWidth, goalAreaLength, goalAreaWidth/2, fieldLength/2 - goalAreaLength/2 -2.8, true, lineHeight); // Sağ çizgi
      
      // Penaltı noktası
      const penaltySpot = new THREE.CircleGeometry(lineWidth * 2, 32);
      const penaltySpotMesh = new THREE.Mesh(penaltySpot, lineMaterial);

      penaltySpotMesh.rotation.x = 0;
      penaltySpotMesh.position.set(0, fieldLength/2 - 8, lineHeight);
      this.container.add(penaltySpotMesh);
      
      // Köşe yayları
      const cornerRadius = 1;
      const cornerSegments = new THREE.Shape();
      cornerSegments.absarc(0, 0, cornerRadius, 0, Math.PI/2, false);
      const cornerGeometry = new THREE.ShapeGeometry(cornerSegments);
      
      // Sağ üst köşe
      const cornerTopRight = new THREE.Mesh(cornerGeometry, lineMaterial);

      cornerTopRight.rotation.x = 0;
      cornerTopRight.position.set(fieldWidth/2 - cornerRadius, fieldLength/2 - cornerRadius, lineHeight); // Y ekseninde pozisyonla
      this.container.add(cornerTopRight);
      
      // Sol üst köşe
      const cornerTopLeft = new THREE.Mesh(cornerGeometry.clone(), lineMaterial);

      cornerTopLeft.rotation.x = 0;
      cornerTopLeft.rotation.z = Math.PI/2;
      cornerTopLeft.position.set(-fieldWidth/2 + cornerRadius, fieldLength/2 - cornerRadius, lineHeight); // Y ekseninde pozisyonla
      this.container.add(cornerTopLeft);
  }

  _createLine(width, height, x, z, isVertical = false, yPosition = 0.02) {
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ 
          color: 0xFFFFFF,
          side: THREE.DoubleSide
      });
      const line = new THREE.Mesh(geometry, material);
      
      line.rotation.x = 0;
      
      if (isVertical) {
          line.position.set(x, z + height/2, yPosition);
      } else {
          line.position.set(x, z, yPosition);
      }
      
      this.container.add(line);
      return line;
  }
  
  _buildModel() {
    this.container.position.copy(this.position);

    this.container.rotation.x = 0;
    this.container.rotation.y = this.rotateY;
    this.container.rotation.z = this.rotateZ;
    
    this.container.scale.set(this.scale, this.scale, this.scale);
    
    this._createModel();
    this._addGoalDetection();
  }
  
  _addGoalModel() {
    const gltf = this.resources.items.SectionSoccerGoal;

    if (!gltf) {
        console.error('Futbol kalesi modeli yüklenemedi!');
        return;
    }

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
      if(child instanceof THREE.Mesh && 
        (child.name === 'pureUc' || child.name === 'Cube.002')) {
          this.greenScreenMesh = child;
      }
    });

    model.position.set(this.position.x - 1.65, this.position.y + 7.1, this.position.z - .3);
    model.rotation.set(0, this.rotateY, this.rotateZ + -Math.PI/2); 
    model.scale.set(1, 1.5, 1);
    
    this.scene.add(model);
    this.goalModel = model;
  }

  _addSoccerBall() {
    const gltf = this.resources.items.SectionSoccerBall;

    if (!gltf) {
        console.error('Top modeli yüklenemedi!');
        return;
    }

    const model = gltf.scene.clone(true);
    model.scale.set(1, 1, 1);
    model.position.set(0, -0.2, 0.3);
    this.container.add(model);
  }

  update() {
    if (this.collisionBody && this.soccerBallModel) {
        this.soccerBallModel.position.copy(this.collisionBody.position);
        this.soccerBallModel.quaternion.copy(this.collisionBody.quaternion);
    }
}
}