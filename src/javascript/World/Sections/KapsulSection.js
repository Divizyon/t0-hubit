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
                this.model.base = this.resources.items.kapsulBase.scene.clone()
                // Modeli ölçeklendir
                this.model.base.scale.set(1.5, 1.5, 1.5)
                this.model.base.position.x = this.x
                this.model.base.position.y = this.y
                this.model.base.position.z = 0
                this.model.base.rotation.x = 0
                this.model.base.rotation.y = 0
                this.model.base.rotation.z = 0
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