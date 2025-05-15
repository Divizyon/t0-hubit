import * as THREE from 'three';
import CANNON from 'cannon';

export default class SectionTrafficLight {
  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, position }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;

    this.container = new THREE.Object3D();
    this.position = position;

    //this._buildModel();
    //0this.scene.add(this.container);
  }

  
    
  _buildModel() {
    const gltf = this.resources.items.TrafficLight ;
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('RoadSign modeli bulunamadı');
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

    const baseModel = base.scene.clone(true);
    baseModel.position.set(42.5, 14, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
    baseModel.scale.set(0, 0, 0) // Base modelinin ölçeği
    // this.container.add(baseModel);
    
    model.scale.set(.13, .13, .13)
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
  
    // Kapsül model pozisyonu ve dönüşü
    model.position.copy(this.position);
    this.container.add(model);

    // Bounding box hesapla
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    var size = bbox.getSize(new THREE.Vector3());

    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x * 1.5, size.y * 1.5, size.z * 10);
    const boxShape = new CANNON.Box(halfExtents);

    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
      material: this.physics.materials.items.floor
    });

    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    body.quaternion.copy(quat);

    //body.addShape(boxShape);
    //this.physics.world.addBody(body);
    
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