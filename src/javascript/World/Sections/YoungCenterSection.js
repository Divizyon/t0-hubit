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
            // YoungCenter modelini yükle
            this.objects.add({
                base: this.resources.items.youngCenterBase.scene,
                collision: this.resources.items.youngCenterBase.scene, // Collision için aynı modeli kullanıyoruz
                offset: new THREE.Vector3(this.x +85, this.y - 10, 0), // Konum ayarı
                rotation: new THREE.Euler(0, 0, 0), // Modeli sağa doğru 30 derece döndür (Math.PI/6 = 30 derece)
                scale: new THREE.Vector3(0.04, 0.04, 0.04), // Modeli biraz daha küçült
                mass: 0, // 0 = statik (hareket etmez)
                shadow: { sizeX: 5, sizeY: 5, offsetX: 0, offsetY: 0 } // Gölgeyi büyüt
            });
            console.log('YoungCenter modeli başarıyla yüklendi');
        } catch (error) {
            console.error('YoungCenter modelini yüklerken hata oluştu:', error);
        }
    }
} 