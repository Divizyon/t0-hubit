import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CANNON from 'cannon'

export default class SectionAlaaddin {
    constructor(_options) {
        this.time = _options.time;
        this.scene = _options.scene;
        this.physics = _options.physics;
        this.mixer = null;
        this.model = null;
        this.collisionBody = null;
        this.position = new THREE.Vector3(9.3, -52.5, 1);
        this.setModel();
        
        if (this.time) {
            this.time.on('tick', () => {
                this.tick(this.time.delta * 0.001);
            });
        } else {
            console.warn('AlaaddinTepesi: time parametresi verilmedi, animasyonlar çalışmayacak.');
        }
    }

    setModel() {
        if (!this.scene) {
            console.warn('AlaaddinTepesi: scene parametresi verilmedi, model sahneye eklenmeyecek.');
            return;
        }

        const loader = new GLTFLoader();
        loader.load('./models/SectionAlaaddin/base.glb', (gltf) => {
            //console.log('Balık modeli yüklendi:', gltf);
            //console.log('Animasyonlar:', gltf.animations);
            
            this.model = gltf.scene;
            this.model.position.set(9.3, -52.5, 1);
            this.model.scale.set(1,1,1);
            
            // Modeli döndür
            this.model.rotation.x = Math.PI / 2;
            
            this.scene.add(this.model);

            // Işık ekle (sadece bir kez)
            if (!this.scene.__balikLightAdded) {
                this.scene.add(new THREE.AmbientLight(0xffffff, 2));
                const dirLight = new THREE.DirectionalLight(0xffffff, 2);
                dirLight.position.set(5, 10, 7.5);
                this.scene.add(dirLight);
                this.scene.__balikLightAdded = true;
            }

            // Materyal ve mesh kontrolü
            this.model.traverse((child) => {
                if (child.isMesh) {
                    // console.log('Mesh bulundu:', child.name);
                    // if (child.isSkinnedMesh) {
                    //     console.log('SkinnedMesh bulundu:', child.name);
                    // }
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

            // Animasyonları başlat
            if (gltf.animations && gltf.animations.length > 0) {
                //console.log('Animasyonlar yükleniyor...');
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip, index) => {
                    //console.log(`Animasyon ${index} yükleniyor:`, clip.name);
                    const action = this.mixer.clipAction(clip);
                    action.reset().play();
                });
                //console.log('Mixer oluşturuldu:', this.mixer);
            } else {
                console.warn('Hiç animasyon bulunamadı!');
            }
        });

        loader.load('./models/Base/base.glb', (gltf) => {
            const baseModel = gltf.scene;
            baseModel.position.set(9, -52, -.5); // Pozisyonu ayarlayın
            baseModel.scale.set(3.8, 3.8, 1.5); // Ölçeği ayarlayın
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

/* 
Resource.js   { name: 'aladdinTepesi', source: './models/hubit/aladdinTepesi/base.glb' },
İndex Js
    setAladdinTepesi() {
        this.aladdinTepesi = new AladdinTepesi({
            scene: this.scene,
            time: this.time,
            physics: this.physics
        });
    }
this.setAladdinTepesi()
import AladdinTepesi from './Hubit/AlaaddinTepesi.js'
*/