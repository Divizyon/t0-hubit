import * as THREE from 'three';
import CANNON from 'cannon';

// Default pozisyonları ayarlayabilirsiniz
// Toplam 10 Lego parçası için pozisyonlar - 6 kırmızı, 4 sarı
const DEFAULT_POSITION = new THREE.Vector3(48.6, 10.4, 1.9);      // İlk parça (kırmızı)
const SECOND_POSITION = new THREE.Vector3(48, 10.1, 1.9);         // İkinci parça (sarı)
const THIRD_POSITION = new THREE.Vector3(47.4, 9.5, 1.9);         // Üçüncü parça (kırmızı)
const FOURTH_POSITION = new THREE.Vector3(46.77, 10.1, 1.9);      // Dördüncü parça (sarı)
const FIFTH_POSITION = new THREE.Vector3(46.13, 10.4, 1.9);       // Beşinci parça (kırmızı)
const SIXTH_POSITION = new THREE.Vector3(48.6, 11, 1.9);        // Altıncı parça (kırmızı)
const SEVENTH_POSITION = new THREE.Vector3(46.13, 11, 1.9);     // Yedinci parça (kırmızı)
const EIGHTH_POSITION = new THREE.Vector3(46.78, 9.6, 1.9);       // Sekizinci parça (sarı - 2. sarı parçanın altında)
const NINTH_POSITION = new THREE.Vector3(48, 9.6, 1.9);       // Dokuzuncu parça (sarı - 4. sarı parçanın altında)
const TENTH_POSITION = new THREE.Vector3(47.4, 9, 1.9);        // Onuncu parça (kırmızı - 1. kırmızı parçanın altında)

// İkinci set için pozisyonlar (boş alan için) - sağ taraf
const RIGHT_SET_OFFSET = 20; // X ekseninde kaydırma miktarı
const RIGHT_Y_OFFSET = 0; // Y ekseninde kaydırma miktarı (geriye doğru almak için)

// İlk setteki pozisyonları kullanarak sağ seti oluştur
const RIGHT_DEFAULT_POSITION = new THREE.Vector3(DEFAULT_POSITION.x + RIGHT_SET_OFFSET, DEFAULT_POSITION.y + RIGHT_Y_OFFSET, DEFAULT_POSITION.z);
const RIGHT_SECOND_POSITION = new THREE.Vector3(SECOND_POSITION.x + RIGHT_SET_OFFSET, SECOND_POSITION.y + RIGHT_Y_OFFSET, SECOND_POSITION.z);
const RIGHT_THIRD_POSITION = new THREE.Vector3(THIRD_POSITION.x + RIGHT_SET_OFFSET, THIRD_POSITION.y + RIGHT_Y_OFFSET, THIRD_POSITION.z);
const RIGHT_FOURTH_POSITION = new THREE.Vector3(FOURTH_POSITION.x + RIGHT_SET_OFFSET, FOURTH_POSITION.y + RIGHT_Y_OFFSET, FOURTH_POSITION.z);
const RIGHT_FIFTH_POSITION = new THREE.Vector3(FIFTH_POSITION.x + RIGHT_SET_OFFSET, FIFTH_POSITION.y + RIGHT_Y_OFFSET, FIFTH_POSITION.z);
const RIGHT_SIXTH_POSITION = new THREE.Vector3(SIXTH_POSITION.x + RIGHT_SET_OFFSET, SIXTH_POSITION.y + RIGHT_Y_OFFSET, SIXTH_POSITION.z);
const RIGHT_SEVENTH_POSITION = new THREE.Vector3(SEVENTH_POSITION.x + RIGHT_SET_OFFSET, SEVENTH_POSITION.y + RIGHT_Y_OFFSET, SEVENTH_POSITION.z);
const RIGHT_EIGHTH_POSITION = new THREE.Vector3(EIGHTH_POSITION.x + RIGHT_SET_OFFSET, EIGHTH_POSITION.y + RIGHT_Y_OFFSET, EIGHTH_POSITION.z);
const RIGHT_NINTH_POSITION = new THREE.Vector3(NINTH_POSITION.x + RIGHT_SET_OFFSET, NINTH_POSITION.y + RIGHT_Y_OFFSET, NINTH_POSITION.z);
const RIGHT_TENTH_POSITION = new THREE.Vector3(TENTH_POSITION.x + RIGHT_SET_OFFSET, TENTH_POSITION.y + RIGHT_Y_OFFSET, TENTH_POSITION.z);

// Üçüncü set için pozisyonlar (sol taraf)
const LEFT_SET_OFFSET = -9; // X ekseninde negatif kaydırma miktarı
const LEFT_Y_OFFSET = 0; // Y ekseninde kaydırma miktarı (geriye doğru almak için)

// İlk setteki pozisyonları kullanarak sol seti oluştur
const LEFT_DEFAULT_POSITION = new THREE.Vector3(DEFAULT_POSITION.x + LEFT_SET_OFFSET, DEFAULT_POSITION.y + LEFT_Y_OFFSET, DEFAULT_POSITION.z);
const LEFT_SECOND_POSITION = new THREE.Vector3(SECOND_POSITION.x + LEFT_SET_OFFSET, SECOND_POSITION.y + LEFT_Y_OFFSET, SECOND_POSITION.z);
const LEFT_THIRD_POSITION = new THREE.Vector3(THIRD_POSITION.x + LEFT_SET_OFFSET, THIRD_POSITION.y + LEFT_Y_OFFSET, THIRD_POSITION.z);
const LEFT_FOURTH_POSITION = new THREE.Vector3(FOURTH_POSITION.x + LEFT_SET_OFFSET, FOURTH_POSITION.y + LEFT_Y_OFFSET, FOURTH_POSITION.z);
const LEFT_FIFTH_POSITION = new THREE.Vector3(FIFTH_POSITION.x + LEFT_SET_OFFSET, FIFTH_POSITION.y + LEFT_Y_OFFSET, FIFTH_POSITION.z);
const LEFT_SIXTH_POSITION = new THREE.Vector3(SIXTH_POSITION.x + LEFT_SET_OFFSET, SIXTH_POSITION.y + LEFT_Y_OFFSET, SIXTH_POSITION.z);
const LEFT_SEVENTH_POSITION = new THREE.Vector3(SEVENTH_POSITION.x + LEFT_SET_OFFSET, SEVENTH_POSITION.y + LEFT_Y_OFFSET, SEVENTH_POSITION.z);
const LEFT_EIGHTH_POSITION = new THREE.Vector3(EIGHTH_POSITION.x + LEFT_SET_OFFSET, EIGHTH_POSITION.y + LEFT_Y_OFFSET, EIGHTH_POSITION.z);
const LEFT_NINTH_POSITION = new THREE.Vector3(NINTH_POSITION.x + LEFT_SET_OFFSET, NINTH_POSITION.y + LEFT_Y_OFFSET, NINTH_POSITION.z);
const LEFT_TENTH_POSITION = new THREE.Vector3(TENTH_POSITION.x + LEFT_SET_OFFSET, TENTH_POSITION.y + LEFT_Y_OFFSET, TENTH_POSITION.z);

export default class SectionLego {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, position = 'default', color = 0xff0000 }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;
    this.color = color;

    this.container = new THREE.Object3D();
    
    // Pozisyon seçimi
    if (position === 'second') {
      this.position = SECOND_POSITION.clone();
    } else if (position === 'third') {
      this.position = THIRD_POSITION.clone();
    } else if (position === 'fourth') {
      this.position = FOURTH_POSITION.clone();
    } else if (position === 'fifth') {
      this.position = FIFTH_POSITION.clone();
    } else if (position === 'sixth') {
      this.position = SIXTH_POSITION.clone();
    } else if (position === 'seventh') {
      this.position = SEVENTH_POSITION.clone();
    } else if (position === 'eighth') {
      this.position = EIGHTH_POSITION.clone();
    } else if (position === 'ninth') {
      this.position = NINTH_POSITION.clone();
    } else if (position === 'tenth') {
      this.position = TENTH_POSITION.clone();
    } else if (position === 'second_default') {
      this.position = RIGHT_DEFAULT_POSITION.clone();
    } else if (position === 'second_second') {
      this.position = RIGHT_SECOND_POSITION.clone();
    } else if (position === 'second_third') {
      this.position = RIGHT_THIRD_POSITION.clone();
    } else if (position === 'second_fourth') {
      this.position = RIGHT_FOURTH_POSITION.clone();
    } else if (position === 'second_fifth') {
      this.position = RIGHT_FIFTH_POSITION.clone();
    } else if (position === 'second_sixth') {
      this.position = RIGHT_SIXTH_POSITION.clone();
    } else if (position === 'second_seventh') {
      this.position = RIGHT_SEVENTH_POSITION.clone();
    } else if (position === 'second_eighth') {
      this.position = RIGHT_EIGHTH_POSITION.clone();
    } else if (position === 'second_ninth') {
      this.position = RIGHT_NINTH_POSITION.clone();
    } else if (position === 'second_tenth') {
      this.position = RIGHT_TENTH_POSITION.clone();
    } else if (position === 'left_default') {
      this.position = LEFT_DEFAULT_POSITION.clone();
    } else if (position === 'left_second') {
      this.position = LEFT_SECOND_POSITION.clone();
    } else if (position === 'left_third') {
      this.position = LEFT_THIRD_POSITION.clone();
    } else if (position === 'left_fourth') {
      this.position = LEFT_FOURTH_POSITION.clone();
    } else if (position === 'left_fifth') {
      this.position = LEFT_FIFTH_POSITION.clone();
    } else if (position === 'left_sixth') {
      this.position = LEFT_SIXTH_POSITION.clone();
    } else if (position === 'left_seventh') {
      this.position = LEFT_SEVENTH_POSITION.clone();
    } else if (position === 'left_eighth') {
      this.position = LEFT_EIGHTH_POSITION.clone();
    } else if (position === 'left_ninth') {
      this.position = LEFT_NINTH_POSITION.clone();
    } else if (position === 'left_tenth') {
      this.position = LEFT_TENTH_POSITION.clone();
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
    this.debugFolder = this.debug.addFolder('Lego');
    
    // Pozisyon kontrolü
    this.debugFolder.add(this.position, 'x').step(1).min(-100).max(100).name('positionX')
      .onChange(() => this.updatePosition());
    this.debugFolder.add(this.position, 'y').step(1).min(-100).max(100).name('positionY')
      .onChange(() => this.updatePosition());
    this.debugFolder.add(this.position, 'z').step(1).min(-100).max(100).name('positionZ')
      .onChange(() => this.updatePosition());
    
    // X, Y, Z ölçek kontrolü (ayrı ayrı)
    this.scaleX = { value: 1.5 };
    this.scaleY = { value: 0.7 };
    this.scaleZ = { value: 0.5 };
    
    this.debugFolder.add(this.scaleX, 'value').step(0.1).min(0.1).max(5).name('scaleX')
      .onChange(() => this.updateScale());
    this.debugFolder.add(this.scaleY, 'value').step(0.1).min(0.1).max(5).name('scaleY')
      .onChange(() => this.updateScale());
    this.debugFolder.add(this.scaleZ, 'value').step(0.1).min(0.1).max(5).name('scaleZ')
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
      this.model.scale.set(
        this.scaleX.value,
        this.scaleY.value,
        this.scaleZ.value
      );
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
    const gltf = this.resources.items.Lego;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('Lego modeli bulunamadı');
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
      
      // Modeli uygun bir boyuta ölçekle - daha bitişik görünüm için
      model.scale.set(1.0, 1.0, 0.4); // Yassı ve geniş bloklar
      
      // Materyalleri ayarla - Kırmızı renk için
      model.traverse(child => {
        if (child.isMesh) {
          const origMat = child.material;
          const mat = origMat.clone();
          
          // Renk ayarı - her parça için
          mat.color = new THREE.Color(this.color);
          
          // Işıltı rengini ana renkle aynı yapıp koyulaştır
          const emissiveColor = new THREE.Color(this.color).multiplyScalar(0.5);
          mat.emissive = emissiveColor;
          mat.emissiveIntensity = 0.3; // Işıltı yoğunluğu
          
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
      
      // Fizik hesaplamalarını uygun değerler ile ayarla
      const halfExtents = new CANNON.Vec3(0.2, 0.2, 0.2); // Daha küçük fizik alanı
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
      
      console.log("Lego modeli başarıyla yerleştirildi, boyut:", model.scale);
      
    } catch (error) {
      console.error("Lego oluşturma hatası:", error);
    }
    
    // Debug değerleri
    if (this.debug) {
      this.scaleX = { value: 1.0 };
      this.scaleY = { value: 1.0 };
      this.scaleZ = { value: 0.4 };
      this.rotation = {
        x: this.rotateX,
        y: this.rotateY,
        z: this.rotateZ
      };
    }
  }
} 