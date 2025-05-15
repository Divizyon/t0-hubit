import * as THREE from 'three';
import CANNON from 'cannon';

// Default pozisyonları ayarlayabilirsiniz
// Yol kenarında ve uygun yükseklikte konumlandırıldı
const DEFAULT_POSITION = new THREE.Vector3(16, -14, -0.2);
const SECOND_POSITION = new THREE.Vector3(30, -31.9, -0.2);

export default class SectionTrafficLight {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, position = 'default' }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.container = new THREE.Object3D();
    // Container'da ölçeklendirme yapmıyoruz, sadece modelde yapacağız
    // this.container.scale.set(0.2, 0.2, 0.2);
    
    // Pozisyon seçimi
    if (position === 'second') {
      this.position = SECOND_POSITION.clone();
    } else {
      this.position = DEFAULT_POSITION.clone();
    }

    // Debug kontrolleri ekle
    if (this.debug) {
      this.setupDebug();
    }

    this._buildModel();
    this.scene.add(this.container);
  }

  setupDebug() {
    this.debugFolder = this.debug.addFolder('TrafficLight');
    
    // Pozisyon kontrolü
    this.debugFolder.add(this.position, 'x').step(1).min(-100).max(100).name('positionX')
      .onChange(() => this.updatePosition());
    this.debugFolder.add(this.position, 'y').step(1).min(-100).max(100).name('positionY')
      .onChange(() => this.updatePosition());
    this.debugFolder.add(this.position, 'z').step(1).min(-100).max(100).name('positionZ')
      .onChange(() => this.updatePosition());
    
    // Ölçek kontrolü
    this.scale = { value: 1 };
    this.debugFolder.add(this.scale, 'value').step(0.1).min(0.1).max(5).name('scale')
      .onChange(() => this.updateScale());
    
    // Rotasyon kontrolü
    this.rotation = { 
      x: this.rotateX, 
      y: this.rotateY, 
      z: this.rotateZ 
    };
    
    this.debugFolder.add(this.rotation, 'x').step(0.1).min(-Math.PI).max(Math.PI).name('rotationX')
      .onChange(() => this.updateRotation());
    this.debugFolder.add(this.rotation, 'y').step(0.1).min(-Math.PI).max(Math.PI).name('rotationY')
      .onChange(() => this.updateRotation());
    this.debugFolder.add(this.rotation, 'z').step(0.1).min(-Math.PI).max(Math.PI).name('rotationZ')
      .onChange(() => this.updateRotation());
  }

  updatePosition() {
    if (this.model) {
      this.model.position.copy(this.position);
      
      // Fizik gövdesi varsa onu da güncelle
      if (this.body) {
        this.body.position.copy(new CANNON.Vec3(
          this.position.x,
          this.position.y,
          this.position.z
        ));
      }
    }
  }

  updateScale() {
    if (this.model) {
      this.model.scale.set(this.scale.value, this.scale.value, this.scale.value);
    }
  }

  updateRotation() {
    if (this.model) {
      this.model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      
      // Fizik gövdesi varsa onu da güncelle
      if (this.body) {
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(this.rotation.x, this.rotation.y, this.rotation.z, 'XYZ');
        this.body.quaternion.copy(quat);
      }
    }
  }
  
  _buildModel() {
    const gltf = this.resources.items.TrafficLight;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('TrafficLight modeli bulunamadı');
      return;
    }
  
    if (!base || !base.scene) {
      console.error('Base modeli bulunamadı');
      return;
    }
  
    try {
      // Farklı bir yaklaşım - Model grubunu kendiniz oluşturup ölçekleyin
      const group = new THREE.Group();
      const model = gltf.scene.clone(true);
      this.model = model;
      
      // Modeli çok küçük bir boyuta ölçekle
      model.scale.set(0.13, 0.13, 0.13);
      
      // Materyalleri ayarla
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
      
      // Modeli gruba ekle
      group.add(model);
      
      // Fizik hesaplamalarını basitleştirmek için daha küçük değerler kullan
      const halfExtents = new CANNON.Vec3(0.1, 0.1, 0.1);
      const boxShape = new CANNON.Box(halfExtents);
      
      const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
        material: this.physics.materials.items.floor
      });
      
      this.body = body;
      
      // Rotasyonu ayarla
      const quat = new CANNON.Quaternion();
      quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
      body.quaternion.copy(quat);
      
      // Fizik gövdesine şekil ekle
      body.addShape(boxShape);
      this.physics.world.addBody(body);
      
      // Son pozisyon ve rotasyon ayarları
      group.position.copy(this.position);
      group.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
      
      // Grubu sahneye ekle
      this.container.add(group);
      this.scene.add(this.container);
      
      console.log("TrafficLight modeli başarıyla yerleştirildi, boyut:", model.scale);
      
    } catch (error) {
      console.error("TrafficLight oluşturma hatası:", error);
    }
    
    // Debug değerleri
    if (this.debug) {
      this.scale = { value: 0.01 };
      this.rotation = {
        x: this.rotateX,
        y: this.rotateY,
        z: this.rotateZ
      };
    }
  }
} 