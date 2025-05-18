import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Zones from './Zones.js'
import Objects from './Objects.js'
import Car from './Car.js'
import Areas from './Areas.js'
import Walls from './Walls.js'
import Controls from './Controls.js'
import Sounds from './Sounds.js'
import gsap from 'gsap'

import Ground from './Sections/Ground.js'
import Road from './Sections/Road.js'
// import RoadSign from './Sections/SectionRoadSign.js'
import SectionRoadSign from './Sections/SectionRoadSign.js'
import SectionTrafficLight from './Sections/SectionTrafficLight.js'
import SectionLego from './Sections/SectionLego.js'

import SectionAlaaddin from './Sections/SectionAlaaddin.js'
import SectionAtmosphere from './Sections/SectionAtmosphere.js'
import SectionCapsule from './Sections/SectionCapsule.js'
import SectionDivision from './Sections/SectionDivision.js'
import SectionGreenScreen from './Sections/SectionGreenScreen.js'
import SectionRocket from './Sections/SectionRocket.js'
import SectionScienceCenter from './Sections/SectionScienceCenter.js'
import SectionButterfly from './Sections/SectionButterfly.js'
import SectionSocialInovation from './Sections/SectionSocialInovation.js'
import SectionSoundRoom from './Sections/SectionSoundRoom.js'
import SectionStadium from './Sections/SectionStadium.js'
import SectionYoungCard from './Sections/SectionYoungCard.js'
import SectionYoungCenter from './Sections/SectionYoungCenter.js'
import SectionJapanesePark from './Sections/SectionJapanesePark.js'
import SectionRenderRoom from './Sections/SectionRenderRoom.js'
import SectionConcert from './Sections/SectionConcert.js'
import SectionBillboard from './Sections/SectionBillboard.js'
import SectionCoWork from './Sections/SectionCoWork.js'
import SectionGameMechanic from './Sections/SectionGameMechanic.js'
import SectionTram from './Sections/SectionTram.js'
import SectionNewton from './Sections/SectionNewton.js'
import SectionStone from './Sections/SectionStone.js'
import SectionKademe from './Sections/SectionKademe.js'
import SectionBasketballCourt from './Sections/SectionBasketballCourt.js'
import SectionSoccer from './Sections/SectionSoccer.js'

export default class World {
    constructor(_options) {
        // Options
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.sizes = _options.sizes
        this.camera = _options.camera
        this.scene = _options.scene
        this.renderer = _options.renderer
        this.passes = _options.passes

        // Debug
        if (this.debug) {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setSounds()
        this.setControls()
        this.setFloor()
        this.setAreas()
        this.setStartingScreen()

        this.options = {
            config: this.config,
            time: this.time,
            resources: this.resources,
            camera: this.camera,
            passes: this.passes,
            objects: this.objects,
            areas: this.areas,
            zones: this.zones,
            walls: this.walls,
            tiles: this.tiles,
            debug: this.debugFolder
        }
    }

    start() {
        window.setTimeout(() => {
            this.camera.pan.enable()
        }, 2000)

        this.sections = {}
        this.buildings = {}

        this.setReveal()
        this.setMaterials()
        this.setShadows()
        this.setPhysics()
        this.setZones()
        this.setObjects()

        //this.setTiles()
        this.setWalls()

        this.setGround()
        //this.setRoad()
        this.setRoadSign()
        this.setTrafficLight()
        this.setLego()

        this.setAlaaddin()
        //  this.setTram()
        this.setAtmosphere()
        this.setCapsule()
        this.setDivision()
        
        this.setRenderRoom()
        this.setConcert()
   //     this.setBasketball()
        this.setBasketballCourt()
        this.setButterfly()
        this.setNewton()
        this.setStone()

        this.setCoWork()

        this.setJapanesePark()
        this.setRocket()
        this.setScienceCenter()
        this.setSocialInovation()
        this.setSoundRoom()
        this.setStadium()
        this.setYoungCard()
        this.setYoungCenter()
    //  this.setGameMechanic()
        this.setKademe()
        this.setSoccer()
        this.createBuildingAreas()

        this.setCar()

        this.setGreenScreen()

        this.setBillboard()

        this.areas.car = this.car
        this.areas.setCar(this.car)
        this.sectionRocket.setCar(this.car)
        


        window.setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.style.opacity = '0';

            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
            });
        }, 3200)
    }

    setReveal() {
        this.reveal = {}
        this.reveal.matcapsProgress = 0
        this.reveal.floorShadowsProgress = 0
        this.reveal.previousMatcapsProgress = null
        this.reveal.previousFloorShadowsProgress = null

        // Go method
        this.reveal.go = () => {
            gsap.fromTo(this.reveal, { matcapsProgress: 0 }, { matcapsProgress: 1, duration: 3 })
            gsap.fromTo(this.reveal, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, duration: 3, delay: 0.5 })
            gsap.fromTo(this.shadows, { alpha: 0 }, { alpha: 0.5, duration: 3, delay: 0.5 })

            if (this.sections.intro) {
                gsap.fromTo(this.sections.intro.instructions.arrows.label.material, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.5 })
                if (this.sections.intro.otherInstructions) {
                    gsap.fromTo(this.sections.intro.otherInstructions.label.material, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.75 })
                }
            }

            // Car
            this.physics.car.chassis.body.sleep()
            this.physics.car.chassis.body.position.set(19.913, -12.908, 1)

            window.setTimeout(() => {
                this.physics.car.chassis.body.wakeUp()
            }, 300)

            // Sound
            gsap.fromTo(this.sounds.engine.volume, { master: 0 }, { master: 0.7, duration: 0.5, delay: 0.3, ease: 'power2.in' })
            window.setTimeout(() => {
                this.sounds.play('reveal')
            }, 400)

            // Controls
            if (this.controls.touch) {
                window.setTimeout(() => {
                    this.controls.touch.reveal()
                }, 400)
            }
        }

        // Time tick
        this.time.on('tick', () => {
            // Matcap progress changed
            if (this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress) {
                // Update each material
                for (const _materialKey in this.materials.shades.items) {
                    const material = this.materials.shades.items[_materialKey]
                    material.uniforms.uRevealProgress.value = this.reveal.matcapsProgress
                }

                // Save
                this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
            }

            // Matcap progress changed
            if (this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress) {
                // Update each floor shadow
                for (const _mesh of this.objects.floorShadows) {
                    _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress
                }

                // Save
                this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
            }
        })

        // Debug
        if (this.debug) {
            this.debugFolder.add(this.reveal, 'matcapsProgress').step(0.0001).min(0).max(1).name('matcapsProgress')
            this.debugFolder.add(this.reveal, 'floorShadowsProgress').step(0.0001).min(0).max(1).name('floorShadowsProgress')
            this.debugFolder.add(this.reveal, 'go').name('reveal')
        }
    }

    setStartingScreen() {
        this.startingScreen = {}

        // Area
        this.startingScreen.area = this.areas.add({
            position: new THREE.Vector2(0, 0),
            halfExtents: new THREE.Vector2(2.35, 1.5),
            hasKey: false,
            testCar: false,
            active: false
        })

        // Loading label
        this.startingScreen.loadingLabel = {}
        this.startingScreen.loadingLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
        this.startingScreen.loadingLabel.image = new Image()
        this.startingScreen.loadingLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///9ra2ucnJzR0dH09PQmJiaNjY24uLjp6end3d1CQkLFxcVYWFiqqqp9fX3nQ5qrAAAEVUlEQVRo3u3YT08TQRQA8JEtW6CATGnDdvljaTwYE2IBI/HGRrwSetGTsZh4MPFQYiQe229gE++WePFY9Oqh1cRzieEDYIgXLxjPJu5M33vbZQszW+fgoS+B7ewO836znRl2lg1jGMP4P2Okw0yFvaKsklr3I99Tvl3iPPelGbQhKqxB4eN6N/7gVcsvbEAz1F4RLn67zzl/v6/oLvejGBQ9LsNphio4UFjmEAsVJuOK/zkDtc6w+gyTcZ3LyP6IAzjBDA+pj6LkEgAjW4kANsMAC6vmOvqAMU5RgVOTskQACicCmCcA9AXjkT5gj1MswqlxWcoTgKJ6HuAQAD5guNoAu8QpMnBul1ONMGD2PCBbRgDAKYq6AEtmXvtdj3S6GhRyW1t1DvkAgM0ggG7mu1t3xWFHFzAqv3wYCi0mY1UCGgiQPU+1oWIY8LoXcAA3qeYfr+kClvHW14PJ5OfCAgHYNAoDAORBQIrDvHjqH5c0ANTbORzBacbAQgUC2IAKAzI9gCSHlWEMLmgBPJxMvyARpIICALDm4nkAbwIA71EZx5UOgO48JnLoOhQIAN9sOgKoBoAE5r0aB8ARcNhtFzrg0VQmwCp8CAMeAADGc44S5GMBsF1aCEU2LcAcAPDCvwFytBDehCaUgJxRAKeF8BNUUQJ43iiAUlqwFKoBrTCAHjiagwEgU0YM5IYWYD4KoIgPwIXQwUbVgCXzgLpIBJNeDciWTQNskVsq1ADX/6kYBdCTjse5owbMiX+IpgGWOCPSuWpA2vN/TAMm5QTYg5IC4FdbMA0YF5Nb5s2rAaLyhzBgektGZWDArrgqi0U1QHxf38OABDwUDgTAjGfyPlTVgJT/67FBACbqyGYaaoBctQwD2vI4DecVAPkgZRhQlxPQks2rAePGAbZsRlaa1QBYEQBUHRCAmaXD0QDYxgFWdye05R9cDQCrmQYkeBA6gGXTgNEeQF4DMG4S4MLjOUZRA5A0CcjADgmjqgGwSwSg9wK1GIBS74KTgTxv/EHoiaVQsTOS5RoCJuiZyosB8EIrHpyowFiYofO0i4wCjhCQwL0hq2sCaFNM22S4JXloLk0AuLDTBzCBAAt3xykeA7CHe/mDbgdTvQ9GswSAwdbqA0giYASHjQUJnhQKhQ6z/d8rDA4hAG2Dsk042ejubHMM2nV6AMf93pCkaRjhh0WsWuz+6aasl2FwiAImReEts1/CSaFfwFouAJxC4RW+I4oCThBQE1X2WbKkBFDkqYDtJ0SHaYKq3pJJwCECjjiFPoC1w+2P0gumurgeBjT6AhIIGKOelGIAngWlFnRnMZjMIYBb7gtIIsAuYU+8GICpEhYyZVgIZ2g9rYYAX1lfAKvjnxzjnWrHALDn9K1h2k2aoI1ewGd2AWAVAVMHcKdW4wDYje739pNufJXhkJohgLu9zy4CHCKAJYUge4ddCojGyPrp9kaHmYjUi9N7+2wYwxjGZfEXMKxGE0GkkfIAAAAASUVORK5CYII='
        this.startingScreen.loadingLabel.texture = new THREE.Texture(this.startingScreen.loadingLabel.image)
        this.startingScreen.loadingLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.loadingLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.loadingLabel.texture.needsUpdate = true
        this.startingScreen.loadingLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.loadingLabel.texture })
        this.startingScreen.loadingLabel.mesh = new THREE.Mesh(this.startingScreen.loadingLabel.geometry, this.startingScreen.loadingLabel.material)
        this.startingScreen.loadingLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.loadingLabel.mesh)

        // Start label
        this.startingScreen.startLabel = {}
        this.startingScreen.startLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
        this.startingScreen.startLabel.image = new Image()
        this.startingScreen.startLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///+cnJxra2vR0dHd3d0mJib09PRYWFjp6em4uLhCQkKqqqqNjY19fX3FxcV3XeRgAAADsklEQVRo3u3YsU9TQRwH8KNgLSDQg9ZCAak1IdE4PKPu1NTEsSzOMDl3I3GpcXAxBhLjXFxNjJgQJ2ON0Rnj4uAAEyv8B/L7tV++5/VN+CM69Ldwfa+534d7d793VzeIQQzi/49c4v5lPF/1vvhFm++rjIpcyErrmrSCuz+cxng1iL/If8drPJD2Lc/Iy4VhaZWlFd4tLPfuMc6e/5LvRilJA2SkVSQA8c0OsI0uNtIAU9rsB8y1rAAZjyimAUa1mQDAeGwF+MA+9lIA69qs9AMKVoDP8vhf35A+NiMAc7YJKFSrX7tcI8BW9+k/O/kz6zSunjSnncMHiQYBcmdXrh3xCVbc2WO8N/YZZI0AxxwMArKivmwAwFKSPmV0UwBbCpj5E+C+yzUbQAaJVwUSA9SFjwFgHQ0jAMrBWgzAPCtHgFFbQAlpEwKC2zWUQgJGbAH+naSdu/fTxQAthPL5/ADD6OCpQwCAsb6LsbEGcBluOAYBmG2fkMIawHVWXEsDIGUGpZCAIRsAS93DPgDbhUmUQgKe2NUB90hfhK0YwEJYHkYpJGDbqBKiB86CGLAlzd6/S8CEvh8sACiBvrSXCshKblWEgNy2vkAMAHwGfjECcJHOu5qUQgDm6vXulshZAXJNL9GJAeg+LxeKPQBj1gzgdlnuCWAhbOi7LwaU9u0A2VWPpUgAC+GR5k0iwBtnB3Bj3qMaRYB17X0IOQhYcjYA7guxxyIAGfd1HNqchPfly7aACQUshAA2W1r5G1yG415YpgB3qIIkAHBH2D075QnQ10fHDsCl+CoGSKpiN8kMAVqIN00BsitnVgKyPIBMB4ADKU92AA5BKQIgszjKBGBLagpwB5xZBGS6pbcuizQAXMA6NAK86OCQ3okAI55BQPe7VoDxXzU/iwPASgS4GAASAiYxWgYAzvAa1loA2AkAFQIU2zEELCJtDDgIAG0CFLvp7LblC2kAtF6eTEJJ2CBAr88bAXKY4WkASbzXmwt5AvTvohHA4WSUBmj2Jt+IThQChrAOLQC13vPFMAOAQwuyTAeAKVQto3OBDOdESh2YxNZPbpYBQNbEAoBfod7e1i1BiwB0voSZWgwAOWgtAGPhD18E8ASIiRIAXNPwXJBtcqMbAFAIr5weIJMAcIx1aAAIqk0lAuyompyFwBMHAsAZlj/lgw0rsy2AkhbsgK4Q+70CUBjxeFXsUb0G1HJDJC9rketZRcCWCJwHM8DgJm7b7ch+XizXm25QQxiEOcXvwGCWOhbCZC0qAAAAABJRU5ErkJggg=='
        this.startingScreen.startLabel.texture = new THREE.Texture(this.startingScreen.startLabel.image)
        this.startingScreen.startLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.startLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.startLabel.texture.needsUpdate = true
        this.startingScreen.startLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.startLabel.texture })
        this.startingScreen.startLabel.material.opacity = 0
        this.startingScreen.startLabel.mesh = new THREE.Mesh(this.startingScreen.startLabel.geometry, this.startingScreen.startLabel.material)
        this.startingScreen.startLabel.mesh.matrixAutoUpdate = false
        this.container.add(this.startingScreen.startLabel.mesh)

        // Progress
        this.resources.on('progress', (_progress) => {
            // Update area
            this.startingScreen.area.floorBorder.material.uniforms.uAlpha.value = 1
            this.startingScreen.area.floorBorder.material.uniforms.uLoadProgress.value = _progress
        })

        // Ready
        this.resources.on('ready', () => {
            window.requestAnimationFrame(() => {
                this.startingScreen.area.activate()

                gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uAlpha, { value: 0.3, duration: 0.3 })
                gsap.to(this.startingScreen.loadingLabel.material, { opacity: 0, duration: 0.3 })
                gsap.to(this.startingScreen.startLabel.material, { opacity: 1, duration: 0.3, delay: 0.3 })
            })

            this.start()
            this.startingScreen.area.deactivate()
            gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uProgress, { value: 0, duration: 0.3, delay: 0.4 })

            gsap.to(this.startingScreen.startLabel.material, { opacity: 0, duration: 0.3, delay: 0.4 })

            window.setTimeout(() => {
                this.reveal.go()
            }, 600)
        })

        // // On interact, reveal
        // this.startingScreen.area.on('interact', () => {
        //     this.startingScreen.area.deactivate()
        //     gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uProgress, { value: 0, duration: 0.3, delay: 0.4 })

        //     gsap.to(this.startingScreen.startLabel.material, { opacity: 0, duration: 0.3, delay: 0.4 })

        //     window.setTimeout(() => {
        //         this.reveal.go()
        //     }, 600)
        // })
    }

    setSounds() {
        this.sounds = new Sounds({
            debug: this.debugFolder,
            time: this.time
        })
    }

    setAxes() {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
    }

    setControls() {
        this.controls = new Controls({
            config: this.config,
            sizes: this.sizes,
            time: this.time,
            camera: this.camera,
            sounds: this.sounds
        })
    }

    setMaterials() {
        this.materials = new Materials({
            resources: this.resources,
            debug: this.debugFolder
        })
    }

    setFloor() {
        this.floor = new Floor({
            debug: this.debugFolder
        })

        this.container.add(this.floor.container)
    }

    setShadows() {
        this.shadows = new Shadows({
            time: this.time,
            debug: this.debugFolder,
            renderer: this.renderer,
            camera: this.camera
        })
        this.container.add(this.shadows.container)
    }

    setPhysics() {
        this.physics = new Physics({
            config: this.config,
            debug: this.debug,
            scene: this.scene,
            time: this.time,
            sizes: this.sizes,
            controls: this.controls,
            sounds: this.sounds
        })

        this.container.add(this.physics.models.container)
    }

    setZones() {
        this.zones = new Zones({
            time: this.time,
            physics: this.physics,
            debug: this.debugFolder
        })
        this.container.add(this.zones.container)
    }

    setAreas() {
        this.areas = new Areas({
            config: this.config,
            resources: this.resources,
            debug: this.debug,
            renderer: this.renderer,
            camera: this.camera,
            car: this.car,
            sounds: this.sounds,
            time: this.time
        })

        this.container.add(this.areas.container)
    }

    setTiles() {
        this.tiles = new Tiles({
            resources: this.resources,
            objects: this.objects,
            debug: this.debug
        })
    }

    setWalls() {
        this.walls = new Walls({
            resources: this.resources,
            objects: this.objects
        })
    }

    setObjects() {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            shadows: this.shadows,
            sounds: this.sounds,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)

        // window.requestAnimationFrame(() =>
        // {
        //     this.objects.merge.update()
        // })
    }

    setCar() {
        this.car = new Car({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            shadows: this.shadows,
            materials: this.materials,
            controls: this.controls,
            sounds: this.sounds,
            renderer: this.renderer,
            camera: this.camera,
            debug: this.debugFolder,
            config: this.config,
            scene: this.scene,
            sectionSoundRoom: this.sectionSoundRoom,
            sectionJapanesePark: this.sectionJapanesePark,
            sectionNewton: this.sectionNewton,
            sectionConcert: this.sectionConcert,
            sectionButterfly: this.sectionButterfly,
            sectionAlaaddin: this.sectionAlaaddin,
        })
        this.container.add(this.car.container)
    }

    setGround() {
        this.sections.ground = new Ground({
            ...this.options,
            x: 0,
            y: 0,
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            walls: this.walls,
            config: this.config,
            scene: this.scene
        })
        this.container.add(this.sections.ground.container)
    }

    setRoad() {
        this.road = new Road({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            scene: this.scene
        })
        this.container.add(this.road.container)
    }
    // this.sectionRoadSign = new RoadSign({ 
    setRoadSign() {
        this.sectionRoadSign = new SectionRoadSign({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 180 // Y ekseninde 90 derece,
        });
    }

    setTrafficLight() {
        this.sectionTrafficLight = new SectionTrafficLight({
            scene: this.scene,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0, // 90 derece X ekseni etrafında döndür - dikey duruş için
            rotateY: 0, 
            rotateZ: 0, // Y ekseninde 90 derece,
            position: new THREE.Vector3(16, -14, -0.2), // Ana cadde üzerindeki trafik ışığı
        });
    
        
        // İkinci trafik ışığı - farklı bir kavşak
        this.sectionTrafficLight2 = new SectionTrafficLight({
            scene: this.scene,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0, // 90 derece X ekseni etrafında döndür - dikey duruş için
            rotateY: 0, // 180 derece Y ekseni etrafında döndür - farklı yöne bakması için
            rotateZ: Math.PI / 2, // Y ekseninde 90 derece,
            position: new THREE.Vector3(30, -31.9, -0.2), // Farklı bir kavşaktaki trafik ışığı
        });

    }

    setScienceCenter() {
        this.sectionScienceCenter = new SectionScienceCenter({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 180 // Y ekseninde 90 derece,
        });
    }

    setGreenScreen() {
        this.sectionGreenScreen = new SectionGreenScreen({
            time: this.time,
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 4, // Y ekseninde 90 derece,
            car: this.car,
            areas: this.areas,
            zones: this.zones,
            camera : this.camera,
            passes: this.passes
        });
    }

    setRenderRoom() {
        this.sectionRenderRoom = new SectionRenderRoom({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2// Y ekseninde 90 derece,
        });
    }

    setConcert() {
        this.sectionConcert = new SectionConcert({
          scene:     this.scene,
          resources: this.resources,
          physics:   this.physics,
          debug:     this.debugFolder,
          rotateX:   0,   // 
          rotateY:   0,
          rotateZ:   0 // Y ekseninde 90 derece,
        });
      }

    setBasketball() {
    //    this.sectionBasketball = new SectionBasketball({
      //      scene: this.scene,
      //      resources: this.resources,
     //       physics: this.physics,
      //      debug: this.debugFolder,
      //      rotateX: 0,   // 
      //      rotateY: 0,
      //      rotateZ: 0 // Y ekseninde 90 derece,
      //  })
    }

    setJapanesePark() {
        this.sectionJapanesePark = new SectionJapanesePark({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            scene: this.scene
        })
    }

    setCapsule() {
        this.sectionCapsule = new SectionCapsule({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: 0 // Y ekseninde 90 derece,
        });
    }

    setButterfly() {
        this.sectionButterfly = new SectionButterfly({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: 0 // Y ekseninde 90 derece,
        });
    }

    setYoungCard() {
        this.sectionYoungCard = new SectionYoungCard({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            scene: this.scene,
            rotateX: Math.PI,   // 
            rotateY: Math.PI,
            rotateZ: -Math.PI / 2   // Y ekseninde 90 derece,
        });
    }

    setRocket() {
        this.sectionRocket = new SectionRocket({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            scene: this.scene,
            areas: this.areas, // Bu parametre önemli
            sounds: this.sounds, // Bu parametre önemli
            materials: this.materials,
        })
        this.container.add(this.sectionRocket.container)
    }
    setNewton() {
        this.sectionNewton = new SectionNewton({
            scene: this.scene,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            areas: this.areas,
            materials: this.materials,
            time: this.time,
            rotateX: Math.PI / 2, // 90 derece X ekseni etrafında döndür
            rotateY: Math.PI / 8,
            rotateZ: 0
        })
    }

    setStone() {
        this.sectionStone = new SectionStone({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0
        });
    }

    setSocialInovation() {
        this.sectionSocialInovation = new SectionSocialInovation({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: Math.PI / 2,   // İhtiyaca göre ayarla
            rotateY: Math.PI,       // İhtiyaca göre ayarla
            rotateZ: 0,             // İhtiyaca göre ayarla
        });
        this.container.add(this.sectionSocialInovation.container);
    }

    setSoundRoom() {
        this.sectionSoundRoom = new SectionSoundRoom({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2 // Y ekseninde 90 derece,
        });
        this.container.name = 'SoundRoom'
    }

    setYoungCenter() {
        this.sectio = new SectionYoungCenter({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2 // Y ekseninde 90 derece,
        });
    }

    setAlaaddin() {
        this.sectionAlaaddin = new SectionAlaaddin({
            scene: this.scene,
            time: this.time,
            physics: this.physics,
            resources: this.resources,
            objects: this.objects,
        });
    }
    setTram() {
        try {
            console.log('Tram sistemi oluşturuluyor...');

            this.sectionTram = new SectionTram({
                scene: this.scene,
                resources: this.resources,
                physics: this.physics,
                debug: this.debugFolder,
                time: this.time
            });

            // Alaaddin'in pozisyonunu al (-52 yerine -45 kullanarak daha yukarıda konumlandır)
            const alaaddinPosition = new THREE.Vector3(13, -45, -1);

            // Tramı Alaaddin'in pozisyonuna yerleştir
            this.sectionTram.container.position.copy(alaaddinPosition);

            // Rayın yarıçapını Alaaddin'e göre ayarla
            this.sectionTram.railRadius = 12;

            console.log('Tram Alaaddin çevresine yerleştirildi');

            // Etkileşim alanı ekle
            this.sectionTram.addInteractionArea();

        } catch (error) {
            console.error('Tram oluşturma hatası:', error);
        }
    }
    adjustTram(heightOffset, radius) {
        if (this.sectionTram) {
            if (heightOffset !== undefined) {
                // Yüksekliği ayarla
                this.sectionTram.container.position.y = -45 + heightOffset;
            }

            if (radius !== undefined) {
                // Ray yarıçapını ayarla
                this.sectionTram.railRadius = radius;
            }

            console.log(`Tram ayarlandı: Yükseklik=${this.sectionTram.container.position.y}, Yarıçap=${this.sectionTram.railRadius}`);
        }
    }
    setAtmosphere() {
        this.sectionAtmosphere = new SectionAtmosphere({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            scene: this.scene
        })
    }

    setDivision() {
        this.division = new SectionDivision({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2 // Y ekseninde 90 derece,
        });
    }

    setStadium() {
        this.stadium = new SectionStadium({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2 // Y ekseninde 90 derece,
        });
    }

    setBillboard() {
        this.sectionBillboard = new SectionBillboard({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            areas: this.areas,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2, // Y ekseninde 90 derece,
            camera: this.camera,
            time: this.time,
            car: this.car
        });
        this.container.name = 'Billboard'
    }

    setCoWork() {
        this.sectionCoWork = new SectionCoWork({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,   // 
            rotateY: 0,
            rotateZ: Math.PI / 2 // Y ekseninde 90 derece,
        });
    }
    setGameMechanic() {
        /* 
        try {
            console.log('setGameMechanic başlatılıyor');

            this.sectionGameMechanic = new SectionGameMechanic({
                scene: this.scene,
                resources: this.resources
            });

            // Container'a ekle
            if (this.sectionGameMechanic && this.sectionGameMechanic.container) {
                this.container.add(this.sectionGameMechanic.container);

                // Oyun mantığı
                const ball = this.sectionGameMechanic.ball;
                const goal = this.sectionGameMechanic.goal;
                const field = this.sectionGameMechanic.field;

                // Oyun değişkenleri
                let isBallMoving = false;
                let score = 0;
                let lastCarPosition = new THREE.Vector3();

                // Her karede kontrol et
                this.time.on('tick', () => {
                    try {
                        // Araba pozisyonunu kontrol et
                        if (this.car && this.car.chassis && this.car.chassis.object) {
                            const carPosition = this.car.chassis.object.position;

                            // Top ile araba arasındaki mesafeyi hesapla
                            const ballDistance = Math.sqrt(
                                Math.pow(carPosition.x - ball.position.x, 2) +
                                Math.pow(carPosition.z - ball.position.z, 2)
                            );

                            // Araba topa çarptı mı? (3 birim mesafe kontrol)
                            if (ballDistance < 3 && !isBallMoving) {
                                isBallMoving = true;

                                // Hareket vektörünü hesapla (arabadan topa doğru)
                                const moveVector = new THREE.Vector3(
                                    ball.position.x - carPosition.x,
                                    0,
                                    ball.position.z - carPosition.z
                                ).normalize();

                                // Arabanın hızını hesapla
                                const carVelocity = new THREE.Vector3(
                                    carPosition.x - lastCarPosition.x,
                                    0,
                                    carPosition.z - lastCarPosition.z
                                );

                                const carSpeed = carVelocity.length() * 15; // Etki faktörü

                                // Topu hareket ettir
                                const animateBall = () => {
                                    let moveDistance = carSpeed;
                                    let steps = 0;

                                    const moveBall = () => {
                                        if (steps < 100 && moveDistance > 0.01) {
                                            // Topu hareket ettir
                                            ball.position.x += moveVector.x * moveDistance;
                                            ball.position.z += moveVector.z * moveDistance;

                                            // Top dönüşü
                                            ball.rotation.x += moveDistance * 0.5;
                                            ball.rotation.z += moveDistance * 0.3;

                                            // Sürtünme - yavaşlama
                                            moveDistance *= 0.95;

                                            // Topun kaleye girip girmediğini kontrol et
                                            const goalDistance = Math.sqrt(
                                                Math.pow(ball.position.x - goal.position.x, 2) +
                                                Math.pow(ball.position.z - goal.position.z, 2)
                                            );

                                            // Top kaleye yakın mı?
                                            if (goalDistance < 6 && ball.position.z < -9) {
                                                // GOL!
                                                score++;
                                                console.log('GOL! Skor:', score);

                                                // Topu başlangıç pozisyonuna getir
                                                setTimeout(() => {
                                                    ball.position.set(0, 1, 0);
                                                    ball.rotation.set(0, 0, 0);
                                                }, 1000);

                                                // Animasyonu bitir
                                                steps = 100;
                                            }

                                            // Sahanın sınırlarını kontrol et
                                            const fieldLimits = {
                                                minX: -15,
                                                maxX: 15,
                                                minZ: -15,
                                                maxZ: 15
                                            };

                                            // Top sınırların dışına çıktı mı?
                                            if (ball.position.x < fieldLimits.minX ||
                                                ball.position.x > fieldLimits.maxX ||
                                                ball.position.z < fieldLimits.minZ ||
                                                ball.position.z > fieldLimits.maxZ) {

                                                // Topun saha dışına çıkmasını engelle
                                                if (ball.position.x < fieldLimits.minX) {
                                                    ball.position.x = fieldLimits.minX;
                                                    moveVector.x *= -0.8; // Sekme etkisi
                                                }
                                                if (ball.position.x > fieldLimits.maxX) {
                                                    ball.position.x = fieldLimits.maxX;
                                                    moveVector.x *= -0.8;
                                                }
                                                if (ball.position.z < fieldLimits.minZ) {
                                                    ball.position.z = fieldLimits.minZ;
                                                    moveVector.z *= -0.8;
                                                }
                                                if (ball.position.z > fieldLimits.maxZ) {
                                                    ball.position.z = fieldLimits.maxZ;
                                                    moveVector.z *= -0.8;
                                                }
                                            }

                                            steps++;
                                            requestAnimationFrame(moveBall);
                                        } else {
                                            // Hareket bitti
                                            isBallMoving = false;
                                        }
                                    };

                                    // Hareketi başlat
                                    moveBall();
                                };

                                // Top animasyonunu başlat
                                animateBall();
                            }

                            // Arabanın son pozisyonunu kaydet
                            lastCarPosition.copy(carPosition);
                        }
                    } catch (e) {
                        // Hataları sessizce ignore et
                    }
                });

                console.log('Futbol oyunu mantığı başlatıldı');
            }
        } catch (error) {
            console.error('Game mechanic oluşturma hatası:', error.stack);
        }
        */
        
        // Fonksiyon içeriği devre dışı bırakıldı
        console.log('Futbol sahası devre dışı bırakıldı - setGameMechanic() yorum satırına alındı');
    }

    setLego() {
        this.sectionLego = new SectionLego({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0
        });
    }

    setSoccer() {
        this.sectionSoccer = new SectionSoccer({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 0.5
        });
    }

    setKademe() {
        this.sectionKademe = new SectionKademe({
            scene: this.scene,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,
            rotateY: Math.PI / 6, // 30 derece Y ekseni etrafında dönüş (daha uygun görünüm için)
            rotateZ: 0,
            areas: this.areas, // Areas sınıfını ekle
            car: this.car // Araba referansını ekle
        });
    }

    setBasketballCourt() {
        this.sectionBasketballCourt = new SectionBasketballCourt({
            scene: this.scene,
            resources: this.resources,
            physics: this.physics,
            debug: this.debugFolder,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0
        });
    }

    createBuildingAreas() {
        // Tüm binalar için alanlar oluştur
        const buildings = [
            //{ id: 'billboard', name: 'Billboard', position: { x: 0, y: 40 }, size: { x: 10, y: 10 } },
            //{ id: 'cowork', name: 'Co-Working', position: { x: -20, y: 20 }, size: { x: 10, y: 10 } },
            //{ id: 'japanesePark', name: 'Japon Parkı', position: { x: 10, y: -26 }, size: { x: 12, y: 10 } },
            //{ id: 'alaaddin', name: 'Alaaddin', position: { x: 8, y: -50 }, size: { x: 12, y: 12 } },
            
            //{ id: 'greenScreen', name: 'Green Screen', position: { x: -25, y: 0 }, size: { x: 10, y: 10 } },
            //{ id: 'renderRoom', name: 'Render Odası', position: { x: 0, y: -25 }, size: { x: 10, y: 10 } },
            
            //{ id: 'basketball', name: 'Basketbol Sahası', position: { x: -30, y: 30 }, size: { x: 10, y: 10 } },
            //{ id: 'butterfly', name: 'Kelebek', position: { x: 55, y: -16 }, size: { x: 11, y: 10 } },
            //{ id: 'rocket', name: 'Roket', position: { x: -30, y: -30 }, size: { x: 10, y: 10 } },
            
            //{ id: 'socialInovation', name: 'Sosyal İnovasyon', position: { x: 75, y: -10 }, size: { x: 10, y: 10 },link: "https://www.sosyalinovasyonajansi.com/", description: "Konya Büyükşehir Belediyesi tarafından hayata geçirilen ajans, kültür endüstrileri, sivil toplum ve etki yönetimi alanlarında yenilikçi çözümler üretir; gençleri Ar-Ge ekosistemine dahil eder." },
            //{ id: 'soundRoom', name: 'Ses Odası', position: { x: -40, y: 0 }, size: { x: 10, y: 10 } },
            //{ id: 'stadium', name: 'Stadyum', position: { x: 0, y: -40 }, size: { x: 10, y: 10 } },
            
            { id: 'atmosphere', name: 'Atmosfer Bosna Gençlik Merkezi', position: { x: -10, y: -9 }, size: { x: 5, y: 5 },link: "https://www.konya.bel.tr/hizmet-binalari-ve-sosyal-tesisler/atmosfer-bosna-genclik-merkezi", description: "Konya Büyükşehir Belediyesi tarafından hayata geçirilen bu merkez, gençlere sosyal, kültürel ve akademik destek sunan çok yönlü bir yaşam alanıdır." },
            { id: 'capsule', name: 'Kapsül Teknoloji Platformu', position: { x: 37, y: -18 }, size: { x: 7, y:7 },link: "https://www.kapsul.org.tr", description: "Konya Büyükşehir Belediyesi bünyesinde faaliyet gösteren Kapsül, gençleri teknoloji üretimine teşvik ederek Türkiye'nin milli teknoloji hamlesine katkı sağlar." },
            { id: 'division', name: 'Divizyon', position: { x: -65, y: 4 }, size: { x: 8, y: 8 }, link: "https://www.divizyon.org/", description: "Konya Büyükşehir Belediyesi tarafından kurulan Divizyon, yazılım ve dijital sanatlar alanında kolektif üretimi destekleyen açık inovasyon platformudur.", rotation: Math.PI / 90 * 290  },
            { id: 'concert', name: 'Konser Alanı', position: { x: -33, y: 22 }, size: { x: 5, y: 5 } },
            { id: 'scienceCenter', name: 'Konya Bilim Merkezi', position: { x: 42, y: 14 }, size: { x: 12, y: 9 }, link: "https://www.konyabilimmerkezi.com", description: "Konya Büyükşehir Belediyesi tarafından kurulan Türkiye'nin TÜBİTAK destekli ilk bilim merkezi, bilimi toplumun her kesimine sevdirmeyi ve bilimsel farkındalığı artırmayı amaçlamaktadır." },
            { id: 'youngCard', name: 'Genç Kültür Kart', position: { x: 42, y: -40 }, size: { x: 7, y: 7 },link: "https://genckulturkart.konya.bel.tr/", description: "Konya Büyükşehir Belediyesi tarafından hayata geçirilen bu program, üniversite öğrencilerinin sosyal, kültürel ve sportif etkinliklere aktif katılımını teşvik eder." },
            { id: 'youngCenter', name: 'Çalışan Gençlik', position: { x: 57, y: -38 }, size: { x: 6, y: 6 },link: "https://www.calisangenclik.com", description: "Konya Büyükşehir Belediyesi tarafından hayata geçirilen merkez, gençlerin ahilik kültürünü benimseyerek iş ve yaşam alanlarında gelişimini desteklemeyi amaçlar." }
        ];
        
        // Önceki yaklaşılan binayı takip etmek için değişken
        this.lastBuilding = null;
        
        buildings.forEach(building => {

            if (this.areas) {
                const area = this.areas.add({
                    position: new THREE.Vector2(building.position.x, building.position.y),
                    halfExtents: new THREE.Vector2(building.size.x, building.size.y),
                    testCar: true,
                    active: true,
                    hasKey: true,
                    car: this.car,
                    isBuilding : true,
                    areaSize: building.size.x,
                    name: building.name,
                    link: building.link,
                    description: building.description,
                    physics: this.physics,
                    areas: this.areas,
                });

                if (building.id === 'division' && area.container) {
                    area.container.rotation.z = building.rotation;
                }

                else if (building.id === 'concert') {
                    area.isBuilding = false;
                    area.isCustom = true;
                    area.id = building.id;
                }
            }
        });
    }
}