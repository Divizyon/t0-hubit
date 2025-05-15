import * as THREE from 'three'
import CANNON from 'cannon'

export default class SectionNewton {
  constructor({ scene, resources, objects, rotateX = 0, rotateY = 0, rotateZ = 0, position = null, materials = null, areas = null, time = null, physics }) {
    // Özellikleri kaydet
    this.scene = scene
    this.resources = resources
    this.objects = objects
    this.materials = materials
    this.areas = areas
    this.time = time
    this.physics = physics
    
    // Döndürme değerlerini (radyan) ayarla
    this.rotateX = rotateX
    this.rotateY = rotateY
    this.rotateZ = rotateZ
    
    this.position = position || new THREE.Vector3(-60,-37,0)
    this.timeScale = 1
    
    // Ana konteyner oluştur
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = false
    this.container.updateMatrix()
    this.scene.add(this.container)
    
    // Model oluştur
    this._buildModel()
    
    // Platform ekle
    this._buildPlatform()
  }
  
  _buildModel() {
    const gltf = this.resources.items.Newton
    if (!gltf || !gltf.scene) {
      console.error('Newton Salıncağı modeli bulunamadı')
      return
    }
    
    // Modeli klonla ve malzemeleri kopyala
    const model = gltf.scene.clone(true)
    
    // Model boyutunu ayarla - eğer gerekirse ölçeklendir
    model.scale.set(1, 1, 1)
    
    // Modelin materyallerini işle
    model.traverse(child => {
      if (child.isMesh) {
        const origMat = child.material
        const mat = origMat.clone()
        if (origMat.map) mat.map = origMat.map
        if (origMat.normalMap) mat.normalMap = origMat.normalMap
        if (origMat.roughnessMap) mat.roughnessMap = origMat.roughnessMap
        if (origMat.metalnessMap) mat.metalnessMap = origMat.metalnessMap
        mat.needsUpdate = true
        child.material = mat
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    // Model pozisyonu ve dönüşü
    model.position.copy(this.position)
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ)
    this.container.add(model)
    
    // Bounding box hesapla
    model.updateMatrixWorld(true)
    const bbox = new THREE.Box3().setFromObject(model)
    const size = bbox.getSize(new THREE.Vector3())

    const halfExtents = new CANNON.Vec3(size.x / 2.175, size.y, 3.6);
    const boxShape = new CANNON.Box(halfExtents);

    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(this.position.x + .75, this.position.y - 1.5, this.position.z),
      material: this.physics.materials.items.floor
    });

    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    body.quaternion.copy(quat);

    body.addShape(boxShape);
    this.physics.world.addBody(body);
    
    // Bu modeli animasyon için kullan
    this.model = model
    
    // Animasyonları ayarla (eğer varsa)
    if (gltf.animations && gltf.animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model)
      
      gltf.animations.forEach((clip) => {
        const action = this.mixer.clipAction(clip)
        action.setEffectiveTimeScale(this.timeScale)
        action.play()
      })
      
      // Time olayını dinle
      if (this.time) {
        this.time.on('tick', () => {
          if (this.mixer) {
            this.mixer.update(this.time.delta * 0.001 * this.timeScale)
          }
        })
      }
    }
    
    console.log('Newton Salıncağı eklendi, konum:', this.position)
  }
  
  // Animasyon hızını değiştirme metodu
  setAnimationSpeed(speed) {
    this.timeScale = speed
    
    // Tüm animasyonların hızını ayarla
    if (this.mixer) {
      this.mixer._actions.forEach((action) => {
        action.setEffectiveTimeScale(this.timeScale)
      })
    }
  }
  
  _buildPlatform() {
    // Bounding box hesapla
    this.model.updateMatrixWorld(true)
    const bbox = new THREE.Box3().setFromObject(this.model)
    const size = bbox.getSize(new THREE.Vector3())
    
    // Platform boyutunu model boyutuna göre ayarla
    const platformWidth = size.x -1
    const platformDepth = size.z -1
    const platformHeight = 0.5
    
    // Platform geometrisi
    const platformGeometry = new THREE.BoxGeometry(
      platformWidth, 
      platformHeight, 
      platformDepth
    )
    
    // Platform materyali
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.2
    })
    
    // Platform mesh'i
    this.platform = new THREE.Mesh(platformGeometry, platformMaterial)
    
    // Platform pozisyonu
    this.platform.position.set(
      this.position.x+0.4,
      this.position.y - size.y / 2 - platformHeight / 2+2.5,
      this.position.z
    )
    
    // Platform rotasyonu, ana modelin rotasyonuna uygun olarak
    this.platform.rotation.set(this.rotateX, this.rotateY, this.rotateZ)
    
    // Platform gölge atsın ve alsın
    this.platform.castShadow = true
    this.platform.receiveShadow = true
    
    // Platforma kenar çizgileri ekle
    const edgesGeometry = new THREE.EdgesGeometry(platformGeometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x666666,
      linewidth: 1
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    this.platform.add(edges)
    
    // Konteyner'a ekle
    this.container.add(this.platform)
  }
  
} 