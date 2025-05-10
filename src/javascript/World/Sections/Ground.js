import * as THREE from 'three'

export default class Ground {
    constructor(_options) {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.materials = _options.materials
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // this.setStatic()
        this.setDikes()
        this.setFloor()

        // Divizyon Building ekleme
        this.setDivizyonBuilding()
    }

    setDivizyonBuilding() {
        // Kaynakları kontrol et
        if (!this.resources.items.divizyonBuilding) {
            console.warn('Divizyon Building modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Dereceyi radyana çeviren yardımcı fonksiyon
            const degToRad = (degrees) => {
                return degrees * (Math.PI / 180);
            };
            
            // Model klonlanır
            const divizyonBuildingModel = this.resources.items.divizyonBuilding.scene.clone();
            
            // Özel materyaller oluştur
            const whiteMaterial = new THREE.MeshStandardMaterial({
                color: 0xF5F5F5,       // Beyaz
                roughness: 0.3,
                metalness: 0.1
            });
            
            const blueMaterial = new THREE.MeshStandardMaterial({
                color: 0x5B8CF5,       // Mavi - Hubit mavisi
                roughness: 0.2,
                metalness: 0.5
            });
            
            const grayMaterial = new THREE.MeshStandardMaterial({
                color: 0x757575,       // Koyu gri
                roughness: 0.7,
                metalness: 0.2
            });
            
            const glassMaterial = new THREE.MeshStandardMaterial({
                color: 0xEEEEEE,       // Cam rengi
                roughness: 0.05,
                metalness: 0.9,
                transparent: true,
                opacity: 0.6
            });
            
            // Merkez noktası ayarla - model merkezini düzelt
            const box = new THREE.Box3().setFromObject(divizyonBuildingModel);
            const center = box.getCenter(new THREE.Vector3());
            
            // Modelin merkezi orijine taşınır
            divizyonBuildingModel.position.sub(center);
            
            // Modelin materyallerini düzeltme
            let meshIndex = 0;
            divizyonBuildingModel.traverse((child) => {
                if (child.isMesh) {
                    // Mesh görünürlüğünü ayarla
                    child.visible = true;
                    child.frustumCulled = false;
                    
                    // Z-fighting sorununu çözmek için polygonOffset kullan
                    const offsetFactor = 0.1 + (meshIndex * 0.01);
                    meshIndex++;
                    
                    // Varsayılan materyali belirle (tüm mesh'ler için aynı materyal kullan, daha güvenli)
                    let selectedMaterial = whiteMaterial.clone();
                    
                    // Materyal atama
                    child.material = selectedMaterial;
                    
                    // Z-fighting için ayarlar
                    child.material.polygonOffset = true;
                    child.material.polygonOffsetFactor = offsetFactor;
                    child.material.polygonOffsetUnits = 1.0;
                    
                    // Gölge ayarları
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Normal ve UV haritaları da güncelle
                    if (child.geometry) {
                        child.geometry.computeVertexNormals();
                    }
                    
                    console.log(`DivizyonBuilding Mesh düzeltildi: ${child.name}`);
                }
            });
            
            // Rotasyon değerleri (modeli olduğu gibi bırak)
            const xRotation = 0;        // X ekseni eğimi
            const yRotation = 0;        // Y ekseni dönüşü yapmadan olduğu gibi bırak
            const zRotation = 0;        // Z ekseni dönüşü
            
            // DivizyonBuilding modelini yükle - rotasyonsuz, tam görünür halde
            this.objects.add({
                base: divizyonBuildingModel,
                collision: divizyonBuildingModel, 
                offset: new THREE.Vector3(-22, 0, 0.5), // Z değerini artırarak modelin tamamen görünmesini sağla
                rotation: new THREE.Euler(
                    degToRad(xRotation),
                    degToRad(yRotation),
                    degToRad(zRotation)
                ),
                scale: new THREE.Vector3(0.05, 0.05, 0.05), // Ölçeği küçülterek tamamının görünmesini sağla
                mass: 0,
                shadow: { sizeX: 5, sizeY: 5, offsetZ: 0.1, offsetX: 0, offsetY: 0 }
            });
            console.log('DivizyonBuilding modeli başarıyla yüklendi');
        } catch (error) {
            console.error('DivizyonBuilding modelini yüklerken hata oluştu:', error);
        }
    }

    setFloor() {
        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(160, 96),
            new THREE.MeshBasicMaterial({
                color: 0xd6c685 ,
                transparent: true,
                opacity: 0.5,
                depthWrite: false
            })
        )
        this.floor.frustumCulled = false
        this.floor.matrixAutoUpdate = false
        this.floor.updateMatrix()
        this.container.add(this.floor)
    }

    setDikes() {
        this.dikes = {}
        this.dikes.brickOptions = {
            base: this.resources.items.brickBase.scene,
            collision: this.resources.items.brickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0,
            soundName: 'brick'
        }

        // Batı Samanlık
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 93,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 80, this.y - 0, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        // Doğu Samanlık
        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 93,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 80, this.y - 0, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        // Kuzey Samanlık
        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 153,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 0, this.y + 48, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        // Güney Samanlık
        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 153,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 0, this.y - 48, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })
    }
}