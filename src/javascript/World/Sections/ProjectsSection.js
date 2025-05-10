import * as THREE from 'three'
import Project from './Project'
import gsap from 'gsap'

export default class ProjectsSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.camera = _options.camera
        this.passes = _options.passes
        this.objects = _options.objects
        this.areas = _options.areas
        this.zones = _options.zones
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x -12 // Bu değeri değiştirin
        this.y = _options.y + 6  // Bu değeri değiştirin

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('projects')
            this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.interDistance = 12 // Kullanıcının istediği değer - bilboardlar çok yakın olacak
        this.positionRandomess = 0
        this.projectHalfWidth = 5 // 6'dan 5'e düşürdüm - bilboardların çakışma olasılığını azaltmak için

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setGeometries()
        this.setMeshes()
        this.setList()
        this.setZone()

        // Add all project from the list
        for(const _options of this.list)
        {
            this.add(_options)
        }
    }

    setGeometries()
    {
        this.geometries = {}
        this.geometries.floor = new THREE.PlaneGeometry(16, 8)
    }

    setMeshes()
    {
        this.meshes = {}

        // this.meshes.boardStructure = this.objects.getConvertedMesh(this.resources.items.projectsBoardStructure.scene.children, { floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture })
        this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]
        
        // "OPEN" yazısı içeren texture yerine basit bir yuvarlak buton oluştur
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 64
        
 
        
        // Texture oluştur
        const buttonTexture = new THREE.CanvasTexture(canvas)
        buttonTexture.magFilter = THREE.NearestFilter
        buttonTexture.minFilter = THREE.LinearFilter
        
        // Area label için yeni material
        this.meshes.areaLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1), 
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                depthWrite: false, 
                map: buttonTexture 
            })
        )
        this.meshes.areaLabel.matrixAutoUpdate = false
    }

    setList()
    {
        this.list = [
            {
                name: 'E-Ticaret Projesi',
                imageSource: './models/projects/hubit/genc-kultur.jpeg',
                link: {
                    href: 'https://genckultur.com/',
                    x: 0, // Merkez noktası
                    y: 0, // Merkez noktası
                    halfExtents: {
                        x: 5, // 4'ten 5'e büyütüldü
                        y: 5  // 2'den 5'e büyütüldü
                    }
                }
            },
            {
                name: 'Kişisel Blog',
                imageSource: './models/projects/hubit/kurumsal2.webp',
                link: {
                    href: 'https://www.medium.com',
                    x: 0,
                    y: 0,
                    halfExtents: {
                        x: 5, // 4'ten 5'e büyütüldü
                        y: 5  // 2'den 5'e büyütüldü
                    }
                }
            },
            {
                name: 'Mobil Uygulama',
                imageSource: './models/projects/hubit/kurumsal3.webp',
                link: {
                    href: 'https://www.google.com',
                    x: 0,
                    y: 0,
                    halfExtents: {
                        x: 5, // 4'ten 5'e büyütüldü
                        y: 5  // 2'den 5'e büyütüldü
                    }
                }
            }
        ]
    }

    setZone()
    {
        const totalWidth = this.list.length * (this.interDistance / 2) - 3

        const zone = this.zones.add({
            position: { x: this.x + totalWidth - this.projectHalfWidth - 2, y: this.y },
            halfExtents: { x: totalWidth, y: 10 },
            data: { cameraAngle: 'projects' }
        })

        zone.on('in', (_data) =>
        {
            this.camera.angle.set(_data.cameraAngle)
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: 0, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: 0, duration: 2 })
        })

        zone.on('out', () =>
        {
            this.camera.angle.set('default')
            gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, { x: this.passes.horizontalBlurPass.strength, duration: 2 })
            gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, { y: this.passes.verticalBlurPass.strength, duration: 2 })
        })
    }

    add(_options)
    {
        const x = this.x + this.items.length * this.interDistance
        let y = this.y
        if(this.items.length > 0)
        {
            y += (Math.random() - 0.5) * this.positionRandomess
        }

        // Create project
        const project = new Project({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            areas: this.areas,
            geometries: this.geometries,
            meshes: this.meshes,
            debug: this.debugFolder,
            x: x,
            y: y,
            ..._options
        })

        this.container.add(project.container)

        // Add tiles
        if(this.items.length >= 1)
        {
            const previousProject = this.items[this.items.length - 1]
            const start = new THREE.Vector2(previousProject.x + this.projectHalfWidth, previousProject.y)
            const end = new THREE.Vector2(project.x - this.projectHalfWidth, project.y)
            const delta = end.clone().sub(start)
            this.tiles.add({
                start: start,
                delta: delta
            })
        }

        // Save
        this.items.push(project)
    }
}
