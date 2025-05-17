import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(-33, 20, 1);

export default class SectionConcert {
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
    
  _buildModel() 
  {
    const gltf = this.resources.items.Concert;
        const base = this.resources.items.Base;
      
        if (!gltf || !gltf.scene) {
          console.error('SectionConcert bina modeli bulunamadı');
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
        baseModel.position.set(this.position); // Pozisyonu ayarla
        baseModel.scale.set(1, 1, 1); // Base modelinin ölçeği
        //this.container.add(baseModel);
       
        // Kapsül model pozisyonu ve dönüşü
        const modelPosition = this.position;
        model.position.copy(modelPosition);
        model.rotation.set(this.rotateX, this.rotateY, 81.4);
        this.container.add(model);
       
        // Bounding box hesapla
        baseModel.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(model);
        var size = bbox.getSize(new THREE.Vector3());
       
        // Fizik gövdesi oluştur
        const halfExtents = new CANNON.Vec3(size.x / 1.9, 3, size.z * 1.5);
        const boxShape = new CANNON.Box(halfExtents);
       
        const body = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(
            this.position.x - 1.25,
            this.position.y,
            this.position.z
          ),
          material: this.physics.materials.items.floor,
        });
      
        // Dönüşü quaternion olarak ayarla
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(Math.PI / 2, this.rotateY, this.rotateZ, 'XYZ');
        body.quaternion.copy(quat);
      
        body.addShape(boxShape);
        //this.physics.world.addBody(body);
      
        // Obje sistemine ekle
        if (this.objects) {
          const children = model.children.slice();
          const objectEntry = this.objects.add({
            base: { children },
            collision: { children },
            mass: 0,
            offset: this.position,
          });
          objectEntry.collision = { body };
          if (objectEntry.container) {
            this.container.add(objectEntry.container);
          }
        }
  }
}