import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CANNON from 'cannon'

export default class SectionYoungCard {
    constructor(_options) {
        this.time = _options.time;
        this.scene = _options.scene;
        this.physics = _options.physics;
        this.resources = _options.resources;
        this.mixer = null;
        this.model = null;
        this.collisionBody = null;
        this.setModel();
        
        if (this.time) {
            this.time.on('tick', () => {
                this.tick(this.time.delta * 0.001);
            });
        } else {
            console.warn('SectionYoungCard: time parametresi verilmedi, animasyonlar çalışmayacak.');
        }
    }

    setModel() {
        if (!this.scene) {
            console.warn('SectionYoungCard: scene parametresi verilmedi, model sahneye eklenmeyecek.');
            return;
        }

        const loader = new GLTFLoader();
        loader.load('./models/SectionYoungCard/base.glb', (gltf) => {
            
            this.model = gltf.scene;
            this.model.position.set(42.5,-38,1.7);
            this.model.scale.set(1,1,1);
            this.model.rotation.set(Math.PI,Math.PI,0)

            const base = this.resources.items.Base;
            const baseModel = base.scene.clone(true);
            baseModel.position.set(42.5, -38, 0); // Base modelinin Kapsül altına yerleştirilmesi için pozisyon ayarı
            baseModel.scale.set(1.5, 1, 1.5); // Base modelinin ölçeği
            baseModel.rotation.set(Math.PI,Math.PI,Math.PI/2)

            baseModel.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(baseModel);
            var size = bbox.getSize(new THREE.Vector3());
            
            // Fizik gövdesi oluştur
            const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
            const boxShape = new CANNON.Box(halfExtents);
            
            const body = new CANNON.Body({
                mass: 0,
                position: baseModel.position,
                material: this.physics.materials.items.floor
            });

            baseModel.traverse(child => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.color.r = .2;
                    child.material.color.g = 0;
                    child.material.color.b = .6;
                }
              });
            
            
            // Dönüşü quaternion olarak ayarla
            const quat = new CANNON.Quaternion();
            quat.setFromEuler(Math.PI, Math.PI, 0);
            body.quaternion.copy(quat);
            
            body.addShape(boxShape);
            this.physics.world.addBody(body);
            this.scene.add(baseModel);

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
                // console.log('Animasyonlar yükleniyor...');
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip, index) => {
                    //console.log(`Animasyon ${index} yükleniyor:`, clip.name);
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
