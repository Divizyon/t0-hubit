import * as THREE from 'three'

export default class AlaaddinHillSection {
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
        if (!this.resources.items.alaaddinHillBase) {
            console.warn('AlaaddinHill modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Dereceyi radyana çeviren yardımcı fonksiyon
            const degToRad = (degrees) => {
                return degrees * (Math.PI / 180);
            };
            
            // Eğim değerleri (derece cinsinden)
            const xRotation = 180;  // X ekseni eğimi (öne/arkaya eğim)
            const yRotation = 0;    // Y ekseni dönüşü (sağa/sola dönüş)
            const zRotation = 0;    // Z ekseni dönüşü (yatay düzlemde dönüş)
            
            // Model klonlanır
            const alaaddinHillModel = this.resources.items.alaaddinHillBase.scene.clone();
            
            // Modelin materyallerini düzeltme
            alaaddinHillModel.traverse((child) => {
                if (child.isMesh) {
                    // Mesh görünürlüğünü ayarla
                    child.visible = true;
                    child.frustumCulled = false;
                    
                    // Materyal ayarlarını düzelt
                    if (child.material) {
                        // Klonlanmış materyal kullan
                        if (Array.isArray(child.material)) {
                            child.material = child.material.map(mat => {
                                const newMat = mat.clone();
                                newMat.transparent = false;
                                newMat.opacity = 1.0;
                                newMat.side = THREE.DoubleSide;
                                newMat.needsUpdate = true;
                                return newMat;
                            });
                        } else {
                            const newMat = child.material.clone();
                            newMat.transparent = false;
                            newMat.opacity = 1.0;
                            newMat.side = THREE.DoubleSide;
                            newMat.needsUpdate = true;
                            child.material = newMat;
                        }
                    }
                    
                    // Normal ve UV haritaları da güncelle
                    if (child.geometry) {
                        child.geometry.computeVertexNormals();
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    
                    console.log('Mesh düzeltildi:', child.name);
                }
            });
            
            // AlaaddinHill modelini yükle
            this.objects.add({
                base: alaaddinHillModel,
                collision: alaaddinHillModel, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x, this.y, -3), // Z pozisyonunu negatif yaparak yere yaklaştırıyoruz
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ),
                scale: new THREE.Vector3(2, 2, 2), // Biraz büyütelim
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetX: 0, offsetY: 0 } // Gölge boyutunu artır
            });
            console.log('AlaaddinHill modeli başarıyla yüklendi');
        } catch (error) {
            console.error('AlaaddinHill modelini yüklerken hata oluştu:', error);
        }
    }
} 