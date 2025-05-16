import * as THREE from 'three';
import CANNON from 'cannon';

// Konumu burada ayarlayabilirsiniz
const DEFAULT_POSITION = new THREE.Vector3(-35, 15, 0); // Güncellenmiş konum

export default class SectionBasketballCourt {
  constructor({ scene, resources, objects, physics, debug, rotateX = Math.PI/2, rotateY = Math.PI/2 + Math.PI/12, rotateZ = 0, areas = null, car = null }) {
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

    // Sadece modeli yükle, ekstra elemanları kaldırdık
    this._buildModel();
    this.scene.add(this.container);
  }

  // Debug kontrollerini ekleyen metot
  setupDebug() {
    this.debugFolder = this.debug.addFolder('BasketballCourt');
    
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
      
    // Çarpışma kutusu görünürlüğü
    this.showCollisionBox = { value: false };
    this.debugFolder.add(this.showCollisionBox, 'value').name('showCollision')
      .onChange(() => {
        if (this.collisionMeshes) {
          this.collisionMeshes.forEach(mesh => {
            mesh.visible = this.showCollisionBox.value;
          });
        }
      });
  }

  // Pozisyon güncelleyen metot
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
      
      // Görünmez tabanı da güncelle
      if (this.invisibleBase) {
        this.invisibleBase.position.copy(this.position);
      }
      
      // Çarpışma görsellerini de güncelle
      if (this.collisionMeshes) {
        this._updateCollisionVisuals();
      }
    }
  }

  // Ölçek güncelleyen metot
  updateScale() {
    if (this.model) {
      this.model.scale.set(this.scale.value, this.scale.value, this.scale.value);
      
      // Görünmez tabanı da ölçeklendir
      if (this.invisibleBase) {
        this.invisibleBase.scale.set(this.scale.value, this.scale.value, this.scale.value);
      }
      
      // Fizik gövdesini de güncelle
      if (this.body && this.physics) {
        // Mevcut gövdeyi kaldır
        this.physics.world.removeBody(this.body);
        
        // Çarpışma görsellerini temizle
        this._clearCollisionVisuals();
        
        // Yeni ölçekle çarpışma kutusunu oluştur
        this._createCollisionBody();
      }
    }
  }

  // Rotasyon güncelleyen metot
  updateRotation() {
    if (this.model) {
      this.model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      
      // Görünmez tabanı da döndür
      if (this.invisibleBase) {
        this.invisibleBase.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
      }
      
      // Fizik gövdesi varsa onu da güncelle
      if (this.body) {
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(this.rotation.x, this.rotation.y, this.rotation.z, 'XYZ');
        this.body.quaternion.copy(quat);
        
        // Çarpışma görsellerini güncelle
        if (this.collisionMeshes) {
          this._updateCollisionVisuals();
        }
      }
    }
  }
  
  // Model oluşturan metot
  _buildModel() {
    console.log("BasketballCourt modeli yükleniyor...");
    
    // Model kaynağını al
    const resource = this.resources.items.BasketballCourt;
    
    if (!resource) {
      console.error("BasketballCourt model kaynağı bulunamadı!");
      return;
    }
    
    // Modeli klonla
    const model = resource.scene.clone();
    
    // Modeli pozisyonla
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    
    // GLB modelini olduğu gibi bırak, ölçeklendirme yapma
    
    // Modeli container'a ekle
    this.container.add(model);
    this.model = model;
    
    // Modelin gerçek boyutlarını hesapla
    this.model.updateMatrixWorld(true);
    const modelBox = new THREE.Box3().setFromObject(this.model);
    const modelSize = modelBox.getSize(new THREE.Vector3());
    
    // Görünmez taban oluştur
    this._createInvisibleBase(modelSize);
    
    // Çarpışma gövdesini oluştur
    this._createCollisionBody();
    
    console.log("Basketbol sahası başarıyla yerleştirildi, GLB modeli orijinal haliyle gösteriliyor");
  }
  
  // Görünmez taban oluşturma metodu
  _createInvisibleBase(modelSize) {
    // Görünmez taban geometrisi - dikdörtgen olarak ayarla
    const baseWidth = modelSize.x * 1.5; // %50 daha geniş
    const baseDepth = modelSize.z * 2.5; // %150 daha derin
    const baseHeight = 0.1; // Çok ince taban
    
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.0, // Tamamen görünmez
      depthWrite: false
    });
    
    const invisibleBase = new THREE.Mesh(baseGeometry, baseMaterial);
    invisibleBase.position.copy(this.position);
    invisibleBase.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    
    this.container.add(invisibleBase);
    this.invisibleBase = invisibleBase;
    this.baseSize = { width: baseWidth, height: baseHeight, depth: baseDepth };
    
    console.log("Genişletilmiş dikdörtgen taban oluşturuldu:", this.baseSize);
  }
  
  // Çarpışma görsellerini temizleme
  _clearCollisionVisuals() {
    if (this.collisionMeshes && this.collisionMeshes.length > 0) {
      this.collisionMeshes.forEach(mesh => {
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
      });
    }
    this.collisionMeshes = [];
  }
  
  // Çarpışma kutularını görselleştirme
  _createCollisionVisuals(body, color = 0x00ff00) {
    if (!body || !body.shapes || !body.shapes.length) return null;
    
    const shape = body.shapes[0];
    
    if (shape instanceof CANNON.Box) {
      // CANNON.Box için boyut değerleri yarı-boyutlardır
      const halfExtents = shape.halfExtents;
      const geometry = new THREE.BoxGeometry(
        halfExtents.x * 2, 
        halfExtents.y * 2, 
        halfExtents.z * 2
      );
      
      const material = new THREE.MeshBasicMaterial({ 
        color: color, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Cannon.js ve Three.js konum ve rotasyonlarını eşleştir
      mesh.position.copy(new THREE.Vector3(
        body.position.x,
        body.position.y,
        body.position.z
      ));
      
      // Quaternion'u three.js için dönüştür
      mesh.quaternion.set(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      );
      
      mesh.visible = this.showCollisionBox ? this.showCollisionBox.value : false;
      this.container.add(mesh);
      return mesh;
    }
    
    return null;
  }
  
  // Çarpışma görsellerini güncelleme
  _updateCollisionVisuals() {
    if (!this.collisionMeshes || !this.collisionBodies) return;
    
    for (let i = 0; i < this.collisionBodies.length; i++) {
      if (this.collisionMeshes[i] && this.collisionBodies[i]) {
        this.collisionMeshes[i].position.copy(new THREE.Vector3(
          this.collisionBodies[i].position.x,
          this.collisionBodies[i].position.y,
          this.collisionBodies[i].position.z
        ));
        
        this.collisionMeshes[i].quaternion.set(
          this.collisionBodies[i].quaternion.x,
          this.collisionBodies[i].quaternion.y,
          this.collisionBodies[i].quaternion.z,
          this.collisionBodies[i].quaternion.w
        );
      }
    }
  }
  
  // Çarpışma gövdesini oluşturan ayrı metot
  _createCollisionBody() {
    if (!this.physics || !this.model) return;
    
    // Önceki gövdeleri temizle
    if (this.body) {
      this.physics.world.removeBody(this.body);
    }
    
    // Mevcut tüm çarpışma cisimlerini kaldıralım
    if (this.collisionBodies) {
      this.collisionBodies.forEach(body => {
        this.physics.world.removeBody(body);
      });
    }
    
    this.collisionBodies = [];
    this.collisionMeshes = [];
    
    // Görünmez tabanı kullanarak çarpışma boyutlarını belirle
    // Eğer görünmez taban yoksa, modelin boyutlarını kullan
    let baseWidth, baseDepth, baseThickness;
    
    if (this.invisibleBase && this.baseSize) {
      baseWidth = this.baseSize.width;
      baseDepth = this.baseSize.depth;
      baseThickness = this.baseSize.height;
    } else {
      // Modelin gerçek boyutlarını hesapla
      this.model.updateMatrixWorld(true); // Matrisi güncelle
      const modelBox = new THREE.Box3().setFromObject(this.model);
      const modelSize = modelBox.getSize(new THREE.Vector3());
      
      baseWidth = modelSize.x;
      baseDepth = modelSize.z;
      baseThickness = 0.1; // Çok ince bir taban
    }
    
    console.log("Taban boyutları:", baseWidth, baseDepth, baseThickness);
    
    // Çarpışma kutusunu biraz genişlet (taban boyutundan)
    const widthMargin = 0.3; // Genişlik için %30 ekstra
    const depthMargin = 0.5; // Derinlik için %50 ekstra
    const collisionWidth = baseWidth * (1 + widthMargin);
    const collisionDepth = baseDepth * (1 + depthMargin);
    const collisionThickness = 6.0; // Çok daha kalın bir yükseklik
    
    // Ana çarpışma gövdesi - görünmez tabanın etrafında
    const mainBody = new CANNON.Body({
      mass: 0, // Statik gövde
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y, 
        this.position.z
      ),
      shape: new CANNON.Box(new CANNON.Vec3(
        collisionWidth / 2,    
        collisionThickness / 2,
        collisionDepth / 2
      ))
    });
    
    // Rotasyonu ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    mainBody.quaternion.copy(quat);
    
    this.body = mainBody;
    this.collisionBodies.push(mainBody);
    
    // Fizik dünyasına ekle
    this.physics.world.addBody(mainBody);
    
    // Çarpışma kutusunu görselleştir (debug için)
    const mainCollisionMesh = this._createCollisionVisuals(mainBody, 0x00ff00);
    if (mainCollisionMesh) {
      this.collisionMeshes.push(mainCollisionMesh);
    }
    
    // Potalar için çarpışma gövdeleri
    // Pota konumlarını hesapla
    let leftPos, rightPos;
    const potaHeight = 10; // Pota yüksekliği
    const potaWidth = baseWidth * 0.15;
    const potaThickness = 1.0;
    const potaDistance = baseDepth * 0.45; // Kenardan biraz içeride
    
    // Hafif çapraz dönüş için (Math.PI/2 + Math.PI/12 civarı)
    if (Math.abs(this.rotateY - (Math.PI/2 + Math.PI/12)) < 0.1) {
      console.log("Hafif çapraz (Math.PI/2 + Math.PI/12) rotasyonu tespit edildi");
      // Rotasyonu hesaba katarak pota konumlarını belirle
      const angle = Math.PI/12; // 15 derece çapraz açı
      const offsetX = potaDistance * Math.sin(angle);
      const offsetZ = potaDistance * Math.cos(angle);
      
      leftPos = new CANNON.Vec3(
        this.position.x - offsetZ,
        this.position.y + potaHeight/2,
        this.position.z - offsetX
      );
      
      rightPos = new CANNON.Vec3(
        this.position.x + offsetZ,
        this.position.y + potaHeight/2,
        this.position.z + offsetX
      );
    } else if (Math.abs(this.rotateY - Math.PI/2) < 0.1) {
      // 90 derece döndürülmüş
      leftPos = new CANNON.Vec3(
        this.position.x - potaDistance,
        this.position.y + potaHeight/2,
        this.position.z
      );
      
      rightPos = new CANNON.Vec3(
        this.position.x + potaDistance,
        this.position.y + potaHeight/2,
        this.position.z
      );
    } else if (Math.abs(this.rotateY + Math.PI/2) < 0.1) {
      // -90 derece döndürülmüş
      leftPos = new CANNON.Vec3(
        this.position.x + potaDistance,
        this.position.y + potaHeight/2,
        this.position.z
      );
      
      rightPos = new CANNON.Vec3(
        this.position.x - potaDistance,
        this.position.y + potaHeight/2,
        this.position.z
      );
    } else if (Math.abs(this.rotateY) < 0.1) {
      // 0 derece (döndürülmemiş)
      leftPos = new CANNON.Vec3(
        this.position.x,
        this.position.y + potaHeight/2,
        this.position.z - potaDistance
      );
      
      rightPos = new CANNON.Vec3(
        this.position.x,
        this.position.y + potaHeight/2,
        this.position.z + potaDistance
      );
    } else if (Math.abs(this.rotateY - Math.PI) < 0.1 || Math.abs(this.rotateY + Math.PI) < 0.1) {
      // 180 derece döndürülmüş
      leftPos = new CANNON.Vec3(
        this.position.x,
        this.position.y + potaHeight/2,
        this.position.z + potaDistance
      );
      
      rightPos = new CANNON.Vec3(
        this.position.x,
        this.position.y + potaHeight/2,
        this.position.z - potaDistance
      );
    }
    
    // Sol pota çarpışma gövdesi
    const leftBackboardBody = new CANNON.Body({
      mass: 0,
      position: leftPos
    });
    
    leftBackboardBody.addShape(new CANNON.Box(new CANNON.Vec3(
      potaWidth / 2,
      potaHeight / 2,
      potaThickness / 2
    )));
    
    leftBackboardBody.quaternion.copy(quat);
    this.physics.world.addBody(leftBackboardBody);
    this.collisionBodies.push(leftBackboardBody);
    
    // Çarpışma kutusunu görselleştir
    const leftCollisionMesh = this._createCollisionVisuals(leftBackboardBody, 0xff0000);
    if (leftCollisionMesh) {
      this.collisionMeshes.push(leftCollisionMesh);
    }
    
    // Sağ pota çarpışma gövdesi
    const rightBackboardBody = new CANNON.Body({
      mass: 0,
      position: rightPos
    });
    
    rightBackboardBody.addShape(new CANNON.Box(new CANNON.Vec3(
      potaWidth / 2,
      potaHeight / 2,
      potaThickness / 2
    )));
    
    rightBackboardBody.quaternion.copy(quat);
    this.physics.world.addBody(rightBackboardBody);
    this.collisionBodies.push(rightBackboardBody);
    
    // Çarpışma kutusunu görselleştir
    const rightCollisionMesh = this._createCollisionVisuals(rightBackboardBody, 0xff0000);
    if (rightCollisionMesh) {
      this.collisionMeshes.push(rightCollisionMesh);
    }
    
    console.log("Görünmez tabanlı çarpışma kutuları oluşturuldu:", 
      `Ana Saha: ${collisionWidth.toFixed(2)} x ${collisionThickness.toFixed(2)} x ${collisionDepth.toFixed(2)} (Kenar payı: ${widthMargin}, ${depthMargin})`,
      `Potalar: ${potaWidth.toFixed(2)} x ${potaHeight.toFixed(2)} x ${potaThickness.toFixed(2)}`);
  }
} 