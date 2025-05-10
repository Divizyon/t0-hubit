import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CANNON from 'cannon'

export default class SectionStadium {
    constructor(_options) {
        this.time = _options.time;
        this.scene = _options.scene;
        this.physics = _options.physics;
        this.mixer = null;
        this.model = null;
        this.collisionBody = null;
        this.setModel();
        
        if (this.time) {
            this.time.on('tick', () => {
                this.tick(this.time.delta * 0.001);
            });
        } else {
            console.warn('SectionStadium: time parametresi verilmedi, animasyonlar çalışmayacak.');
        }
    }

    setModel() {
        if (!this.scene) {
            console.warn('SectionStadium: scene parametresi verilmedi, model sahneye eklenmeyecek.');
            return;
        }

        const loader = new GLTFLoader();
        loader.load('./models/SectionStadium/base.glb', (gltf) => {
            
            this.model = gltf.scene;
            this.model.position.set(8, -38, 1);
            this.model.scale.set(.7, .7, .7);
            
            // Modeli döndür
            this.model.rotation.x = 80.1;
            this.model.rotation.y = 92.65;
            
            this.scene.add(this.model);

          
            if (this.physics) {
                this.collisionBody = new CANNON.Body({
                    mass: 0,
                    position: new CANNON.Vec3(8, -37, 1),
                    material: this.physics.materials.items.floor
                });

                // Sphere yerine Box collision kullanıyoruz
                const boxShape = new CANNON.Box(new CANNON.Vec3(
                    6.2, // x boyutu
                    5, // y boyutu
                    6.2  // z boyutu
                ));
                this.collisionBody.addShape(boxShape);
                
                this.physics.world.addBody(this.collisionBody);
            }

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
                    console.log('Mesh bulundu:', child.name);
                    if (child.isSkinnedMesh) {
                        console.log('SkinnedMesh bulundu:', child.name);
                    }
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
                // console.log('Animasyonlar yükleniyor...');
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip, index) => {
                    console.log(`Animasyon ${index} yükleniyor:`, clip.name);
                    const action = this.mixer.clipAction(clip);
                    action.reset().play();
                });
                // console.log('Mixer oluşturuldu:', this.mixer);
            } else {
                // console.warn('Hiç animasyon bulunamadı!');
            }
        });
    }

    tick(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
}
