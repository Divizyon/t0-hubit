import * as THREE from 'three'
import CANNON from 'cannon'

let positionX = 0
let positionY = 0
let positionZ = 0.03

// DegToRad fonksiyonu eklendi
const degToRad = (degrees) => {
    return degrees * (Math.PI / 180)
}

export default class Road  {
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

        const baseScene = this.resources.items.Road?.scene;
        if (!baseScene) {
            console.error('Road model not found in resources');
            return;
        }
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
            0,
            0,
            0
        ))
        body.addShape(mainShape)

        // Collision Eklemek İçin
        this.physics.world.addBody(body)

            const xRotation = -90;  // X ekseni eğimi (öne/arkaya eğim) - 90 derece dik yapacak
            const yRotation = 180; // Y ekseni dönüşü (sağa/sola dönüş) - 180 derece döndür
            const zRotation = 180;  // Z ekseni dönüşü (yatay düzlemde dönüş)

        // Modeli Ekliyoruz
        this.model = {}
        this.model.base = this.objects.add({
            base: { children: baseChildren },
            collision: { children: baseChildren },
            offset: new THREE.Vector3(positionX, positionY, positionZ),
            rotation: new THREE.Euler(
                degToRad(xRotation), 
                degToRad(yRotation), 
                degToRad(zRotation)),
            mass: 0
        })

        // this.model.base.collision = { body }

        this.container.add(this.model.base.container)

    }
}