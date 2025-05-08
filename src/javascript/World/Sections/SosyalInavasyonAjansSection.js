import * as THREE from 'three'

export default class SosyalInavasyonAjansSection {
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
        if (!this.resources.items.sosyalInavasyonAjansBase) {
            console.warn('SosyalInavasyonAjans modelini yüklerken sorun oluştu - Kaynak bulunamadı');
            return;
        }

        try {
            // Dereceyi radyana çeviren yardımcı fonksiyon
            const degToRad = (degrees) => {
                return degrees * (Math.PI / 180);
            };
            
            // Eğim değerleri (derece cinsinden)
            const xRotation = -90;  // X ekseni eğimi (öne/arkaya eğim) - 90 derece dik yapacak
            const yRotation = -25; // Y ekseni dönüşü (sağa/sola dönüş) - 180 derece döndür
            const zRotation = 180;  // Z ekseni dönüşü (yatay düzlemde dönüş)
            
            // SosyalInavasyonAjans modelini yükle
            this.objects.add({
                base: this.resources.items.sosyalInavasyonAjansBase.scene,
                collision: this.resources.items.sosyalInavasyonAjansBase.scene, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x, this.y, 0), // Negatif değer vererek modeli aşağı indiriyorum
                rotation: new THREE.Euler(
                    degToRad(xRotation), 
                    degToRad(yRotation), 
                    degToRad(zRotation)
                ), // Derece cinsinden belirtilen eğimler
                scale: new THREE.Vector3(5, 5, 5), // Modelin ölçeğini 5 birim olarak ayarla
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 10, sizeY: 10, offsetX: 0, offsetY: 0 } // Gölge boyutunu artır
            });
            console.log('SosyalInavasyonAjans modeli başarıyla yüklendi');
        } catch (error) {
            console.error('SosyalInavasyonAjans modelini yüklerken hata oluştu:', error);
        }
    }
} 