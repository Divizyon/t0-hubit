import * as THREE from 'three';
import CANNON from 'cannon';

const DEFAULT_POSITION = new THREE.Vector3(-70, -8.75, 3.2);

export default class SectionRenderRoom {
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
    const gltf = this.resources.items.RenderRoom;
    const base = this.resources.items.Base;

    if (!gltf || !gltf.scene) {
      console.error('SectionRenderRoom bina modeli bulunamadı');
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
    baseModel.position.set(-70, -9.2, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
    baseModel.scale.set(1.5, 1.5, .5); // Base modelinin ölçeği
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
    baseModel2.position.set(-70, -9.2, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
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
    this.position.y -= .5;
    this.position.x -= .55;
    
    // Modeli ayrı bir container'a al ve o container'ı döndür
    const modelContainer = new THREE.Object3D();
    model.position.set(0, 0, 0); // Model pozisyonunu container'a göre ayarla
    model.scale.set(1.1, 1.1, 1.1);
    modelContainer.add(model);
    
    // Container'ı yerleştir ve döndür
    modelContainer.position.set(-70, -9.2, 3.2); // Base'in pozisyonuyla aynı X,Y değerleri, Z'yi öne getir
    modelContainer.rotation.z = Math.PI / 2;
    
    // Container'ı ana container'a ekle
    this.container.add(modelContainer);

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
        this.position.x,
        this.position.y,
        this.position.z - 2
      ),
      material: this.physics.materials.items.floor
    });

    // Dönüşü quaternion olarak ayarla
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
    body.quaternion.copy(quat);

    body.addShape(boxShape);
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