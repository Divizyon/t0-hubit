import * as THREE from 'three';
import CANNON from 'cannon';

// Konumu burada ayarlayabilirsiniz
const DEFAULT_POSITION = new THREE.Vector3(-27, -25, 0); // Daha görünür bir konuma taşındı

export default class SectionKademe {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, areas = null, car = null }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;
    this.areas = areas;
    this.car = car;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.container = new THREE.Object3D();
    this.position = DEFAULT_POSITION.clone();

    // Debug kontrolleri ekle
    if (this.debug) {
      this.setupDebug();
    }

    // Sıralama değiştirildi: Önce modeli yükle, sonra base ve etkileşim alanını oluştur
    this._buildModel();
    this._createBaseModel();
    this._createInteractionArea();
    this.scene.add(this.container);
  }

  // Debug kontrollerini ekleyen metot
  setupDebug() {
    this.debugFolder = this.debug.addFolder('Kademe');
    
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

  // Pozisyon güncelleyen metot
  updatePosition() {
    if (this.model) {
      this.model.position.copy(this.position);
      
      // Base modelini de güncelle
      if (this.baseModel) {
        this.baseModel.position.copy(this.position);
      }

      // Etkileşim alanını da güncelle
      if (this.interactionArea) {
        this.interactionArea.container.position.x = this.position.x;
        this.interactionArea.container.position.y = this.position.y;
      }
      
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

  // Ölçek güncelleyen metot
  updateScale() {
    if (this.model) {
      this.model.scale.set(this.scale.value, this.scale.value, this.scale.value);
      
      // Base modelini de güncelle
      if (this.baseModel) {
        this.baseModel.scale.set(this.scale.value, this.scale.value, this.scale.value);
      }
    }
  }

  // Rotasyon güncelleyen metot
  updateRotation() {
    if (this.model) {
      this.model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      
      // Base modelini de güncelle
      if (this.baseModel) {
        this.baseModel.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      }
      
      // Fizik gövdesi varsa onu da güncelle
      if (this.body) {
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(this.rotation.x, this.rotation.y, this.rotation.z, 'XYZ');
        this.body.quaternion.copy(quat);
      }
    }
  }
  
  // Görünmez base model oluştur (Fizik için ve Area için gerekli)
  _createBaseModel() {
    // Base model boyutları (model henüz oluşturulduğunda bu değerler kullanılacak)
    let width = 8;  // Daha büyük genişlik
    let height = 8; // Daha büyük yükseklik
    let depth = 0.5; // İnce ama 0'dan büyük
    
    // Eğer model varsa, onun boyutlarına göre ayarla
    if (this.model) {
      const modelBox = new THREE.Box3().setFromObject(this.model);
      const modelSize = modelBox.getSize(new THREE.Vector3());
      
      width = modelSize.x + 1;
      height = modelSize.y + 1;
      depth = 0.5;
    }
    
    // Base için basit bir küp geometrisi
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.0, // Tamamen görünmez
      wireframe: false 
    });
    
    this.baseModel = new THREE.Mesh(geometry, material);
    this.baseModel.position.copy(this.position);
    
    // Z pozisyonunu modelin alt kısmına ayarla (eğer model varsa)
    if (this.model) {
      const modelBox = new THREE.Box3().setFromObject(this.model);
      const modelSize = modelBox.getSize(new THREE.Vector3());
      this.baseModel.position.z = this.position.z - modelSize.z * 0.25;
    }
    
    this.baseModel.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    
    // Küpü container'a ekle
    this.container.add(this.baseModel);
    
    console.log("Base model oluşturuldu ve boyutlandırıldı");
  }
  
  // Etkileşim alanı oluşturan metot
  _createInteractionArea() {
    if (!this.areas) {
      console.warn('Areas sınıfı tanımlanmamış, etkileşim alanı oluşturulamadı');
      return;
    }
    
    console.log("Areas sınıfı mevcut, etkileşim alanı oluşturuluyor...");
    
    try {
      // Modelin boyutlarını al (model oluşturulmuşsa)
      let areaWidth = 15; // Daha büyük varsayılan değer
      let areaHeight = 15; // Daha büyük varsayılan değer
      
      if (this.model) {
        const modelBox = new THREE.Box3().setFromObject(this.model);
        const modelSize = modelBox.getSize(new THREE.Vector3());
        
        // Etkileşim alanını model boyutundan çok daha büyük yap
        areaWidth = modelSize.x * 2 + 10; // Genişlik için 2 katı + 10 birim
        areaHeight = modelSize.y * 2 + 10; // Yükseklik için 2 katı + 10 birim
      }
      
      // Etkileşim alanını oluştur
      this.interactionArea = this.areas.add({
        position: new THREE.Vector2(this.position.x, this.position.y),
        halfExtents: new THREE.Vector2(areaWidth/2, areaHeight/2), // Yarı genişlik/yükseklik kullan
        testCar: true, // Araba testi açık
        active: true, // Aktif
        hasKey: true,
        car: this.car,
        isBuilding: true, // Bu bir bina olarak işaretlendi
        areaSize: Math.max(areaWidth, areaHeight)/2,
        name: 'Kademe',
        description: "Kademe, öğrencilere akademik başarılarının yanı sıra kişisel ve profesyonel gelişimlerine odaklanarak onları iş dünyasının taleplerine uygun şekilde hazırlıyor."
      });
      
      // Araba her görüş alanına girdiğinde otomatik interact çağırmak için
      if (this.interactionArea) {
        this.interactionArea.on('in', () => {
          console.log('Araç Kademe alanına girdi, popup açılıyor...');
          // 500ms sonra tetikle (hafif gecikme ile)
          setTimeout(() => {
            this.interactionArea.interact(true, true); // Açılması için true ve true gönderiyoruz
          }, 500);
        });
      }
      
      console.log('Kademe etkileşim alanı başarıyla oluşturuldu, boyutlar:', 
                 `Genişlik: ${areaWidth}, Yükseklik: ${areaHeight}`);
    } catch (error) {
      console.error('Etkileşim alanı oluşturulurken hata:', error);
    }
  }
  
  _buildModel() {
    const gltf = this.resources.items.Kademe;
  
    if (!gltf || !gltf.scene) {
      console.error('Kademe modeli bulunamadı');
      return;
    }
  
    // Kademe modelini klonla ve malzemeleri kopyala
    const model = gltf.scene.clone(true);
    this.model = model;
    
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

    // Model ölçeğini ayarla
    model.scale.set(1.0, 1.0, 1.0);
    
    // Modelin pozisyon ve rotasyonunu ayarla
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    
    // Modeli container'a ekle
    this.container.add(model);

    // Bounding box hesapla - modelin gerçek boyutuna göre
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    
    // Daha hassas bir collision kutusu için
    // Model boyutunun %85'i kadar bir collision box oluştur
    // Böylece model etrafında çok sıkı bir sınır oluşur
    const collisionScale = 0.85;
    
    // Modelin yüksekliğinin yarısını kullan (modelin altından yukarıya doğru)
    // Bu, modelin üzerine çıkılmasını engeller
    const yOffset = size.z / 4; 
    
    // Fizik gövdesi için CANNON.Box oluştur
    const halfExtents = new CANNON.Vec3(
      size.x * collisionScale / 2, 
      size.y * collisionScale / 2, 
      size.z * collisionScale / 2
    );
    
    const boxShape = new CANNON.Box(halfExtents);
    
    // Fizik gövdesi oluştur
    const body = new CANNON.Body({
      mass: 0, // Statik gövde
      position: new CANNON.Vec3(
        this.position.x, 
        this.position.y, 
        this.position.z + yOffset // Yükseklik ayarı
      ),
      material: this.physics.materials.items.floor,
      collisionFilterGroup: 1, // Arabayla çarpışsın
      collisionFilterMask: 1 // Arabayla çarpışsın
    });
    
    this.body = body;
  
    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    body.quaternion.copy(quat);
  
    // Fizik gövdesine şekil ekle
    body.addShape(boxShape);
    
    // Modelin kenarları için ek mini kutuların eklenmesi
    // Bu, modelin etrafında daha doğru bir çarpışma alanı sağlar
    const edgeSize = Math.min(size.x, size.y) * 0.15; // 0.2'den 0.15'e düşürdük
    const edgeHeight = size.z * 0.7; // 0.8'den 0.7'ye düşürdük
    const edgeShape = new CANNON.Box(new CANNON.Vec3(edgeSize, edgeSize, edgeHeight / 2));
    
    // Modelin köşelerine mini kutular ekle
    const cornerPositions = [
      // Sol ön
      new CANNON.Vec3(-size.x/2 * collisionScale * 0.95, -size.y/2 * collisionScale * 0.95, 0),
      // Sağ ön
      new CANNON.Vec3(size.x/2 * collisionScale * 0.95, -size.y/2 * collisionScale * 0.95, 0),
      // Sol arka
      new CANNON.Vec3(-size.x/2 * collisionScale * 0.95, size.y/2 * collisionScale * 0.95, 0),
      // Sağ arka
      new CANNON.Vec3(size.x/2 * collisionScale * 0.95, size.y/2 * collisionScale * 0.95, 0)
    ];
    
    // Her köşeye mini kutu ekle
    cornerPositions.forEach(position => {
      body.addShape(edgeShape, position);
    });
    
    // Fizik dünyasına ekle
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
    
    console.log("Kademe modeli başarıyla yerleştirildi, pozisyon:", this.position);
  }
} 