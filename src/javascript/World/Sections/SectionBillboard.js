import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(0, 0, 0);

export default class SectionBillboard {
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
    
    this.billboards = [
      { position: { x: 0, y: 40, z: 0 }, name: "Billboard1" },
      { position: { x: 10, y: 40, z: 0 }, name: "Billboard2" },
      { position: { x: 20, y: 40, z: 0 }, name: "Billboard3" },
      { position: { x: 30, y: 40, z: 0 }, name: "Billboard4" },
      { position: { x: 40, y: 40, z: 0 }, name: "Billboard5" },
      { position: { x: 50, y: 40, z: 0 }, name: "Billboard6" }
    ];

    // Her bir billboard için model oluştur
    this.billboards.forEach((billboard) => {
      this._buildModel(billboard.position, billboard.name);
    });

    this.scene.add(this.container);
  }

  _buildModel(position, name) {
    const gltf = this.resources.items[name];
    const base = this.resources.items.Base;
  
    if (!gltf || !gltf.scene) {
      console.error('SectionBillboard bina modeli bulunamadı');
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
  
    // Base modelini klonla ve Kapsül modeline ekle
    const baseModel = base.scene.clone(true);
    baseModel.position.set(0 + position.x, 0 + position.y, 0 + position.z); // Pozisyonu ayarla
    baseModel.scale.set(1, 1, 1); // Base modelinin ölçeği
    //this.container.add(baseModel);
   
    // Kapsül model pozisyonu ve dönüşü
    const modelPosition = new THREE.Vector3(position.x, position.y, position.z);
    model.position.copy(modelPosition);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ + -Math.PI/2);
    this.container.add(model);
   
    // Bounding box hesapla
    baseModel.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(baseModel);
    var size = bbox.getSize(new THREE.Vector3());
   
    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x / 3, size.y / 2.3, size.z);
    const boxShape = new CANNON.Box(halfExtents);
   
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(
        position.x,
        position.y,
        position.z
      ),
      material: this.physics.materials.items.floor
    });
  
    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ + -Math.PI/2, 'XYZ');
    body.quaternion.copy(quat);
  
    body.addShape(boxShape);
    this.physics.world.addBody(body);
  
    // Obje sistemine ekle
    if (this.objects) {
      const children = model.children.slice();
      const objectEntry = this.objects.add({
        base: { children },
        collision: { children },
        offset: new THREE.Vector3(position.x, position.y, position.z),
        mass: 0
      });
      objectEntry.collision = { body };
      if (objectEntry.container) {
        this.container.add(objectEntry.container);
      }
    }
  }
}