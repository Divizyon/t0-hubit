import * as THREE from 'three'

export default class BilimMerkeziSection {
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
        if (!this.resources.items.bilimMerkeziBase) {
            console.warn('BilimMerkezi modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Dereceyi radyana çeviren yardımcı fonksiyon
            const degToRad = (degrees) => {
                return degrees * (Math.PI / 180);
            };
            
            // Rotasyon değerleri (derece cinsinden)
            const xRotation = 0;    // X ekseni eğimi - 0 derece düz duracak şekilde
            const yRotation = 0;    // Y ekseni dönüşü
            const zRotation = 0;    // Z ekseni dönüşü - düz duracak şekilde
            
            // Model klonlanır
            const bilimMerkeziModel = this.resources.items.bilimMerkeziBase.scene.clone();
            
            // Merkez noktası ayarla - model merkezini düzelt (yatay olarak ortala, dikey olarak alt kısmı referans al)
            const box = new THREE.Box3().setFromObject(bilimMerkeziModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // X ve Y ekseni merkezleme (yatay düzlemde)
            bilimMerkeziModel.position.x -= center.x;
            bilimMerkeziModel.position.y -= center.y;
            
            // Z ekseni için alt kısmı baz al ve biraz daha aşağı indir
            bilimMerkeziModel.position.z -= (box.min.z + 0.2); // Biraz daha aşağı indir
            
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
            
            // Modelin materyallerini düzeltme
            let meshIndex = 0;
            bilimMerkeziModel.traverse((child) => {
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
                    
                    console.log(`BilimMerkezi Mesh düzeltildi: ${child.name}`);
                }
            });
            
            // BilimMerkezi modelini yükle
            this.objects.add({
                base: bilimMerkeziModel,
                collision: bilimMerkeziModel, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x, this.y, -0.5), // Z pozisyonu negatif değere ayarla - yerin altına göm
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ),
                scale: new THREE.Vector3(0.05, 0.05, 0.05), // Ölçeği küçülterek tam görünmesini sağla
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetZ: 0, offsetX: 0, offsetY: 0 } // Gölgenin de tam yerde olması için
            });
            console.log('BilimMerkezi modeli başarıyla yüklendi ve yere tamamen sıfırlandı');
        } catch (error) {
            console.error('BilimMerkezi modelini yüklerken hata oluştu:', error);
        }
    }
} 