import * as THREE from 'three'
import CANNON from 'cannon'

let positionX = 25
let positionY = 5
let positionZ = 1

export default class SectionGreenScreen  {
    constructor(_options) {
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.physics = _options.physics
        this.debug = _options.debug

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setModel()
    }

    setModel() {

        const baseScene = this.resources.items.GreenScreen?.scene;
        let baseChildren = [];
        if (baseScene.children && baseScene.children.length > 0) {
            baseChildren = baseScene.children;
        } else {
            baseChildren = [baseScene];
        }
        // Calculate precise model bounds
        const bbox = new THREE.Box3().setFromObject(baseScene)
        const size = bbox.getSize(new THREE.Vector3())
        
        // Scale factor to match model size
        const scaleFactor = 1;

        // Create CANNON body (tek collision)
        const body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(positionX, positionY, positionZ),
            material: this.physics.materials.items.floor
        })

        // Tek bir box collision (modelin tamamı için)
        const mainShape = new CANNON.Box(new CANNON.Vec3(
            Math.abs(size.x) * scaleFactor / 2,
            Math.abs(size.y) * scaleFactor / 2,
            Math.abs(size.z) * scaleFactor / 2
        ))
        body.addShape(mainShape)

        // Collision Eklemek İçin
        this.physics.world.addBody(body)

        // Modeli Ekliyoruz
        this.model = {}
        this.model.base = this.objects.add({
            base: { children: baseChildren },
            collision: { children: baseChildren },
            offset: new THREE.Vector3(positionX, positionY, positionZ),
            mass: 0
        })

        this.model.base.collision = { body }

        this.container.add(this.model.base.container)

    }
}