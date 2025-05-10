import * as THREE from 'three'

export default class YoungCenterSection {
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

        this.setModel()
    }

    setModel() {
        // Kaynakları kontrol et
        if (!this.resources.items.youngCenterBase) {
            console.warn('YoungCenter modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Model klonlanır
            const youngCenterModel = this.resources.items.youngCenterBase.scene.clone();
            
            // Özel materyaller oluştur
            const whiteMaterial = new THREE.MeshStandardMaterial({
                color: 0xF5F5F5,       // Beyaz
                roughness: 0.3,
                metalness: 0.1
            });
            
            // Modelin materyallerini düzeltme
            let meshIndex = 0;
            youngCenterModel.traverse((child) => {
                if (child.isMesh) {
                    // Mesh görünürlüğünü ayarla
                    child.visible = true;
                    child.frustumCulled = false;
                    
                    // Z-fighting sorununu çözmek için polygonOffset kullan
                    const offsetFactor = 0.1 + (meshIndex * 0.01);
                    meshIndex++;
                    
                    // Varsayılan materyali belirle
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
                }
            });
            
            // YoungCenter modelini yükle - orijinal ayarlarla
            this.objects.add({
                base: youngCenterModel,
                collision: youngCenterModel, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x + 85, this.y - 10, 0), // Orijinal konum ayarı
                rotation: new THREE.Euler(0, 0, 0), 
                scale: new THREE.Vector3(0.04, 0.04, 0.04), // Orijinal ölçek
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 5, sizeY: 5, offsetX: 0, offsetY: 0 } // Orijinal gölge ayarları
            });
            console.log('CalisanGenclikMerkezi modeli başarıyla yüklendi ve orijinal konumuna yerleştirildi');
        } catch (error) {
            console.error('YoungCenter modelini yüklerken hata oluştu:', error);
        }
    }
} 