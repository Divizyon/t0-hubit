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

    this._buildModel();
    this.scene.add(this.container);
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
          '/static/models/SectionSoccer/saha-bg.jpg',
          (texture) => {

            console.log("text :", texture)
              // Texture başarıyla yüklendi
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
          undefined, // İlerleme callback'i
          (error) => {
              // Hata durumunda
              console.error('Texture yüklenirken hata oluştu:', error);
              
              // Hata durumunda yeşil renk kullan
              const fieldMaterial = new THREE.MeshStandardMaterial({ 
                  color: 0x00ff00,
                  roughness: 0.8,
                  metalness: 0.2,
                  side: THREE.DoubleSide
              });
              
              const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
              // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
              field.rotation.x = 0; // -Math.PI yerine 0
              field.receiveShadow = true;
              // Y ekseninde pozisyonla
              field.position.y = 0;
              field.position.z = 0;
              this.container.add(field);
          }
      );
    
    // Çizgileri oluştur
    this._createFieldLines(fieldWidth, fieldLength);
    
    // Kale modelini ekle (kale modelini siz vereceksiniz)
    this._addGoalModel();
    
    // Fizik ekle
    //this._addPhysics(field, fieldWidth, fieldLength);
    
    // Işık ekle
    this._addLights();
}

// Işık eklemek için yeni metod
_addLights() {
    // Sahayı aydınlatacak ışık
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    this.container.add(directionalLight);
    
    // Ambient ışık ekle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.container.add(ambientLight);
}

_createFieldLines(fieldWidth, fieldLength) {
    const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide // Çift taraflı render
    });
    const lineWidth = 0.25; // FIFA standartlarına göre çizgi genişliği
    
    // Sabit yükseklik değeri tanımla
    const lineHeight = 0.02; // Tüm çizgiler için sabit yükseklik
    
    // Saha kenar çizgileri
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
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    centerCircleMesh.rotation.x = 0; // -Math.PI yerine 0
    centerCircleMesh.position.y = 0; // Y ekseninde pozisyonla
    centerCircleMesh.position.z = lineHeight; // Z ekseninde yükseklik
    this.container.add(centerCircleMesh);
    
    // Ceza sahası
    const penaltyBoxWidth = 22.75; // 16.5m * 2 + 7.32m (kale genişliği)
    const penaltyBoxLength = 9;
    this._createLine(penaltyBoxWidth, lineWidth, 0, fieldLength/2 - penaltyBoxLength/2 -4.6, false, lineHeight); // Üst çizgi
    this._createLine(lineWidth, penaltyBoxLength, -penaltyBoxWidth/2 , fieldLength/2 - penaltyBoxLength/2 -4.6, true, lineHeight); // Sol çizgi
    this._createLine(lineWidth, penaltyBoxLength, penaltyBoxWidth/2 , fieldLength/2 - penaltyBoxLength/2 -4.6, true, lineHeight); // Sağ çizgi
    
    // Kale sahası
    const goalAreaWidth = 18.32; // 5.5m * 2 + 7.32m (kale genişliği)
    const goalAreaLength = 5.5;
    this._createLine(goalAreaWidth, lineWidth, 0, fieldLength/2 - goalAreaLength/2 -2.8, false, lineHeight); // Üst çizgi
    this._createLine(lineWidth, goalAreaLength, -goalAreaWidth/2, fieldLength/2 - goalAreaLength/2 -2.8, true, lineHeight); // Sol çizgi
    this._createLine(lineWidth, goalAreaLength, goalAreaWidth/2, fieldLength/2 - goalAreaLength/2 -2.8, true, lineHeight); // Sağ çizgi
    
    // Penaltı noktası
    const penaltySpot = new THREE.CircleGeometry(lineWidth * 2, 32);
    const penaltySpotMesh = new THREE.Mesh(penaltySpot, lineMaterial);
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    penaltySpotMesh.rotation.x = 0;
    penaltySpotMesh.position.set(0, fieldLength/2 - 8, lineHeight); // Y ekseninde pozisyonla
    this.container.add(penaltySpotMesh);
    
    // Köşe yayları
    const cornerRadius = 1;
    const cornerSegments = new THREE.Shape();
    cornerSegments.absarc(0, 0, cornerRadius, 0, Math.PI/2, false);
    const cornerGeometry = new THREE.ShapeGeometry(cornerSegments);
    
    // Sağ üst köşe
    const cornerTopRight = new THREE.Mesh(cornerGeometry, lineMaterial);
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    cornerTopRight.rotation.x = 0;
    cornerTopRight.position.set(fieldWidth/2 - cornerRadius, fieldLength/2 - cornerRadius, lineHeight); // Y ekseninde pozisyonla
    this.container.add(cornerTopRight);
    
    // Sol üst köşe
    const cornerTopLeft = new THREE.Mesh(cornerGeometry.clone(), lineMaterial);
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    cornerTopLeft.rotation.x = 0;
    cornerTopLeft.rotation.z = Math.PI/2;
    cornerTopLeft.position.set(-fieldWidth/2 + cornerRadius, fieldLength/2 - cornerRadius, lineHeight); // Y ekseninde pozisyonla
    this.container.add(cornerTopLeft);
}

_createLine(width, height, x, z, isVertical = false, yPosition = 0.02) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide // Çift taraflı render
    });
    const line = new THREE.Mesh(geometry, material);
    
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    line.rotation.x = 0; // -Math.PI yerine 0
    
    if (isVertical) {
        // Dikey çizgi için y pozisyonu
        line.position.set(x, z + height/2, yPosition); // Z ve Y değerlerini değiştir
    } else {
        // Yatay çizgi için y pozisyonu
        line.position.set(x, z, yPosition); // Z ve Y değerlerini değiştir
    }
    
    this.container.add(line);
    return line;
}
  
  _buildModel() {
    this.container.position.copy(this.position);
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    this.container.rotation.x = 0; // this.rotateX yerine 0
    this.container.rotation.y = this.rotateY;
    this.container.rotation.z = this.rotateZ;
    
    // Sahayı ölçeklendirme
    this.container.scale.set(this.scale, this.scale, this.scale);
    
    this._createModel();
  }
  
  // Kale modelini eklemek için metod (kale modelini siz vereceksiniz)
  _addGoalModel() {
    // Kale modelini resources'tan alacağız
    const gltf = this.resources.items.footballTower;
    
    // GLB dosyasının yüklenip yüklenmediğini kontrol et
    if (!gltf) {
        console.error('Futbol kalesi modeli (footballTower) yüklenemedi!');
        return; // Model yoksa fonksiyondan çık
    }

    console.log('Futbol kalesi modeli yüklendi:', gltf);

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
    
    // Kale modelini container'a değil, doğrudan sahneye ekle
    // Z ekseninden Y eksenine geçiş için pozisyonu değiştir
    model.position.set(this.position.x, this.position.y + 7.3, this.position.z - .3); // Y pozisyonunu düzelt
    // Z ekseninden Y eksenine geçiş için rotasyonu değiştir
    model.rotation.set(0, this.rotateY, this.rotateZ + -Math.PI/2); // this.rotateX yerine 0
    
    // Kale modelinin kendi ölçeğini ayarla (sahanın ölçeğinden bağımsız)
    const goalScale = 1.0; // Kale için istediğiniz ölçeği buradan ayarlayabilirsiniz
    model.scale.set(goalScale, goalScale, goalScale);
    
    // Kaleyi doğrudan sahneye ekle
    this.scene.add(model);
    
    // Kale referansını sakla (gerekirse daha sonra kullanmak için)
    this.goalModel = model;
}
}