// src/javascript/World/Sections/SectionTram.js
import * as THREE from 'three';

export default class SectionTram {
  constructor({ scene, resources, physics, debug, time }) {
    this.scene = scene;
    this.resources = resources;
    this.physics = physics;
    this.debug = debug;
    this.time = time;

    this.container = new THREE.Object3D();
    this.container.name = 'Tram';
    
    // Tramvay parametreleri
    this.tramSpeed = 0.2;
    this.tramPosition = 0;
    this.railRadius = 15; // Alaaddin etrafındaki rayın yarıçapı
    
    // Tramvayı oluştur ve pozisyonla
    this._createTram();
    
    // Her karede güncelle
    this.time.on('tick', () => this._update());
    
    this.scene.add(this.container);
  }
  
  _createTram() {
    try {
      // Tram modelini yükle
      if (this.resources.items.tramBase && this.resources.items.tramBase.scene) {
        console.log('Tram modeli yüklendi');
        
        // Modeli klonla
        this.tram = this.resources.items.tramBase.scene.clone();
        
        // Malzemeleri ayarla
        this.tram.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Materyal klonlama
            if (child.material) {
              const mat = child.material.clone();
              mat.needsUpdate = true;
              child.material = mat;
            }
          }
        });
        
        // Tram ölçeğini modele göre ayarla
        this.tram.scale.set(0.5, 0.5, 0.5);
        
        // Tramı container'a ekle
        this.container.add(this.tram);
        
        // Başlangıç pozisyonunu ayarla
        this._updateTramPosition();
      } else {
        console.error('Tram modeli bulunamadı!');
      }
    } catch (error) {
      console.error('Tram oluşturma hatası:', error);
    }
  }
  
  _updateTramPosition() {
    // Daire etrafında hareket için açıyı hesapla
    const angle = this.tramPosition * Math.PI * 2;
    
    // X ve Z koordinatlarını hesapla (daire üzerinde)
    const x = Math.cos(angle) * this.railRadius;
    const z = Math.sin(angle) * this.railRadius;
    
    // Tramın pozisyonunu güncelle - sabit yükseklikte tut
    const heightAboveGround = 0; 
    this.tram.position.set(x, heightAboveGround, z);
    
    // Tramı düz tut, sabit bir yöne baksın
    this.tram.rotation.set(0, 0, 0);
  }
  _update() {
    // Tramvay pozisyonunu güncelle
    this.tramPosition += this.tramSpeed * 0.001;
    
    // 0-1 aralığında tut (tam tur)
    if (this.tramPosition >= 1) {
      this.tramPosition = 0;
    }
    
    // Pozisyonu güncelle
    this._updateTramPosition();
  }
  
  // Hareketi başlat/durdur
  toggleMovement() {
    this.tramSpeed = this.tramSpeed === 0 ? 0.2 : 0;
    return this.tramSpeed > 0 ? "Tram hareket ediyor" : "Tram durdu";
  }
  
  // Etkileşim alanı ekle
  addInteractionArea() {
    if (this.physics && this.physics.areas) {
      this.interactionArea = this.physics.areas.add({
        position: new THREE.Vector2(this.container.position.x, this.container.position.z),
        halfExtents: new THREE.Vector2(this.railRadius + 5, this.railRadius + 5),
        debug: this.debug
      });
      
      this.interactionArea.on('interact', () => {
        const status = this.toggleMovement();
        console.log(status);
      });
    }
  }
}