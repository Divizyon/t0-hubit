import * as THREE from 'three'
import gsap from 'gsap'

export default class KapsulSection {
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
        // Model
        this.model = {}
        try {
            if (this.resources.items.kapsulBase && this.resources.items.kapsulBase.scene) {
                // Base model - GLB dosyasını yükleme
                this.model.base = this.resources.items.kapsulBase.scene
                
                // Clone the base model for collision
                this.model.collision = this.resources.items.kapsulBase.scene.clone()
                
                // Modeli ölçeklendir
                this.model.base.scale.set(2.5, 2.5, 2.5)
                this.model.base.position.x = this.x
                this.model.base.position.y = this.y
                this.model.base.position.z = 1 // Zeminden biraz yüksekte
                this.model.base.rotation.x = 0
                this.model.base.rotation.y = 0
                this.model.base.rotation.z = 0
                
                // Same scaling for collision model
                this.model.collision.scale.set(2.5, 2.5, 2.5)
                
                // Materyalleri atama (isteğe bağlı, mesh isimlerine göre özelleştirilebilir)
                this.model.base.traverse((child) => {
                    if(child instanceof THREE.Mesh) {
                        if(child.name.includes('shadeWhite')) {
                            child.material = this.materials.shades.items.white;
                        }
                        else if(child.name.includes('shadeGray')) {
                            child.material = this.materials.shades.items.gray;
                        }
                        else if(child.name.includes('shadePurple')) {
                            child.material = this.materials.shades.items.purple;
                        }
                        else if(child.name.includes('shadeBrown')) {
                            child.material = this.materials.shades.items.beige;
                        }
                        else if(child.name.includes('shadeOrange')) {
                            child.material = this.materials.shades.items.orange;
                        }
                        else if(child.name.includes('shadeBlack')) {
                            child.material = this.materials.shades.items.black;
                        }
                        else if(child.name.includes('shadeGreen')) {
                            child.material = this.materials.shades.items.emeraldGreen;
                        }
                        else {
                            child.material = this.materials.shades.items.white;
                        }
                    }
                })
                
                // Bounding box ile modelin altını bul
                const box = new THREE.Box3().setFromObject(this.model.base)
                const size = new THREE.Vector3()
                const center = new THREE.Vector3()
                box.getSize(size)
                box.getCenter(center)
                // Alt z noktası
                const minZ = box.min.z
                // Modelin tabanı z=0'da olacak şekilde yukarı taşı
                this.model.base.position.z -= minZ
                this.container.add(this.model.base)

                this.objects.add({
                    base: this.model.base,               
                    collision: this.resources.items.brickCollision.scene,       
                    offset: new THREE.Vector3(this.x, this.y, 0), 
                    rotation: new THREE.Euler(0, 0, 0),
                    duplicated: true,                      
                    scale: new THREE.Vector3(3, 3, 3),  
                    mass: 0,
                    shadow: { sizeX: 3.5, sizeY: 3.5, offsetZ: 0, alpha: 0.35 }
                })
                
            } else {
                console.error("kapsul.glb modeli yüklenemedi, yedek model oluşturuluyor.")
                this.createFallbackModel()
            }
        } catch (error) {
            console.error("Model yükleme hatası:", error)
            this.createFallbackModel()
        }
    }

    createFallbackModel() {
        // Eğer kapsul modeli yüklenemezse basit bir kapsül şekli oluştur
        this.model.base = new THREE.Mesh(
            new THREE.CapsuleGeometry(1, 2, 4, 8),
            this.materials.shades.items.white || new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        this.model.base.position.set(this.x, this.y, 1) // fallback için z=1
        this.container.add(this.model.base)
        
        // Create a dedicated collision model for fallback too
        this.model.collision = this.model.base.clone()
        
        // Fallback model için collider ekleme - aligned with the working collision pattern
        this.objects.add({
            base: this.model.base,
            collision: this.model.collision,
            offset: new THREE.Vector3(this.x, this.y, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            mass: 0,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: 0, alpha: 0.35 }
        })
    }

    animateModel() {
        const currentPositionZ = this.model.base.position.z
        gsap.to(this.model.base.position, {
            z: currentPositionZ + 0.8,
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
    }
}