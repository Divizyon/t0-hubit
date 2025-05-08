import * as THREE from 'three'

export default class KonyaGencKartSection {
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
        if (!this.resources.items.konyaGencKartBase) {
            console.warn('KonyaGencKart modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Dereceyi radyana çeviren yardımcı fonksiyon
            const degToRad = (degrees) => {
                return degrees * (Math.PI / 180);
            };
            
            // Eğim değerleri (derece cinsinden)
            const xRotation = 0;  // X ekseni eğimi - düz yap (eğim yok)
            const yRotation = 180; // Y ekseni dönüşü - 180 derece döndürerek tam tersi yöne çevir
            const zRotation = 0;  // Z ekseni dönüşü - düz yap (yatay düzlemde dönüş yok)
            
            // KonyaGencKart modelini yükle
            this.objects.add({
                base: this.resources.items.konyaGencKartBase.scene,
                collision: this.resources.items.konyaGencKartBase.scene, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(10, -35, 1.25), // Z değeri 2.5 yaparak modeli zeminden yukarı çıkart
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ), // Derece cinsinden belirtilen eğimler
                scale: new THREE.Vector3(5, 5, 5), // Modelin ölçeğini 5 birim olarak ayarla
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetX: 0, offsetY: 0 } // Gölge boyutunu artır
            });
            console.log('KonyaGencKart modeli başarıyla yüklendi');
        } catch (error) {
            console.error('KonyaGencKart modelini yüklerken hata oluştu:', error);
        }
    }
} 