import * as THREE from 'three'
import CANNON from 'cannon'
import gsap from 'gsap'

let positionX = 55
let positionY = 8
let positionZ = 5

export default class SectionRocket {
    constructor(_options) {
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.physics = _options.physics
        this.debug = _options.debug
        this.scene = _options.scene
        this.sounds = _options?.sounds
        this.areas = _options?.areas

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.rocketLaunched = false

        // Önce modeli ayarla
        this.setModel()

        // Ardından etkileşim butonunu ekle
        if (this.areas) {
            this.setInteractionButton()
        }

        // Klavye kontrolü ekle
        this.setupKeyboardControls()
    }

    // Klavye kontrolü ekleme
    setupKeyboardControls() {
        // Enter tuşu için event listener ekle
        window.addEventListener('keydown', (event) => {
            // Enter tuşuna basıldıysa (keyCode: 13)
            if (event.keyCode === 13 || event.key === 'Enter') {
                // Hemen fırlat
                this.launchRocket();
            }
        });
    }

    setModel() {
        const baseScene = this.resources.items.Rocket?.scene;
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

    setInteractionButton() {
        this.button = {}

        // "OPEN" yazısı içeren texture yerine ok buton oluştur
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 64
        const context = canvas.getContext('2d')

        // Buton arka planı - kırmızı ok işareti
        context.fillStyle = '#FF4500'
        context.beginPath()
        context.moveTo(54, 12) // Sol üst
        context.lineTo(74, 32) // Orta
        context.lineTo(54, 52) // Sol alt
        context.closePath()
        context.fill()

        // "ENTER" yazısı ekle
        context.font = "bold 14px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("ENTER", 40, 32);

        // Texture oluştur
        const buttonTexture = new THREE.CanvasTexture(canvas)
        buttonTexture.magFilter = THREE.NearestFilter
        buttonTexture.minFilter = THREE.LinearFilter

        // Etkileşim alanı - roketin yanında
        this.button.area = this.areas.add({
            position: new THREE.Vector2(positionX + 4, positionZ), // Roketin yanına
            halfExtents: new THREE.Vector2(2, 2), // Daha küçük buton
            hasKey: true,
            testCar: false,
            active: true
        })

        // Buton görünümü - BEYAZ renk
        this.button.area.floorBorder.material.uniforms.uColor.value = new THREE.Color(0xffffff) // Beyaz renk
        this.button.area.floorBorder.material.uniforms.uAlpha.value = 0.8 // Daha belirgin

        // Buton etiketi - container kullanacağız
        this.button.container = new THREE.Object3D()
        this.button.container.position.set(positionX + 0, 0, positionZ) // Roketin yanında
        this.container.add(this.button.container)

        // Buton etiketi (ok)
        this.button.areaLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1), // Daha küçük geometri
            new THREE.MeshBasicMaterial({
                transparent: true,
                depthWrite: false,
                map: buttonTexture,
                opacity: 0.9 // Daha belirgin
            })
        )

        this.button.areaLabel.position.set(0, 0, -1) // Yerden 2 birim yukarı
        this.button.areaLabel.scale.set(1, 1, 1) // Normal boyut
        this.button.areaLabel.rotation.x = -Math.PI * 0
        this.button.container.add(this.button.areaLabel)

        // Hover efekti
        this.button.area.on('in', () => {
            // Buton hover etkisi  
            gsap.to(this.button.areaLabel.material, {
                opacity: 1,
                duration: 0.3
            })

            // Butonun boyutunu büyüt
            gsap.to(this.button.areaLabel.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.3
            })
        })

        this.button.area.on('out', () => {
            // Hover çıkışı
            gsap.to(this.button.areaLabel.material, {
                opacity: 0.9,
                duration: 0.3
            })

            // Boyutu normalize et
            gsap.to(this.button.areaLabel.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3
            })
        })

        // Etkileşim eventi
        this.button.area.on('interact', () => {
            this.launchRocket()
        })
    }

    launchRocket() {
        if (this.rocketLaunched) return

        console.log('Roket fırlatılıyor!')
        this.rocketLaunched = true

        // Buton rengini değiştir - KIRMIZI renk
        if (this.button && this.button.area) {
            this.button.area.floorBorder.material.uniforms.uColor.value = new THREE.Color(0xff0000) // Kırmızı
        }

        // Roketi fırlat (yukarı doğru animasyon)
        const rocketObject = this.model.base.container
        const originalPosition = rocketObject.position.clone()

        // Ses efekti
        if (this.sounds) {
            this.sounds.play('reveal')
        }
        //  rocketObject.rotation.y = -Math.PI / 180;
        // 0.5 saniye bekleyip harekete başla
        setTimeout(() => {
            // Alev ve duman efektlerini başlat
            this.createFlameEffect()
            this.createSmokeEffect()

            // Roketi çok yavaşça yukarı doğru hareket ettir
            gsap.to(rocketObject.position, {
                y: positionY + 100, // Yüksek bir yükselme
                duration: 3, // Çok daha uzun süre (30 saniye)
                ease: 'power1.in', // Çok kademeli hızlanma
                onComplete: () => {
                    // Roketi tamamen gizle
                    rocketObject.visible = false;

                    setTimeout(() => {
                        // Roketi orijinal konumuna getir ve göster
                        rocketObject.position.copy(originalPosition);
                        rocketObject.visible = true;

                        this.rocketLaunched = false

                        // Butonu sıfırla
                        if (this.button && this.button.area) {
                            this.button.area.floorBorder.material.uniforms.uColor.value = new THREE.Color(0xffffff) // Beyaz
                        }
                    }, 2000)
                }
            })

            // Çok hafif bir dönüş ekle
            gsap.to(rocketObject.rotation, {
                z: Math.PI * 2, // Daha da hafif rotasyon
                y: Math.PI * 2,
                duration: 30, // Aynı süre
                ease: 'power1.in'
            })
        }, 500); // 0.5 saniye bekle
    }

    createSmokeEffect() {
        // Alev efekti sürekli oluştur
        this.flameInterval = setInterval(() => this.createFlameEffect(), 100);

        // 3 saniye sonra alev efektini durdur
        setTimeout(() => {
            clearInterval(this.flameInterval);
        }, 2000);

        // Beyaz duman efekti - daha küçük ve roketin altına odaklı
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5 // Daha düşük opaklık
        });

        // Daha küçük duman parçacıkları - roketin altına odaklı
        for (let i = 0; i < 10; i++) { // Parçacık sayısını azalttık
            const size = 0.5 + Math.random() * 0.8; // Daha da küçük parçacıklar
            const smokeGeometry = new THREE.PlaneGeometry(size, size);
            const smokeMat = smokeMaterial.clone();
            smokeMat.opacity = 0.15 + Math.random() * 0.2; // Daha düşük opaklık

            const smoke = new THREE.Mesh(smokeGeometry, smokeMat);

            // Roketin tam altında yerleştir, çok az yayılım
            const radius = 0.2 + Math.random() * 0.3; // Çok daha dar bir yayılım
            const angle = Math.random() * Math.PI * 2;

            smoke.position.set(
                positionX + Math.cos(angle) * radius,
                positionY - 0.5 - Math.random() * 0.3, // Roketin hemen altında
                positionZ + Math.sin(angle) * radius
            );

            // Dumanı yatay yönde konumlandır
            smoke.rotation.x = -Math.PI / 2;
            smoke.rotation.z = Math.random() * Math.PI * 2;

            this.scene.add(smoke);

            // Daha az genişleyen ve solan duman animasyonu
            gsap.to(smoke.scale, {
                x: 1.2 + Math.random() * 0.5, // Daha az genişleme
                y: 1.2 + Math.random() * 0.5,
                duration: 2 + Math.random() * 1,
                ease: 'power1.out'
            });

            gsap.to(smoke.material, {
                opacity: 0,
                duration: 2 + Math.random() * 1,
                onComplete: () => {
                    this.scene.remove(smoke);
                    smoke.geometry.dispose();
                    smoke.material.dispose();
                }
            });

            // Aşağı doğru hareket animasyonu - çok daha az
            gsap.to(smoke.position, {
                y: smoke.position.y - (0.3 + Math.random() * 0.4), // Daha az hareket
                duration: 2 + Math.random() * 1,
                ease: 'power1.out'
            });
        }

        // Roketin arkasında kalan az sayıda iz
        for (let i = 0; i < 8; i++) { // Daha az iz
            setTimeout(() => {
                const size = 0.4 + Math.random() * 0.4; // Daha küçük parçacıklar
                const smokeGeometry = new THREE.PlaneGeometry(size, size);
                const smokeMat = smokeMaterial.clone();
                smokeMat.opacity = 0.1 + Math.random() * 0.1; // Daha düşük opaklık

                const smoke = new THREE.Mesh(smokeGeometry, smokeMat);

                // Roketin tam altında başlayıp minimum dağılma
                const smallRadius = 0.1 + Math.random() * 0.2; // Daha dar
                const angle = Math.random() * Math.PI * 2;

                smoke.position.set(
                    positionX + Math.cos(angle) * smallRadius,
                    positionY - 0.5,
                    positionZ + Math.sin(angle) * smallRadius
                );

                this.scene.add(smoke);

                // Yavaşça aşağı düşen duman
                gsap.to(smoke.position, {
                    y: smoke.position.y - (0.5 + Math.random() * 0.5), // Daha az düşüş
                    duration: 2 + Math.random() * 1,
                    ease: 'power1.out'
                });

                gsap.to(smoke.scale, {
                    x: 0.8 + Math.random() * 0.4, // Daha az genişleme
                    y: 0.8 + Math.random() * 0.4,
                    duration: 2 + Math.random() * 1,
                    ease: 'power1.out'
                });

                gsap.to(smoke.material, {
                    opacity: 0,
                    duration: 2 + Math.random() * 1,
                    onComplete: () => {
                        this.scene.remove(smoke);
                        smoke.geometry.dispose();
                        smoke.material.dispose();
                    }
                });
            }, i * 100);
        }
    }

    // Alev efekti - direkt roketin altından çıkan çok daha kompakt alev 
    createFlameEffect() {
        // Ana alev konisi - çok daha küçük
        const flameGeometry = new THREE.ConeGeometry(0.3, 4, 16); // Ölçekleri yarıya indirdik
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500, // Turuncu
            transparent: true,
            opacity: 0.8
        });

        const flame = new THREE.Mesh(flameGeometry, flameMaterial);

        // Roketin tam altında konumlandır
        flame.position.set(positionX, positionY - 0.5, positionZ);
        flame.rotation.x = Math.PI; // Koninin ucu aşağıya baksın
        this.scene.add(flame);

        // Alev animasyonu - direkt aşağı doğru
        const randomScale = 1.4 + Math.random() * 0.2; // Daha küçük ölçek
        gsap.to(flame.scale, {
            y: randomScale,
            duration: 0.2,
            ease: 'power2.out'
        });

        gsap.to(flame.material, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.scene.remove(flame);
                flame.geometry.dispose();
                flameMaterial.dispose();
            }
        });

        // Merkezdeki sarı alev - daha dar
        const brightFlameGeometry = new THREE.ConeGeometry(0.2, 5, 16); // Daha küçük
        const brightFlameMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00, // Sarı
            transparent: true,
            opacity: 0.9
        });

        const brightFlame = new THREE.Mesh(brightFlameGeometry, brightFlameMaterial);
        brightFlame.position.set(positionX, positionY - 0.5, positionZ);
        brightFlame.rotation.x = Math.PI;
        this.scene.add(brightFlame);

        // Sarı alev animasyonu - tam aşağı doğru
        const brightRandomScale = 1.5 + Math.random() * 0.2; // Daha küçük
        gsap.to(brightFlame.scale, {
            y: brightRandomScale,
            duration: 0.2,
            ease: 'power3.out'
        });

        gsap.to(brightFlameMaterial, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.scene.remove(brightFlame);
                brightFlame.geometry.dispose();
                brightFlameMaterial.dispose();
            }
        });

        // İç merkezdeki parlak beyaz alev - çok daha dar
        const coreFlameGeometry = new THREE.ConeGeometry(0.1, 6, 16); // Daha küçük
        const coreFlameMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // Saf beyaz
            transparent: true,
            opacity: 0.9
        });

        const coreFlame = new THREE.Mesh(coreFlameGeometry, coreFlameMaterial);
        coreFlame.position.set(positionX, positionY - 0.5, positionZ);
        coreFlame.rotation.x = Math.PI;
        this.scene.add(coreFlame);

        // Merkez alev animasyonu - tam aşağı doğru
        const coreRandomScale = 1.6 + Math.random() * 0.2; // Daha küçük
        gsap.to(coreFlame.scale, {
            y: coreRandomScale,
            duration: 0.2,
            ease: 'power2.out'
        });

        gsap.to(coreFlameMaterial, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.scene.remove(coreFlame);
                coreFlame.geometry.dispose();
                coreFlameMaterial.dispose();
            }
        });

        // Daha az kıvılcım - roketin tam altında
        for (let i = 0; i < 3; i++) { // Daha az sayıda
            const sparkSize = 0.03 + Math.random() * 0.05; // Çok daha küçük
            const sparkGeometry = new THREE.SphereGeometry(sparkSize, 8, 8);
            const sparkMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xffaa00 : 0xff5500,
                transparent: true,
                opacity: 0.8
            });

            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);

            // Roketin tam altında konumlandır - çok az yayılma
            spark.position.set(
                positionX + (Math.random() - 0.5) * 0.25, // Daha dar yayılım 
                positionY - 1 - Math.random() * 1, // Daha az aşağı
                positionZ + (Math.random() - 0.5) * 0.25 // Daha dar yayılım
            );

            this.scene.add(spark);

            // Kıvılcım animasyonu - daha az yayılım
            gsap.to(spark.position, {
                y: spark.position.y - 0.4 - Math.random() * 0.5, // Daha az hareket
                x: spark.position.x + (Math.random() - 0.5) * 0.2, // Daha az yayılım
                z: spark.position.z + (Math.random() - 0.5) * 0.2, // Daha az yayılım
                duration: 0.2 + Math.random() * 0.2,
                ease: 'power1.out'
            });

            gsap.to(sparkMaterial, {
                opacity: 0,
                duration: 0.2 + Math.random() * 0.2,
                onComplete: () => {
                    this.scene.remove(spark);
                    spark.geometry.dispose();
                    sparkMaterial.dispose();
                }
            });
        }
    }
}