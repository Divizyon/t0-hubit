import * as THREE from 'three'

export default class Ground {
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

        // this.setStatic()
        this.setDikes()
        this.setFloor()

        // DivizyonBuilding
     
        this.objects.add({
            base: this.resources.items.divizyonBuilding.scene,
            collision: this.resources.items.divizyonBuilding.scene, // Eğer collision için ayrı bir model yoksa aynısı kullanılabilir
            offset: new THREE.Vector3(-22, 0, 0), // Konumu sol tarafa yerleştir
            rotation: new THREE.Euler(0, 0, 0), // Düz durması için
            mass: 0,
            shadow: { sizeX: 2, sizeY: 2, offsetX: 0, offsetY: 0 }
        });
    }

    setFloor() {
        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(128, 128),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.5,
                depthWrite: false
            })
        )
        this.floor.frustumCulled = false
        this.floor.matrixAutoUpdate = false
        this.floor.updateMatrix()
        this.container.add(this.floor)
    }

    setDikes() {
        this.dikes = {}
        this.dikes.brickOptions = {
            base: this.resources.items.brickBase.scene,
            collision: this.resources.items.brickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0,
            soundName: 'brick'
        }

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 128,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 64, this.y - 0, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object: this.dikes.brickOptions,
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 128,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 64, this.y - 0, 0),
                offsetWidth: new THREE.Vector3(0, 1.05, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 128,
                heightCount: 2,
                position: new THREE.Vector3(this.x - 0, this.y + 64, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })

        this.walls.add({
            object:
            {
                ...this.dikes.brickOptions,
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5)
            },
            shape:
            {
                type: 'brick',
                equilibrateLastLine: true,
                widthCount: 128,
                heightCount: 2,
                position: new THREE.Vector3(this.x + 0, this.y - 64, 0),
                offsetWidth: new THREE.Vector3(1.05, 0, 0),
                offsetHeight: new THREE.Vector3(0, 0, 0.45),
                randomOffset: new THREE.Vector3(0, 0, 0),
                randomRotation: new THREE.Vector3(0, 0, 0.2)
            }
        })
    }
}