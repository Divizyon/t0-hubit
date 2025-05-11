import * as THREE from 'three';
import CANNON from 'cannon';

export default class SectionCapsule {
  static DEFAULT_POSITION = new THREE.Vector3(27, -3, 3.7);

  constructor({ scene, resources, objects, physics, debug, rotateX = 0, rotateY = 0, rotateZ = 0, scale = 1 }) {
    this.scene = scene;
    this.resources = resources;
    this.objects = objects;
    this.physics = physics;
    this.debug = debug;

    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;
    this.scale = scale;

    this.container = new THREE.Object3D();
    this.position = SectionCapsule.DEFAULT_POSITION.clone();


    this._buildModel();
    this.scene.add(this.container);
  }

  _buildModel() {
    const gltf = this.resources.items.Capsule;
    if (!gltf || !gltf.scene) {
      console.error('SectionCapsule modeli bulunamadı');
      return;
    }

    // Modeli klonla ve malzemeleri kopyala
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

    // Model pozisyonu ve dönüşü
    model.position.copy(this.position);
    model.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
    model.scale.set(1.8, 1.8, 1.8);
    this.container.add(model);

    // Bounding box hesapla
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());

    // Fizik gövdesi oluştur
    const halfExtents = new CANNON.Vec3(size.x / 1, size.y / 1, size.z / 1);
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
        mass: 0,
      });
      objectEntry.collision = { body };
      if (objectEntry.container) {
        this.container.add(objectEntry.container);
      }
    }
  }
}