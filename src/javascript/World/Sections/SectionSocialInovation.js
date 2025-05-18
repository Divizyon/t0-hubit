import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CANNON from 'cannon'

const DEFAULT_POSITION = new THREE.Vector3(75.5, -9.5, .5)

export default class SectionSocialInovation {
    constructor(_options) {
        this.time = _options.time;
        this.scene = _options.scene;
        this.physics = _options.physics;
        this.mixer = null;
        this.model = null;
        this.collisionBody = null;
        this.position = DEFAULT_POSITION.clone()
        this.setModel();
        
        if (this.time) {
            this.time.on('tick', () => {
                this.tick(this.time.delta * 0.001);
            });
        } else {
            console.warn('SocialInovation: time parametresi verilmedi, animasyonlar çalışmayacak.');
        }
    }

    setModel() {
        if (!this.scene) {
            console.warn('SocialInovation: scene parametresi verilmedi, model sahneye eklenmeyecek.');
            return;
        }

        const loader = new GLTFLoader();
        loader.load('./models/SectionSocialInovation/base.glb', (gltf) => {
            //console.log('Balık modeli yüklendi:', gltf);
            //console.log('Animasyonlar:', gltf.animations);
            
            this.model = gltf.scene;
            this.model.position.copy(this.position);
            this.model.scale.set(1,1,1);
            
            // Modeli döndür
            //this.model.rotation.x = 0;
            
            this.scene.add(this.model);

            // Işık ekle (sadece bir kez)
            if (!this.scene.__balikLightAdded) {
                this.scene.add(new THREE.AmbientLight(0xffffff, 2));
                const dirLight = new THREE.DirectionalLight(0xffffff, 2);
                dirLight.position.set(75, -10, 7.5);
                this.scene.add(dirLight);
                this.scene.__balikLightAdded = true;
            }

            // Materyal ve mesh kontrolü
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
            baseModel.position.set(75, -10, 0); // Pozisyonu ayarlayın
            baseModel.scale.set(1, 1, 1.5); // Ölçeği ayarlayın
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
                    child.material.color.g = 0;
                    child.material.color.b = .6;
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