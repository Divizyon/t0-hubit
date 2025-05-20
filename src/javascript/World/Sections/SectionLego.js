import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(0, 0, 0);

export default class SectionLego {
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

    // Yellow legos
    // this._buildModel(new THREE.Vector3(-65.7, -16, 0), 1, 0.87, 0, 1, 2);
    // this._buildModel(new THREE.Vector3(-56.90, -9.05, 0), 1, 0.87, 0, 1.3, 1);
    // this._buildModel(new THREE.Vector3(-56.249, 9.35, 0), 1, 0.87, 0, 1, 1);
    // this._buildModel(new THREE.Vector3(-47.939, 3.27, 0), 1, 0.87, 0, 1, 1.7);
    // this._buildModel(new THREE.Vector3(-60, -27.4, 0), 1, 0.87, 0, 1.2, 1);

    // Red logos
    // this._buildModel(new THREE.Vector3(-56.04, -1.203, 0), .55, 0, 0, 1, 1);
    // this._buildModel(new THREE.Vector3(-50.36, 10.1, 0), .55, 0, 0, 1.6, 1);
    // this._buildModel(new THREE.Vector3(-60.7, -17.65, 0), .55, 0, 0, 1, 2);
    // this._buildModel(new THREE.Vector3(-57, 6.34, 0), .55, 0, 0, 1, 1.2);

    // Blue legos
    // this._buildModel(new THREE.Vector3(-52.65, .88, 0), 0, 0.55, 1, 1.2, 1);
    // this._buildModel(new THREE.Vector3(-51.5, 3.16, 0), 0, 0.55, 1, 1.2, 1);
    // this._buildModel(new THREE.Vector3(-60.81, 7.9, 0), 0, 0.55, 1, 1.2, 1);
    // this._buildModel(new THREE.Vector3(-63.764, -4.15, 0), 0, 0.55, 1, 1.2, 1);
    // this._buildModel(new THREE.Vector3(-53.32, -22.415, 0), 0, 0.55, 1, 1.2, 1);
    
    this.scene.add(this.container);
  }
  
    
  _buildModel(positionn, r, g, b, s1, s2) {
    // A D
    const gltf = this.resources.items.Lego;
  
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
    model.scale.set(s1, s2, .5);
    this.container.add(model);
   
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    var size = bbox.getSize(new THREE.Vector3());
   
    const halfExtents = new CANNON.Vec3(size.x - .2, size.y - .2, size.z);
    const boxShape = new CANNON.Box(halfExtents);
   
    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(positionn.x, positionn.y, positionn.z - .215),
        material: this.physics.materials.items.floor
    });

    model.children[0].material.color.r = r;
    model.children[0].material.color.g = g;
    model.children[0].material.color.b = b;

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