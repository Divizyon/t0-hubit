import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(0, 0, 0);

export default class SectionStone {
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

    this._buildModel(new THREE.Vector3(-69.98, -15.74, 0));
    this._buildModel(new THREE.Vector3(-64.8, -17.03, 0));
    this._buildModel(new THREE.Vector3(-63.43, -19.59, 0));
    this._buildModel(new THREE.Vector3(-66.846, -17.896, 0));
    this._buildModel(new THREE.Vector3(-67.08, -15.288, 0));

    this._buildModel(new THREE.Vector3(-65.508, -4.0425, 0));
    this._buildModel(new THREE.Vector3(-69.13, -2.448, 0));
    this._buildModel(new THREE.Vector3(-71.75, 0.918, 0));
    this._buildModel(new THREE.Vector3(-67.572, -0.534, 0));

    this._buildModel(new THREE.Vector3(-59.376, 6.63637, 0));
    this._buildModel(new THREE.Vector3(-62.935, 10.116, 0));   
    this._buildModel(new THREE.Vector3(-57.8, 7.8, 0));   
    this._buildModel(new THREE.Vector3(-60.676, 10.3376, 0));   

    this._buildModel(new THREE.Vector3(-52.63, 21.52, 0));   
    this._buildModel(new THREE.Vector3(-55.93, 23.54, 0));   
    this._buildModel(new THREE.Vector3(-59.34, 22.31, 0));   
    this._buildModel(new THREE.Vector3(-52.42, 17.11, 0));   
    this._buildModel(new THREE.Vector3(-57.35, 21.5, 0));   
    this._buildModel(new THREE.Vector3(-54.22, 19.53, 0));   
    this._buildModel(new THREE.Vector3(-58.7, 24.92, 0));   
    // this._buildModel(new THREE.Vector3(-58.75, 25.95, 0));   
    // this._buildModel(new THREE.Vector3(-50.74, 19.713, 0));   
    // this._buildModel(new THREE.Vector3(-54.4, 19.68, 0));   
    // this._buildModel(new THREE.Vector3(-51.97, 17.424, 0));   
    // this._buildModel(new THREE.Vector3(-52.363, 12.63, 0));   
    this.scene.add(this.container);
  }
  
    
  _buildModel(positionn) {
    // A D
    const gltf = this.resources.items.tilesABase;
  
    if (!gltf || !gltf.scene) {
      console.error('SectionStone bina modeli bulunamadı');
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
    });
  
    // Base modelini klonla ve Kapsül modeline ekle

    model.position.copy(positionn);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    this.container.add(model);
   
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    var size = bbox.getSize(new THREE.Vector3());
   
    const halfExtents = new CANNON.Vec3(size.x - .2, size.y - .2, size.z);
    const boxShape = new CANNON.Box(halfExtents);
   
    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(positionn.x, positionn.y, positionn.z - .025),
        material: this.physics.materials.items.floor
    });

    model.children[0].material.color.b = 0;
    model.children[0].material.color.g = 0;
    model.children[0].material.color.r = 1;
  
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