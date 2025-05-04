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

        // Add tıklanabilir alan doğrudan billboard'a
        // Area
        this.board.area = this.areas.add({
            position: new THREE.Vector2(this.x + this.link.x, this.y + this.link.y),
            halfExtents: new THREE.Vector2(this.link.halfExtents.x, this.link.halfExtents.y)
        })
        
        // Hover efekti
        this.board.area.on('in', () => {
            // Bilboard'a gelince parlaklık/renk değişimi efekti
            if (this.board.planeMesh && this.board.planeMesh.material) {
                gsap.to(this.board.planeMesh.material.uniforms.uTextureAlpha, { 
                    value: 1.8, // Parlaklığı daha da artırdık (1.5'ten 1.8'e)
                    duration: 0.3 // Daha hızlı (0.5'ten 0.3'e)
                });
                
                // Enter alanını daha görünür yap
                gsap.to(this.board.areaLabel.material, {
                    opacity: 1,
                    duration: 0.3
                });
                
                // Butonun boyutunu büyüt
                gsap.to(this.board.areaLabel.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.3
                });
            }
        });
        
        this.board.area.on('out', () => {
            // Bilboard'dan çıkınca normale dön
            if (this.board.planeMesh && this.board.planeMesh.material) {
                gsap.to(this.board.planeMesh.material.uniforms.uTextureAlpha, { 
                    value: 1, 
                    duration: 0.3
                });
                
                // Enter alanını hafif saydam yap
                gsap.to(this.board.areaLabel.material, {
                    opacity: 0.7,
                    duration: 0.3
                });
                
                // Butonun boyutunu normale döndür
                gsap.to(this.board.areaLabel.scale, {
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    duration: 0.3
                });
            }
        });
        
        this.board.area.on('interact', () =>
        {
            window.open(this.link.href, '_blank')
        })

        // Area label - daha öne ve görünür olacak şekilde pozisyonu ayarlandı
        this.board.areaLabel = this.meshes.areaLabel.clone()
        this.board.areaLabel.position.x = this.link.x
        this.board.areaLabel.position.y = this.link.y - 3.5 // Bilboardun altında
        this.board.areaLabel.position.z = 2.5 // Çok daha öne getirdik (1.5'ten 2.5'e)
        this.board.areaLabel.scale.set(1.2, 1.2, 1.2)
        this.board.areaLabel.matrixAutoUpdate = false
        this.board.areaLabel.updateMatrix()
        this.container.add(this.board.areaLabel)
        
        // Butonun dikkat çekmesi için hafif animasyonlu efekt
        this.time.on('tick', () => {
            // Buton üzerinde sallanma efekti
            const time = this.time.elapsed * 0.001
            const scale = 1.2 + Math.sin(time * 2) * 0.1 // Sallanma hızını azalttık, genliğini artırdık
            
            this.board.areaLabel.scale.set(scale, scale, scale)
            this.board.areaLabel.updateMatrix()
        })
    }
}
