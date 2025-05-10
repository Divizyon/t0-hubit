import * as THREE from 'three'
import gsap from 'gsap'

export default class SoundRoomSection {
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
       // this.createButton()
        
        // Debug kontrolü ekle
        if(this.debug) {
            const folder = this.debug.addFolder('mycustomModel')
            folder.add(this.model.base.position, 'x').step(0.1).min(-20).max(20).name('positionX')
            folder.add(this.model.base.position, 'y').step(0.1).min(-20).max(20).name('positionY')
            folder.add(this.model.base.position, 'z').step(0.1).min(-10).max(10).name('positionZ')
            folder.add(this.model.base.rotation, 'x').step(0.1).min(-Math.PI).max(Math.PI).name('rotationX')
            folder.add(this.model.base.rotation, 'y').step(0.1).min(-Math.PI).max(Math.PI).name('rotationY')
            folder.add(this.model.base.rotation, 'z').step(0.1).min(-Math.PI).max(Math.PI).name('rotationZ')
            folder.add(this.model.base.scale, 'x').step(0.1).min(0.1).max(10).name('scaleX').onChange((value) => {
                this.model.base.scale.y = value
                this.model.base.scale.z = value
            })
        }
        
    }
    
    setModel() {
        // Model
        this.model = {}
        
        try {
            // Modeli yüklemeyi dene
            console.log("soundRoom.glb model dosyası kontrol ediliyor:", this.resources.items.myCustomModelBase);
            
            if (this.resources.items.myCustomModelBase && this.resources.items.myCustomModelBase.scene) {
                // Base model - GLB dosyasını yükleme
                this.model.base = this.resources.items.myCustomModelBase.scene.clone()
                
                // Modeli ölçeklendir - soundRoom için uygun ölçekler
                this.model.base.scale.set(1.5, 1.5, 1.5) // Biraz daha büyük
                this.model.base.position.x = this.x
                this.model.base.position.y = this.y
                this.model.base.position.z = 0 // Tam zeminde
                
                // Zeminde düzgün durması için rotasyon ayarları
                this.model.base.rotation.x = 0 // Dik duracak şekilde
                this.model.base.rotation.y = 0
                this.model.base.rotation.z = 0
                
                // Materyalleri atama
                this.model.base.traverse((child) => {
                    if(child instanceof THREE.Mesh) {
                        console.log("Mesh adı:", child.name)
                        
                        // soundRoom modeli için materyal ayarları
                        if(child.name.includes('shadePurple')) {
                            // Mor kısımlar için özel materyal
                            child.material = this.materials.shades.items.purple;
                        }
                        else if(child.name.includes('shadeBrown')) {
                            // Kahverengi kısımlar
                            child.material = this.materials.shades.items.beige;
                        }
                        else if(child.name.includes('shadeOrange')) {
                            // Turuncu kısımlar
                            child.material = this.materials.shades.items.orange;
                        }
                        else if(child.name.includes('shadeBlack')) {
                            // Siyah kısımlar
                            child.material = this.materials.shades.items.black;
                        }
                        else if(child.name.includes('shadeGreen')) {
                            // Yeşil kısımlar
                            child.material = this.materials.shades.items.emeraldGreen;
                        }
                        else {
                            // Varsayılan materyal - Beyaz
                            child.material = this.materials.shades.items.white;
                        }
                    }
                })
                
                // Modeli ekle
                this.container.add(this.model.base)
                console.log("SoundRoom modeli başarıyla yüklendi!");
            } else {
                console.error("soundRoom.glb modeli yüklenemedi, yedek model oluşturuluyor.")
                this.createTableAndChairs()
            }
        } catch (error) {
            console.error("Model yükleme hatası:", error)
            this.createTableAndChairs()
        }
    }
    
    createTableAndChairs() {
        // Manuel olarak bir masa ve sandalyeler oluştur
        console.log("Masa ve sandalyeler manuel olarak oluşturuluyor...")
        
        // Ana container
        this.model.base = new THREE.Group()
        this.model.base.position.set(this.x, this.y, 0)
        
        // Materyal - Daha görünür renkler
        const tableMaterial = this.materials.shades.items.beige || new THREE.MeshBasicMaterial({ color: 0xA0522D })
        const chairMaterial = this.materials.shades.items.white || new THREE.MeshBasicMaterial({ color: 0xF5F5DC })
        
        // Masa oluştur - daha büyük boyutlar
        const tableTop = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2.5, 0.2),
            tableMaterial
        )
        tableTop.position.set(0, 0, 1)
        
        // Masa ayakları
        const tableLeg1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1),
            tableMaterial
        )
        tableLeg1.position.set(-1.8, -1.1, 0.5)
        
        const tableLeg2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1),
            tableMaterial
        )
        tableLeg2.position.set(1.8, -1.1, 0.5)
        
        const tableLeg3 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1),
            tableMaterial
        )
        tableLeg3.position.set(-1.8, 1.1, 0.5)
        
        const tableLeg4 = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1),
            tableMaterial
        )
        tableLeg4.position.set(1.8, 1.1, 0.5)
        
        // Sandalye oluştur (4 tane)
        function createChair(x, y) {
            const chair = new THREE.Group()
            
            // Sandalye oturma kısmı
            const chairSeat = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.8, 0.15),
                chairMaterial
            )
            chairSeat.position.set(0, 0, 0.5)
            chair.add(chairSeat)
            
            // Sandalye arkalığı
            const chairBack = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.15, 0.6),
                chairMaterial
            )
            chairBack.position.set(0, 0.4, 0.8)
            chair.add(chairBack)
            
            // Sandalye ayakları
            for (let i = -0.3; i <= 0.3; i += 0.6) {
                for (let j = -0.3; j <= 0.3; j += 0.6) {
                    const leg = new THREE.Mesh(
                        new THREE.BoxGeometry(0.1, 0.1, 0.5),
                        chairMaterial
                    )
                    leg.position.set(i, j, 0.25)
                    chair.add(leg)
                }
            }
            
            chair.position.set(x, y, 0)
            return chair
        }
        
        // 4 sandalye oluştur - daha dışa yerleştir
        const chair1 = createChair(0, -2.5)  // Masanın altında
        const chair2 = createChair(0, 2.5)   // Masanın üstünde
        const chair3 = createChair(-2.5, 0)  // Masanın solunda
        const chair4 = createChair(2.5, 0)   // Masanın sağında
        
        // Tüm parçaları ekle
        this.model.base.add(tableTop, tableLeg1, tableLeg2, tableLeg3, tableLeg4)
        this.model.base.add(chair1, chair2, chair3, chair4)
        
        // Modeli döndür
        this.model.base.rotation.y = Math.PI / 4
        
        // Konteyner'a ekle
        this.container.add(this.model.base)

        
    }

    createButton() {
        // Etkileşimli buton oluştur
        this.button = {}
        
        // Buton konumu - ses odası için uygun konum
        this.button.position = new THREE.Vector3(
            this.x - 2.5, // Modelin önünde
            this.y - 2, // Modelin önünde
            0.25 // Zemin üzerinde, görünür olacak şekilde
        )
        
        // Buton konteyneri
        this.button.container = new THREE.Object3D()
        this.button.container.position.copy(this.button.position)
        this.container.add(this.button.container)
        
        // Label
        this.button.label = {}
        this.button.label.size = 2
        this.button.label.geometry = new THREE.PlaneGeometry(this.button.label.size, this.button.label.size / 2.5, 1, 1)
        
        // Canvas ile texture oluştur
        this.button.label.canvas = document.createElement('canvas')
        this.button.label.canvas.width = 512
        this.button.label.canvas.height = 200
        this.button.label.context = this.button.label.canvas.getContext('2d')
        
        // Arkaplan
        this.button.label.context.fillStyle = '#673AB7'
        this.drawRoundRectFill(
            this.button.label.context, 
            0, 
            0, 
            this.button.label.canvas.width, 
            this.button.label.canvas.height, 
            20,
            '#673AB7'
        )
        
        // Text
        this.button.label.context.fillStyle = '#ffffff'
        this.button.label.context.font = '48px Arial'
        this.button.label.context.textAlign = 'center'
        this.button.label.context.textBaseline = 'middle'
        this.button.label.context.fillText(
            'Ses Odası İncele', 
            this.button.label.canvas.width / 2, 
            this.button.label.canvas.height / 2
        )
        
        // Texture oluştur
        this.button.label.texture = new THREE.Texture(this.button.label.canvas)
        this.button.label.texture.magFilter = THREE.LinearFilter
        this.button.label.texture.minFilter = THREE.LinearFilter
        this.button.label.texture.needsUpdate = true
        
        // Materyal oluştur
        this.button.label.material = new THREE.MeshBasicMaterial({ 
            map: this.button.label.texture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false
        })
        
        // Mesh oluştur - Zemine dik konumlandır
        this.button.label.mesh = new THREE.Mesh(this.button.label.geometry, this.button.label.material)
        this.button.label.mesh.position.z = 0.15
        this.button.label.mesh.matrixAutoUpdate = false
        this.button.label.mesh.updateMatrix()
        
        // Konteynere ekle
        this.button.container.add(this.button.label.mesh)
        
        // Enter ikonu ekle eğer varsa
        if (this.resources.items.areaKeyEnterTexture) {
            this.button.enter = {}
            this.button.enter.size = 0.8
            this.button.enter.geometry = new THREE.PlaneGeometry(this.button.enter.size, this.button.enter.size, 1, 1)
            
            this.button.enter.texture = this.resources.items.areaKeyEnterTexture
            this.button.enter.texture.magFilter = THREE.LinearFilter
            this.button.enter.texture.minFilter = THREE.LinearFilter
            
            this.button.enter.material = new THREE.MeshBasicMaterial({
                map: this.button.enter.texture,
                transparent: true,
                opacity: 0.9,
                depthWrite: false
            })
            
            this.button.enter.mesh = new THREE.Mesh(this.button.enter.geometry, this.button.enter.material)
            this.button.enter.mesh.position.x = this.button.label.size * 0.35
            this.button.enter.mesh.position.z = 0.16
            this.button.enter.mesh.matrixAutoUpdate = false
            this.button.enter.mesh.updateMatrix()
            
            this.button.container.add(this.button.enter.mesh)
        }
        
        // Alan tetikleyici oluştur
        this.button.triggerArea = this.areas.add({
            position: new THREE.Vector2(this.button.position.x, this.button.position.y),
            halfExtents: new THREE.Vector2(1.4, 0.8),
            hasKey: true,
            testCar: true,
            active: true
        })
        
        // Butona tıklandığında
        this.button.triggerArea.on('interact', () => {
            console.log('Model inceleniyor!')
            this.animateModel()
        })
    }
    
    drawRoundRectFill(ctx, x, y, width, height, radius, fillColor) {
        if (typeof radius === 'undefined') {
            radius = 5
        }
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius}
        } else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0}
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side]
            }
        }
        
        ctx.fillStyle = fillColor
        ctx.beginPath()
        ctx.moveTo(x + radius.tl, y)
        ctx.lineTo(x + width - radius.tr, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
        ctx.lineTo(x + width, y + height - radius.br)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
        ctx.lineTo(x + radius.bl, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
        ctx.lineTo(x, y + radius.tl)
        ctx.quadraticCurveTo(x, y, x + radius.tl, y)
        ctx.closePath()
        ctx.fill()
    }
    

    animateModel() {
        // Sadece yukarı kaldır ve indir - dönme animasyonu yok
        const currentPositionZ = this.model.base.position.z
        gsap.to(this.model.base.position, {
            z: currentPositionZ + 0.8, // Hafif yükseltme
            duration: 1.5,
            ease: 'power1.out',
            onComplete: () => {
                gsap.to(this.model.base.position, {
                    z: currentPositionZ,
                    duration: 1.5,
                    ease: 'bounce.out'
                })
            }
        })
        
        // Model içindeki öğeleri animelemek için
        this.model.base.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name.includes('shadePurple')) {
                    // Mor parçalara renk animasyonu ekle
                    const originalColor = child.material.color.clone()
                    gsap.to(child.material.color, {
                        r: 0.8,
                        g: 0.2,
                        b: 0.8,
                        duration: 1,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            gsap.to(child.material.color, {
                                r: originalColor.r,
                                g: originalColor.g,
                                b: originalColor.b,
                                duration: 1,
                                ease: 'power2.inOut'
                            })
                        }
                    })
                }
            }
        })
    }
} 