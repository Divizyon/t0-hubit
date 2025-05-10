import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.sizes = _options.sizes
        this.renderer = _options.renderer
        this.debug = _options.debug
        this.config = _options.config

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.target = new THREE.Vector3(0, 0, 0)
        this.targetEased = new THREE.Vector3(0, 0, 0)
        this.easing = 0.15

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            // this.debugFolder.open()
        }

        this.setAngle()
        this.setInstance()
        this.setZoom()
        this.setPan()
        this.setOrbitControls()
        this.setCarMovementTracking()
        this.setThirdPersonMode() // Yeni metodu ekleyin
    }

    setAngle()
    {
        // Set up
        this.angle = {}

        // Items
        this.angle.items = {
            default: new THREE.Vector3(1.135, - 1.45, 1.15),
            projects: new THREE.Vector3(0.38, - 1.4, 1.63)
        }

        // Value
        this.angle.value = new THREE.Vector3()
        this.angle.value.copy(this.angle.items.default)

        // Set method
        this.angle.set = (_name) =>
        {
            const angle = this.angle.items[_name]
            if(typeof angle !== 'undefined')
            {
                gsap.to(this.angle.value, { ...angle, duration: 2, ease: 'power1.inOut' })
            }
        }

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(1).name('easing')
            this.debugFolder.add(this.angle.value, 'x').step(0.001).min(- 2).max(2).name('invertDirectionX').listen()
            this.debugFolder.add(this.angle.value, 'y').step(0.001).min(- 2).max(2).name('invertDirectionY').listen()
            this.debugFolder.add(this.angle.value, 'z').step(0.001).min(- 2).max(2).name('invertDirectionZ').listen()
        }
    }

    setInstance()
    {
        // Set up
        this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 1, 80)
        this.instance.up.set(0, 0, 1)
        this.instance.position.copy(this.angle.value)
        this.instance.lookAt(new THREE.Vector3())
        this.container.add(this.instance)

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height
            this.instance.updateProjectionMatrix()
        })

        // Time tick
        this.time.on('tick', () =>
        {
            if(!this.orbitControls.enabled)
            {
                this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing
                this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing
                this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing

                // Apply zoom
                this.instance.position.copy(this.targetEased).add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance))

                // Look at target
                this.instance.lookAt(this.targetEased)

                // Apply pan
                this.instance.position.x += this.pan.value.x
                this.instance.position.y += this.pan.value.y
            }
        })
    }

    setZoom()
    {
        // Set up
        this.zoom = {}
        this.zoom.easing = 0.1
        this.zoom.minDistance = 14 // 14 orjinal ayar en son eski haline getir 
        this.zoom.amplitude = 15
        this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5
        this.zoom.targetValue = this.zoom.value
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value

        // Listen to mousewheel event
        document.addEventListener('mousewheel', (_event) =>
        {
            this.zoom.targetValue += _event.deltaY * 0.001
            this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)
        }, { passive: true })

        // Touch
        this.zoom.touch = {}
        this.zoom.touch.startDistance = 0
        this.zoom.touch.startValue = 0

        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            if(_event.touches.length === 2)
            {
                this.zoom.touch.startDistance = Math.hypot(_event.touches[0].clientX - _event.touches[1].clientX, _event.touches[0].clientX - _event.touches[1].clientX)
                this.zoom.touch.startValue = this.zoom.targetValue
            }
        })

        this.renderer.domElement.addEventListener('touchmove', (_event) =>
        {
            if(_event.touches.length === 2)
            {
                _event.preventDefault()

                const distance = Math.hypot(_event.touches[0].clientX - _event.touches[1].clientX, _event.touches[0].clientX - _event.touches[1].clientX)
                const ratio = distance / this.zoom.touch.startDistance

                this.zoom.targetValue = this.zoom.touch.startValue - (ratio - 1)
                this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)
            }
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing
            this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value
        })
    }

    setPan()
    {
        // Set up
        this.pan = {}
        this.pan.enabled = false
        this.pan.active = false
        this.pan.easing = 0.1
        this.pan.start = {}
        this.pan.start.x = 0
        this.pan.start.y = 0
        this.pan.value = {}
        this.pan.value.x = 0
        this.pan.value.y = 0
        this.pan.targetValue = {}
        this.pan.targetValue.x = this.pan.value.x
        this.pan.targetValue.y = this.pan.value.y
        this.pan.raycaster = new THREE.Raycaster()
        this.pan.mouse = new THREE.Vector2()
        this.pan.needsUpdate = false
        this.pan.hitMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, visible: false })
        )
        this.container.add(this.pan.hitMesh)

        this.pan.reset = () =>
        {
            this.pan.targetValue.x = 0
            this.pan.targetValue.y = 0
        }

        this.pan.enable = () =>
        {
            this.pan.enabled = true

            // Update cursor
            this.renderer.domElement.classList.add('has-cursor-grab')
        }

        this.pan.disable = () =>
        {
            this.pan.enabled = false

            // Update cursor
            this.renderer.domElement.classList.remove('has-cursor-grab')
        }

        this.pan.down = (_x, _y) =>
        {
            if(!this.pan.enabled)
            {
                return
            }

            // Update cursor
            this.renderer.domElement.classList.add('has-cursor-grabbing')

            // Activate
            this.pan.active = true

            // Update mouse position
            this.pan.mouse.x = (_x / this.sizes.viewport.width) * 2 - 1
            this.pan.mouse.y = - (_y / this.sizes.viewport.height) * 2 + 1

            // Get start position
            this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)

            const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

            if(intersects.length)
            {
                this.pan.start.x = intersects[0].point.x
                this.pan.start.y = intersects[0].point.y
            }
        }

        this.pan.move = (_x, _y) =>
        {
            if(!this.pan.enabled)
            {
                return
            }

            if(!this.pan.active)
            {
                return
            }

            this.pan.mouse.x = (_x / this.sizes.viewport.width) * 2 - 1
            this.pan.mouse.y = - (_y / this.sizes.viewport.height) * 2 + 1

            this.pan.needsUpdate = true
        }

        this.pan.up = () =>
        {
            // Deactivate
            this.pan.active = false

            // Update cursor
            this.renderer.domElement.classList.remove('has-cursor-grabbing')
        }

        // Mouse
        window.addEventListener('mousedown', (_event) =>
        {
            this.pan.down(_event.clientX, _event.clientY)
        })

        window.addEventListener('mousemove', (_event) =>
        {
            this.pan.move(_event.clientX, _event.clientY)
        })

        window.addEventListener('mouseup', () =>
        {
            this.pan.up()
        })

        // Touch
        this.renderer.domElement.addEventListener('touchstart', (_event) =>
        {
            if(_event.touches.length === 1)
            {
                this.pan.down(_event.touches[0].clientX, _event.touches[0].clientY)
            }
        })

        this.renderer.domElement.addEventListener('touchmove', (_event) =>
        {
            if(_event.touches.length === 1)
            {
                this.pan.move(_event.touches[0].clientX, _event.touches[0].clientY)
            }
        })

        this.renderer.domElement.addEventListener('touchend', () =>
        {
            this.pan.up()
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            // If active
            if(this.pan.active && this.pan.needsUpdate)
            {
                // Update target value
                this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance)

                const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh])

                if(intersects.length)
                {
                    this.pan.targetValue.x = - (intersects[0].point.x - this.pan.start.x)
                    this.pan.targetValue.y = - (intersects[0].point.y - this.pan.start.y)
                }

                // Update needsUpdate
                this.pan.needsUpdate = false
            }

            // Update value and apply easing
            this.pan.value.x += (this.pan.targetValue.x - this.pan.value.x) * this.pan.easing
            this.pan.value.y += (this.pan.targetValue.y - this.pan.value.y) * this.pan.easing
        })
    }

    setOrbitControls()
    {
        // Set up
        this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement)
        this.orbitControls.enabled = false
        this.orbitControls.enableKeys = false
        this.orbitControls.zoomSpeed = 0.5

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.orbitControls, 'enabled').name('orbitControlsEnabled')
        }
    }

    setCarMovementTracking()
    {
        // Araba hareketini takip etmek için gerekli değişkenler
        this.carMovement = {
            speed: new THREE.Vector3(),
            localSpeed: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            localAcceleration: new THREE.Vector3(),
            position: new THREE.Vector3(),
            lastLogTime: 0
        }
    
        console.log('Araba hareketini takip etmek için kamera hazır');
        
        // Global değişkenden araba referansını almayı dene
        this.time.on('tick', () => {
            // Global değişkenden araba referansını almayı dene
            if(window.application && window.application.world && window.application.world.car) {
                const car = window.application.world.car;
                
                if(car.movement && car.chassis) {
                    // Araba hareketini kopyala
                    this.carMovement.speed.copy(car.movement.speed);
                    this.carMovement.localSpeed.copy(car.movement.localSpeed);
                    this.carMovement.acceleration.copy(car.movement.acceleration);
                    this.carMovement.localAcceleration.copy(car.movement.localAcceleration);
                    this.carMovement.position.copy(car.chassis.object.position);
                    
                    // Belirli aralıklarla konsola yazdır
                    const speedThreshold = 0.01;
                    const logInterval = 500; // milisaniye cinsinden log aralığı
                    
                    if (
                        (Math.abs(this.carMovement.localSpeed.x) > speedThreshold || 
                         Math.abs(this.carMovement.localSpeed.y) > speedThreshold) && 
                        (this.time.elapsed - this.carMovement.lastLogTime > logInterval)
                    ) {
                        console.log('Araba hareket ediyor:', {
                            hız_x: this.carMovement.localSpeed.x.toFixed(2),
                            hız_y: this.carMovement.localSpeed.y.toFixed(2),
                            ivme_x: this.carMovement.localAcceleration.x.toFixed(2),
                            ivme_y: this.carMovement.localAcceleration.y.toFixed(2),
                            pozisyon: {
                                x: this.carMovement.position.x.toFixed(2),
                                y: this.carMovement.position.y.toFixed(2),
                                z: this.carMovement.position.z.toFixed(2)
                            }
                        });
                        this.carMovement.lastLogTime = this.time.elapsed;
                    }
                }
            }
        });
    }

    // Araba referansını ayarlamak için yeni bir metot
    setCarReference(car)
    {
        this.car = car;
        console.log('Araba referansı kameraya eklendi');
    }

    setThirdPersonMode() {
        // Üçüncü şahıs kamera modu ayarları
        this.thirdPerson = {
            enabled: false,
            offset: new THREE.Vector3(-8, 0, 3), // Arabanın arkasında ve biraz yukarıda
            lookAtOffset: new THREE.Vector3(0, 0, 2), // Arabanın biraz önüne bak
            smoothFactor: 0.001, // Kamera takip yumuşaklığı
            transitionDuration: 1.0 // Geçiş süresi (saniye)
        };
        
        // O tuşuna basıldığında üçüncü şahıs modunu aç/kapat
        window.addEventListener('keydown', (event) => {
            if (event.key === 'o' || event.key === 'O') {
                this.thirdPerson.enabled = !this.thirdPerson.enabled;
                
                if (this.thirdPerson.enabled) {
                    console.log('Üçüncü şahıs kamera modu aktif');
                    // Orbit kontrollerini devre dışı bırak
                    this.orbitControls.enabled = false;
                    // Pan'i devre dışı bırak
                    this.pan.disable();
                } else {
                    console.log('Normal kamera moduna dönüldü');
                    // Normal kamera moduna dön
                    this.target.set(0, 0, 0);
                }
            }
        });
        
        // Tick olayına üçüncü şahıs kamera güncellemesini ekle
        this.time.on('tick', () => {
            // Eğer üçüncü şahıs modu aktifse ve araba referansı varsa
            if (this.thirdPerson.enabled && window.application && window.application.world && window.application.world.car) {
                const car = window.application.world.car;
                
                if (car.chassis && car.chassis.object) {
                    // Arabanın pozisyonu ve rotasyonu
                    const carPosition = car.chassis.object.position;
                    const carRotation = car.chassis.object.rotation;
                    
                    // Arabanın yönüne göre offset hesapla
                    const offsetVector = this.thirdPerson.offset.clone();
                    
                    // Arabanın rotasyonuna göre offset'i döndür
                    offsetVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), carRotation.z);
                    
                    // Hedef pozisyonu hesapla (araba + offset)
                    const targetPosition = carPosition.clone().add(offsetVector);
                    
                    // Kameranın bakacağı noktayı hesapla
                    const lookAtOffset = this.thirdPerson.lookAtOffset.clone();
                    lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 0, 1), carRotation.z);
                    const lookAtPosition = carPosition.clone().add(lookAtOffset);
                    
                    // Hedefi güncelle (kameranın bakacağı nokta)
                    this.target.copy(lookAtPosition);
                    
                    // Kamera pozisyonunu doğrudan güncelle (yumuşak geçiş için)
                    this.targetEased.copy(this.target);
                    this.instance.position.copy(targetPosition);
                    this.instance.lookAt(this.target);
                }
            }
        });
        
        // Debug paneline üçüncü şahıs kamera ayarlarını ekle
        if (this.debug && this.debugFolder) {
            const thirdPersonFolder = this.debugFolder.addFolder('thirdPersonCamera');
            thirdPersonFolder.add(this.thirdPerson, 'enabled').name('Aktif').listen();
            thirdPersonFolder.add(this.thirdPerson.offset, 'x').min(-10).max(10).step(0.1).name('Offset X');
            thirdPersonFolder.add(this.thirdPerson.offset, 'y').min(-10).max(10).step(0.1).name('Offset Y');
            thirdPersonFolder.add(this.thirdPerson.offset, 'z').min(-10).max(10).step(0.1).name('Offset Z');
            thirdPersonFolder.add(this.thirdPerson.lookAtOffset, 'x').min(-10).max(10).step(0.1).name('LookAt X');
            thirdPersonFolder.add(this.thirdPerson.lookAtOffset, 'y').min(-10).max(10).step(0.1).name('LookAt Y');
            thirdPersonFolder.add(this.thirdPerson.lookAtOffset, 'z').min(-10).max(10).step(0.1).name('LookAt Z');
            thirdPersonFolder.add(this.thirdPerson, 'smoothFactor').min(0.01).max(1).step(0.01).name('Yumuşaklık');
        }
    }
}
