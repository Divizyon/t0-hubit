import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CANNON from 'cannon'

export default class SectionJapanesePark {
    constructor(_options) {
        this.time = _options.time;
        this.scene = _options.scene;
        this.physics = _options.physics;
        this.position = new THREE.Vector3(13, -28, 1.5);
        this.mixer = null;
        this.model = null;
        this.collisionBody = null;
        this.setModel();
        
        if (this.time) {
            this.time.on('tick', () => {
                this.tick(this.time.delta * 0.001);
            });
        } else {
            console.warn('SectionJapanesePark: time parametresi verilmedi, animasyonlar çalışmayacak.');
        }
    }

    setModel() {
        if (!this.scene) {
            console.warn('SectionJapanesePark: scene parametresi verilmedi, model sahneye eklenmeyecek.');
            return;
        }

        const loader = new GLTFLoader();
        loader.load('./models/SectionJapanesePark/base.glb', (gltf) => {
            
            this.model = gltf.scene;
            this.model.position.set(13, -28, 1.5);
            this.model.scale.set(1,1,1);

            this.model.rotation.x = -80.1;
            this.model.rotation.y = -55;
            
            this.scene.add(this.model);

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
                    }
                    if (child.material && child.material.type === 'MeshBasicMaterial') {
                        child.material = new THREE.MeshStandardMaterial({ color: child.material.color || 0xffffff });
                    }
                    child.material.transparent = false;
                    child.material.opacity = 1;
                }
            });
        });

        loader.load('./models/Base/base.glb', (gltf) => {
            const baseModel = gltf.scene;
            baseModel.position.set(11.5, -27.5, -.5); // Pozisyonu ayarlayın
            baseModel.scale.set(3.4, 2.6, 1.5); // Ölçeği ayarlayın
            this.scene.add(baseModel);
    
            // Materyal ve mesh kontrolü
            baseModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
                    }
                    if (child.material && child.material.type === 'MeshBasicMaterial') {
                        child.material = new THREE.MeshStandardMaterial({ color: child.material.color || 0xffffff });
                    }
                    child.material.transparent = false;
                    child.material.opacity = 1;

                    child.material = child.material.clone();
                    child.material.color.r = .2;
                    child.material.color.g = .6;
                    child.material.color.b = 0;
                }
            });

            if (this.physics) {
                this.collisionBody = new CANNON.Body({
                    mass: 0,
                    position: baseModel.position,
                    material: this.physics.materials.items.floor
                });

                // Sphere yerine Box collision kullanıyoruz
                baseModel.updateMatrixWorld(true);
                const bbox = new THREE.Box3().setFromObject(baseModel);
                var size = bbox.getSize(new THREE.Vector3());
            
                // Fizik gövdesi oluştur
                const halfExtents = new CANNON.Vec3(size.x / 1.97, size.y / 1.97, 2);
                const boxShape = new CANNON.Box(halfExtents);
            
                const body = new CANNON.Body({
                mass: 0,
                position: new CANNON.Vec3(
                    baseModel.position.x,
                    baseModel.position.y,
                    1
                ),
                material: this.physics.materials.items.floor
                });

                const quat = new CANNON.Quaternion();
                quat.setFromEuler(this.rotateX, this.rotateY, this.rotateZ, 'XYZ');
                body.quaternion.copy(quat);
                
                console.log(boxShape)
                body.addShape(boxShape);
                //this.collisionBody.addBody(body);
                this.collisionBody.addShape(boxShape);
                this.physics.world.addBody(this.collisionBody);
            }
        });
    }

    tick(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
}
