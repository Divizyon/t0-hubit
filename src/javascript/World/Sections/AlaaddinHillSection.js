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
            const xRotation = 0;  // X ekseni eğimi (öne/arkaya eğim) - düz konumda olmalı
            const yRotation = 0;    // Y ekseni dönüşü (sağa/sola dönüş)
            const zRotation = 0;    // Z ekseni dönüşü (yatay düzlemde dönüş)
            
            // Model klonlanır
            const alaaddinHillModel = this.resources.items.alaaddinHillBase.scene.clone();
            
            // Özel materyaller oluştur
            const greenMaterial = new THREE.MeshStandardMaterial({
                color: 0x43A047,       // Yeşil
                roughness: 0.8,
                metalness: 0.2
            });
            
            const brownMaterial = new THREE.MeshStandardMaterial({
                color: 0x8D6E63,       // Kahverengi
                roughness: 0.9,
                metalness: 0.1
            });
            
            const grayMaterial = new THREE.MeshStandardMaterial({
                color: 0x9E9E9E,       // Gri
                roughness: 0.7,
                metalness: 0.3
            });
            
            const blueMaterial = new THREE.MeshStandardMaterial({
                color: 0x5B8CF5,       // Mavi - Hubit mavisi
                roughness: 0.5,
                metalness: 0.3
            });
            
            const whiteMaterial = new THREE.MeshStandardMaterial({
                color: 0xF5F5F5,       // Beyaz
                roughness: 0.5,
                metalness: 0.2
            });
            
            // Material map oluştur - mesh aynı materyali paylaşsın
            const materialMap = new Map();
            
            // Modelin materyallerini düzeltme
            let meshIndex = 0;
            alaaddinHillModel.traverse((child) => {
                if (child.isMesh) {
                    // Mesh görünürlüğünü ayarla
                    child.visible = true;
                    child.frustumCulled = false;
                    
                    // Z-fighting sorununu çözmek için polygonOffset kullan
                    // Her mesh farklı bir offsetFactor alıyor
                    const offsetFactor = 0.1 + (meshIndex * 0.01);
                    meshIndex++;
                    
                    // Materyal tipleri
                    // Her mesh için alternatif malzemeler atayabiliriz
                    let selectedMaterial;
                    
                    // Mesh adına göre değil, mesh içeriğine göre karar ver
                    // Bu örnekte basitçe meshIndex'e göre farklı renkler atıyoruz
                    const materialType = meshIndex % 5;
                    
                    switch(materialType) {
                        case 0:
                            selectedMaterial = whiteMaterial;
                            break;
                        case 1:
                            selectedMaterial = greenMaterial;
                            break;  
                        case 2:
                            selectedMaterial = brownMaterial;
                            break;
                        case 3:
                            selectedMaterial = grayMaterial;
                            break;
                        case 4:
                            selectedMaterial = blueMaterial;
                            break;
                        default:
                            selectedMaterial = whiteMaterial;
                    }
                    
                    // Materyal atama
                    child.material = selectedMaterial.clone();
                    
                    // Z-fighting için ayarlar
                    child.material.polygonOffset = true;
                    child.material.polygonOffsetFactor = offsetFactor;
                    child.material.polygonOffsetUnits = 1.0;
                    
                    // Genel materyal ayarları
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                    
                    // Gölge ayarları
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Normal ve UV haritaları da güncelle
                    if (child.geometry) {
                        child.geometry.computeVertexNormals();
                    }
                    
                    console.log(`Mesh düzeltildi: ${child.name}, Material type: ${materialType}`);
                }
            });
            
            // AlaaddinHill modelini yükle
            this.objects.add({
                base: alaaddinHillModel,
                collision: alaaddinHillModel, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x, this.y, 0.01), // Z pozisyonunu 0.01 yaparak yere yakın ama hafif üstte tutuyoruz (z-fighting önlemek için)
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ),
                scale: new THREE.Vector3(2, 2, 2), // Biraz büyütelim
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetZ: 0.1, offsetX: 0, offsetY: 0 } // Gölge boyutunu artır ve gölgeyi modelin üzerine çıkar
            });
            console.log('AlaaddinHill modeli başarıyla yüklendi');
        } catch (error) {
            console.error('AlaaddinHill modelini yüklerken hata oluştu:', error);
        }
    }
} 