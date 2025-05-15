import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(36.1, -18, 3.5);

export default class SectionCapsule {
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
    const gltf = this.resources.items.Capsule;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('Kapsül modeli bulunamadı');
      return;
    }
  
    if (!base || !base.scene) {
      console.error('Base modeli bulunamadı');n
      return;
    } 
  
    // Kapsül modelini klonla ve malzemeleri kopyala
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
        child.scale.set(1, 1, 1); // Kapsül modelinin ölçeği
      }
    });
  
    // Base modelini klonla ve Kapsül modeline ekle
    const baseModel = base.scene.clone(true);
    baseModel.position.set(37, -18, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
    baseModel.scale.set(1.5, 1.5, 1.5); // Base modelinin ölçeği
    this.container.add(baseModel);
  
    // Kapsül model pozisyonu ve dönüşü
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    this.container.add(model);
  
    // Bounding box hesapla
    baseModel.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(baseModel);
    var size = bbox.getSize(new THREE.Vector3());
  
    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 1.9, size.z / 1.9);
    const boxShape = new CANNON.Box(halfExtents);
  
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        this.position.x + 1.5,
        this.position.y,
        this.position.z -3
      ),
      material: this.physics.materials.items.floor
    });

    baseModel.children[0].material.color.r = .2;
    baseModel.children[0].material.color.g = 1;
    baseModel.children[0].material.color.b = .2;
  
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