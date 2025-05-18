import * as THREE from 'three';
import CANNON from 'cannon';
import gsap from 'gsap'


const DEFAULT_POSITION = new THREE.Vector3(-54.8, 28.4, 1.1);

export default class SectionGreenScreen {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, car, time, areas,passes,camera,zones }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;
    this.passes = passes;
    this.camera = camera;
    this.zones = zones;

    this.areas = areas;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.car = car;
    this.time = time;

    this.container = new THREE.Object3D();
    this.position = DEFAULT_POSITION.clone();
    console.log(this.resources.items.UVDesert)
    this.greenScreenMesh = null;
    this.greenScreenImagePaths = [
      './uv/Desert.webp',
      './uv/Lake.webp',
      './uv/Iceland.webp',
    ];

    this.greenScreencarImagePaths = [
      './models/SectionGreenScreen/desert.png',
      './models/SectionGreenScreen/lake.png',
      './models/SectionGreenScreen/iceland.png',
    ];
    
    // Fotoğraf çekme sesi için ses dosyasını yükle
    this.cameraSound = new Audio('./sounds/camera/mixkit-camera-shutter.wav');
    this.currentImageIndex = 0;
    this.isPhotoMode = false;
    this.inRoom = false;

    this._buildModel();
    this.scene.add(this.container);

    this._createPopup();
    this._setupKeyboardEvents(); // Klavye olaylarını dinlemeyi başlat
    this.setZone();
  }
  
    
  _buildModel() {
    const gltf = this.resources.items.GreenScreen;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('SectionGreenScreen bina modeli bulunamadı');
      return;
    }
  
    if (!base || !base.scene) {
      console.error('Base modeli bulunamadı');
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
    
     model.position.copy(this.position);
     model.rotation.set(this.rotateX, this.rotateY, -.45);
     this.container.add(model);
   
     const baseModel = base.scene.clone(true);
     baseModel.position.set(-54.65, 30.2, 0);
     baseModel.scale.set(1.4, 1.3, .5);
     baseModel.rotation.set(this.rotateX, this.rotateY, 290 -.6);
     this.container.add(baseModel);
     baseModel.traverse(child => {
        if (child.isMesh) {
           child.material = child.material.clone();
           child.material.color.r = 2;
           child.material.color.g = 0;
           child.material.color.b = 0;
        }
     });

     const baseModel2 = base.scene.clone(true);
     baseModel2.position.set(-54.65, 30.2, 0);
     baseModel2.scale.set(1.4, 1.3, .5);
     baseModel2.rotation.set(this.rotateX, this.rotateY, 201.23 - .6);
     this.container.add(baseModel2);
     baseModel2.traverse(child => {
        if (child.isMesh) {
           child.material = child.material.clone();
           child.material.color.r = 2;
           child.material.color.g = 0;
           child.material.color.b = 0;
    }
    });
  
    baseModel.updateMatrixWorld(true);
    baseModel2.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(baseModel);
    var size = bbox.getSize(new THREE.Vector3());
  
    const halfExtents = new CANNON.Vec3(size.x / 2.8, size.y / 2.8, 1);
    const boxShape = new CANNON.Box(halfExtents);
  
    const body = new CANNON.Body({
      mass: 0,
      position: baseModel.position,
      material: this.physics.materials.items.floor
    });
  
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(baseModel.rotation.x, baseModel.rotation.y, baseModel.rotation.z, 'XYZ');
    body.quaternion.copy(quat);
  
    body.addShape(boxShape);
    this.physics.world.addBody(body);


    const bbox2 = new THREE.Box3().setFromObject(baseModel2);
    var size2 = bbox2.getSize(new THREE.Vector3());
  
    const halfExtents2 = new CANNON.Vec3(size2.x / 2.7, size2.y / 2.7, 1);
    const boxShape2 = new CANNON.Box(halfExtents2);
  
    const body2 = new CANNON.Body({
      mass: 0,
      position: baseModel2.position,
      material: this.physics.materials.items.floor
    });
  
    const quat2 = new CANNON.Quaternion();
    quat2.setFromEuler(baseModel2.rotation.x, baseModel2.rotation.y, baseModel2.rotation.z, 'XYZ');
    body2.quaternion.copy(quat2);
  
    body2.addShape(boxShape2);
    this.physics.world.addBody(body2);

    console.log("inRoom : ",this.inRoom)
  
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
    const popup = document.createElement('div');
    popup.id = 'greenscreen-popup';
    popup.style.position = 'absolute';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.backgroundColor = 'rgba(26, 26, 26, 0.8)';
    popup.style.padding = '10px';
    popup.style.borderRadius = '10px';
    popup.style.display = 'none';
    popup.style.zIndex = '1000';
    
    this.greenScreenImagePaths.forEach((imagePath, index) => {
      const img = document.createElement('img');
      img.src = imagePath;
      img.style.width = '150px';
      img.style.margin = '5px';
      img.style.cursor = 'pointer';
      img.style.borderRadius = '10px';

      img.addEventListener('click', () => {
        this.changeGreenscreenTexture(index);
      });

      popup.appendChild(img);
    });
    
    // Bilgi metni
    const infoText = document.createElement('div');
    infoText.textContent = 'Fotoğraf çekmek için "I" tuşuna basın';
    infoText.style.color = 'white';
    infoText.style.textAlign = 'center';
    infoText.style.marginTop = '10px';
    popup.appendChild(infoText);
    
    // Kapatma butonu
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Kapat';
    closeButton.style.display = 'block';
    closeButton.style.margin = '10px auto 0';
    closeButton.style.padding = '5px 15px';
    closeButton.style.backgroundColor = '#ff3333';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
      popup.style.display = 'none';
    });
    popup.appendChild(closeButton);

    document.body.appendChild(popup);

    this.time.on('tick', () => {
      const distance = this.car.position.distanceTo(this.position);

      if (distance < 10) {
        popup.style.display = 'block';
      } else {
        popup.style.display = 'none';
        if (this.photoOverlay) {
          this.photoOverlay.style.display = 'none';
        }
        this.isPhotoMode = false;
      }
    });
    
    this.popup = popup;
  }
  
  _setupKeyboardEvents() {
    // Önceki olay dinleyicilerini temizle
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    
    // Yeni olay dinleyicisi oluştur
    this.keydownHandler = (event) => {
      // inRoom kontrolünü her tuşa basıldığında yap
      if (this.inRoom === true) {
        // "I" veya "ı" tuşuna basıldığında fotoğraf çek
        if ((event.key === 'i' || event.key === 'I' || event.key === 'ı' || event.key === 'İ') && 
            this.popup.style.display === 'block') {
          this.takePhoto();
        }
        
        // ESC tuşuna basıldığında fotoğraf modundan çık
        if (event.key === 'Escape' && this.isPhotoMode) {
          if (this.photoOverlay) {
            this.photoOverlay.style.display = 'none';
          }
          this.isPhotoMode = false;
        }
      }
    };
    
    // Olay dinleyicisini ekle
    window.addEventListener('keydown', this.keydownHandler);
  }
  
  takePhoto() {
    // Fotoğraf çekme sesi çal
    this.cameraSound.currentTime = 0;
    this.cameraSound.play();
    
    // Fotoğraf çekme animasyonu
    if (!this.photoOverlay) {
      this.photoOverlay = document.createElement('div');
      this.photoOverlay.style.position = 'fixed';
      this.photoOverlay.style.top = '0';
      this.photoOverlay.style.left = '0';
      this.photoOverlay.style.width = '100%';
      this.photoOverlay.style.height = '100%';
      this.photoOverlay.style.backgroundColor = 'white';
      this.photoOverlay.style.opacity = '0';
      this.photoOverlay.style.zIndex = '2000';
      this.photoOverlay.style.pointerEvents = 'none';
      document.body.appendChild(this.photoOverlay);
    }
    
    // Flaş efekti
    this.photoOverlay.style.display = 'block';
    this.photoOverlay.style.opacity = '1';
    
    // Fotoğraf çekildikten sonra ekranda göster
    setTimeout(() => {
      this.photoOverlay.style.opacity = '0';
      
      setTimeout(() => {
        // Fotoğraf görüntüsünü oluştur
        const photoFrame = document.createElement('div');
        photoFrame.style.position = 'fixed';
        photoFrame.style.top = '50%';
        photoFrame.style.left = '50%';
        photoFrame.style.transform = 'translate(-50%, -50%) rotate(5deg)';
        photoFrame.style.width = '400px';
        photoFrame.style.height = '300px';
        photoFrame.style.backgroundColor = 'white';
        photoFrame.style.padding = '20px';
        photoFrame.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        photoFrame.style.zIndex = '2001';
        photoFrame.style.transition = 'all 0.5s ease-in-out';
        
        // Fotoğraf içeriği
        const photo = document.createElement('div');
        photo.style.width = '100%';
        photo.style.height = '85%';
        photo.style.backgroundImage = `url(${this.greenScreencarImagePaths[this.currentImageIndex]})`;
        photo.style.backgroundSize = 'cover';
        photo.style.backgroundPosition = 'center';
        
        // Fotoğraf altı etiket
        const label = document.createElement('div');
        label.style.textAlign = 'center';
        label.style.marginTop = '10px';
        label.style.fontFamily = 'monospace';
        label.style.color = '#555';
        
        // Arka plan görüntüsüne göre etiket metnini ayarla
        if (this.currentImageIndex === 0) {
          label.textContent = 'Çöl Manzarası';
        } else if (this.currentImageIndex === 1) {
          label.textContent = 'Göl Manzarası';
        } else {
          label.textContent = 'İzlanda Manzarası';
        }
        
        photoFrame.appendChild(photo);
        photoFrame.appendChild(label);
        document.body.appendChild(photoFrame);
        this.inRoom = false;
        
        // Fotoğrafı ekrandan kaldır
        setTimeout(() => {
          photoFrame.style.transform = 'translate(-50%, -50%) rotate(5deg) scale(0.1)';
          photoFrame.style.opacity = '0';
          
          setTimeout(() => {
            document.body.removeChild(photoFrame);
          }, 500);
        }, 3000);
      }, 300);
    }, 100);
  }

  changeGreenscreenTexture(imageIndex) {
    try {
      this.currentImageIndex = imageIndex;
      this.inRoom = true; // Görsel seçildiğinde inRoom'u true yap
  
      const imagePath = this.greenScreenImagePaths[imageIndex];
  
      const textureLoader = new THREE.TextureLoader();
  
      const box = new THREE.Box3().setFromObject(this.greenScreenMesh);
      const size = new THREE.Vector3();
      box.getSize(size);
  
      textureLoader.load(
        imagePath,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
  
          texture.repeat.set(-1, 1);
          texture.offset.set(0, 0.5 - texture.repeat.y / 2); // Ortalamak için offset
          texture.rotation = Math.PI; // Gerekirse döndürme
          texture.center.set(0.5, 0.5); // Merkezden döndürme
       
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            color: 0xffffff,
            emissive: 0xFFFFFF,
            emissiveIntensity: .05,
          });
  
          this.greenScreenMesh.material = material;
          this.greenScreenMesh.material.needsUpdate = true;
        },
        undefined,
        (error) => {
          console.error(`Error loading texture:`, error);
        }
      );
  
      this.areas.car.physics.car.chassis.body.position.copy(new CANNON.Vec3(-54.2, 30.5, 1));
      this.physics.car.chassis.body.quaternion.copy(new CANNON.Quaternion(0, 0, - Math.PI / 3, 1));
  
      this.areas.car.physics.car.chassis.body.velocity.set(0, 0, 0);
      this.areas.car.physics.car.chassis.body.angularVelocity.set(0, 0, 0);
  
      this.areas.car.physics.car.chassis.body.wakeUp();
      
      // inRoom değişkeninin değiştiğini konsola yazdır
      console.log("inRoom değişti:", this.inRoom);
      
      // Klavye olaylarını yeniden ayarla
      this._setupKeyboardEvents();
  
    } catch (error) {
      console.error('Error changing greenscreen texture:', error);
    }
  }

  setZone() {
      const zone = this.zones.add({
        position: { x: this.position.x + 1, y: this.position.y + 2 },
        halfExtents: { x: 2.6, y: 2 },
        data: { cameraAngle: 'greenScreenCam' }
    })

    zone.on('in', (_data) => {
      this.camera.angle.set(_data.cameraAngle)
      gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 })
      gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })
    })

    zone.on('out', () => {
      this.camera.angle.set('default')
      gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 })
      gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })
    })
  }
}