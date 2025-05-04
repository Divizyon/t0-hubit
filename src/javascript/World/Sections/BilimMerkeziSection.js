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
            
            // Eğim değerleri (derece cinsinden)
            const xRotation = 0;  // X ekseni eğimi - düz yap (eğim yok)
            const yRotation = 0;  // Y ekseni dönüşü - düz baksın
            const zRotation = 0;  // Z ekseni dönüşü - düz yap (yatay düzlemde dönüş yok)
            
            // BilimMerkezi modelini yükle
            this.objects.add({
                base: this.resources.items.bilimMerkeziBase.scene,
                collision: this.resources.items.bilimMerkeziBase.scene, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x, this.y, 2.5), // Z değeri 2.5 yaparak modeli zeminden yukarı çıkart
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ), // Derece cinsinden belirtilen eğimler
                scale: new THREE.Vector3(3, 3, 3), // Modelin ölçeğini 3 birim olarak ayarla
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetX: 0, offsetY: 0 } // Gölge boyutunu ayarla
            });
            console.log('BilimMerkezi modeli başarıyla yüklendi');
        } catch (error) {
            console.error('BilimMerkezi modelini yüklerken hata oluştu:', error);
        }
    }
} 