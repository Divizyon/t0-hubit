import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.name = _options.name
        this.x = _options.x
        this.y = _options.y
        this.imageSource = _options.imageSource
        this.link = _options.link

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        // this.container.updateMatrix()

        this.setBoard()
        this.createButton()
    }

    setBoard()
    {
        // Set up
        this.board = {}
        this.board.color = '#8e7161'
        this.board.threeColor = new THREE.Color(this.board.color)

        if(this.debug)
        {
            this.debug.addColor(this.board, 'color').name('boardColor').onChange(() =>
            {
                this.board.threeColor.set(this.board.color)
            })
        }

        // Set up board position
        this.board.x = this.x
        this.board.y = this.y

        // Create structure with collision
        this.objects.add({
            base: this.resources.items.projectsBoardStructure.scene,
            collision: this.resources.items.projectsBoardCollision.scene,
            floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
            offset: new THREE.Vector3(this.board.x, this.board.y, 0),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            mass: 0
        })

        // Image load
        const image = new Image()
        image.addEventListener('load', () =>
        {
            this.board.texture = new THREE.Texture(image)
            this.board.texture.anisotropy = 4
            this.board.texture.needsUpdate = true

            this.board.planeMesh.material.uniforms.uTexture.value = this.board.texture

            gsap.to(this.board.planeMesh.material.uniforms.uTextureAlpha, { value: 1, duration: 1, ease: 'power4.inOut' })
        })

        image.src = this.imageSource

        // Plane
        this.board.planeMesh = this.meshes.boardPlane.clone()
        this.board.planeMesh.position.x = this.board.x
        this.board.planeMesh.position.y = this.board.y
        this.board.planeMesh.matrixAutoUpdate = false
        this.board.planeMesh.updateMatrix()
        this.board.planeMesh.material = new ProjectBoardMaterial()
        this.board.planeMesh.material.uniforms.uColor.value = this.board.threeColor
        this.board.planeMesh.material.uniforms.uTextureAlpha.value = 0
        this.container.add(this.board.planeMesh)

    }

    createButton() {
        // Etkileşimli buton oluştur
        this.button = {}
        
        // Buton konumu - ses odası için uygun konum
        this.button.position = new THREE.Vector3(
            this.x , // Modelin önünde
            this.y - 4, // Modelin önünde
            2 // Zemin üzerinde, görünür olacak şekilde
        )
        
        
        // Buton konteyneri
        this.button.container = new THREE.Object3D()
        this.button.container.position.copy(this.button.position)
        this.container.add(this.button.container)
        
        // Label
        this.button.label = {}
        this.button.label.size = 4 // Genişliği 2'den 4'e artırdık
        this.button.label.geometry = new THREE.PlaneGeometry(this.button.label.size, this.button.label.size / 2.5, 1, 1)
        
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
}
