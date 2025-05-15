import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(-66.5, -25, 1.7);

export default class SectionCoWork {
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
    const gltf = this.resources.items.CoWork;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('CoWork modeli bulunamadı');
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
     baseModel.position.set(-67, -25, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
     baseModel.scale.set(1.5, 1.5, .5); // Base modelinin ölçeği
     baseModel.rotation.set(this.rotateX, this.rotateY, 0);
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
     baseModel2.position.set(-67, -25, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
     baseModel2.scale.set(1.5, 1.5, .5); // Base modelinin ölçeği
     baseModel2.rotation.set(this.rotateX, this.rotateY, 289.8);
     this.container.add(baseModel2);
     baseModel2.traverse(child => {
        if (child.isMesh) {
           child.material = child.material.clone();
           child.material.color.r = 2;
           child.material.color.g = 0;
           child.material.color.b = 0;
    }
    });
  
    // Kapsül model pozisyonu ve dönüşü
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    this.container.add(model);
  
    // Bounding box hesapla
    baseModel.updateMatrixWorld(true);
    baseModel2.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(baseModel);
    var size = bbox.getSize(new THREE.Vector3());
  
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, 2);
    const boxShape = new CANNON.Box(halfExtents);
  
    const body = new CANNON.Body({
      mass: 0,
      position: baseModel.position,
      material: this.physics.materials.items.floor
    });
  
    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(baseModel.rotation.x, baseModel.rotation.y, baseModel.rotation.z, 'XYZ');
    body.quaternion.copy(quat);
  
    body.addShape(boxShape);
    this.physics.world.addBody(body);

    //Base 2

    const bbox2 = new THREE.Box3().setFromObject(baseModel2);
    var size2 = bbox2.getSize(new THREE.Vector3());
  
    const halfExtents2 = new CANNON.Vec3(size2.x / 2.95, size2.y / 2.95, 2);
    const boxShape2 = new CANNON.Box(halfExtents2);
  
    const body2 = new CANNON.Body({
      mass: 0,
      position: baseModel2.position,
      material: this.physics.materials.items.floor
    });
  
    // Dönüşü quaternion olarak ayarla
    const quat2 = new CANNON.Quaternion();
    quat2.setFromEuler(baseModel2.rotation.x, baseModel2.rotation.y, baseModel2.rotation.z, 'XYZ');
    body2.quaternion.copy(quat2);
  
    body2.addShape(boxShape2);
    this.physics.world.addBody(body2);

  
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