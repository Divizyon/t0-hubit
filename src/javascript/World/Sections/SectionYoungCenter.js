import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(44, -32, 0.45);

export default class SectionYoungCenter {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0 }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.container = new THREE.Object3D();
    this.position = DEFAULT_POSITION.clone();

    this._buildModel();
    this.scene.add(this.container);
  }

  
    
  _buildModel() {
    const gltf = this.resources.items.YoungCenter;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('YoungCenter bina modeli bulunamadı');
      return;
    }
  
    if (!base || !base.scene) {
      console.error('Base modeli bulunamadı');
      return;
    }
  
    // Division modelini klonla ve malzemeleri kopyala
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
  
    // Base modelini klonla ve Division modeline ekle
    const baseModel = base.scene.clone(true);
    baseModel.position.set(43, -32, 0); // Base modelinin Division altına yerleştirilmesi için pozisyon ayarı
    baseModel.scale.set(1.5, 1.5, 1.5); // Base modelinin ölçeği
    this.container.add(baseModel);
  
    // Division model pozisyonu ve dönüşü
    model.position.copy(this.position);
    model.rotation.set(-Math.PI / 1, 0, 0);  // Modeli dik konuma getir
    this.container.add(model);
  
    // Bounding box hesapla
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
  
    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x / 3, size.y / 3, size.z / 2);
    const boxShape = new CANNON.Box(halfExtents);
  
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(...this.position.toArray()),
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
}