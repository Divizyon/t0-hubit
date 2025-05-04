import * as THREE from 'three'
import CANNON from 'cannon'
import gsap from 'gsap'

export default class RocketSection {
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
        
        // Kamera referansını doğrudan options'tan alıyoruz
        this.camera = _options.camera
        
        // Sesleri ekleyelim
        this.sounds = _options.sounds

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // Roket için ayarlar
        this.rocketFired = false;
        this.rocketLaunched = false;
        
        // Model ve buton oluşturma
        this.setModel()
        this.createLaunchButton()
        
        // Debug kontrolü ekle
        if(this.debug) {
            const folder = this.debug.addFolder('rocket')
            folder.add(this.model.base.position, 'x').step(0.1).min(-20).max(20).name('positionX')
            folder.add(this.model.base.position, 'y').step(0.1).min(-20).max(20).name('positionY')
            folder.add(this.model.base.position, 'z').step(0.1).min(-10).max(10).name('positionZ')
            folder.add(this.model.base.rotation, 'x').step(0.1).min(-Math.PI).max(Math.PI).name('rotationX')
            folder.add(this.model.base.rotation, 'y').step(0.1).min(-Math.PI).max(Math.PI).name('rotationY')
            folder.add(this.model.base.rotation, 'z').step(0.1).min(-Math.PI).max(Math.PI).name('rotationZ')
            folder.add(this.model.base.scale, 'x').step(0.1).min(0.1).max(10).name('scaleX').onChange((value) => {
                this.model.base.scale.y = value
                this.model.base.scale.z = value
            })
            folder.add(this, 'launchRocket').name('Launch Rocket')
        }
    }
    
    setModel() {
        // Model
        this.model = {}
        
        // Base model - GLB dosyasını yükleme
        this.model.base = this.resources.items.rocketBase.scene.clone()
        
        // Modeli daha büyük ölçekte yeniden boyutlandır
        this.model.base.scale.set(1.5, 1.5, 1.5)
        this.model.base.position.x = this.x
        this.model.base.position.y = this.y
        this.model.base.position.z = 0.8
        
        // Modeli çevir (düzeltme gerekebilir)
        this.model.base.rotation.x = 0 
        this.model.base.rotation.y = 0
        this.model.base.rotation.z = 0
        
        // Roket materyallerini atama
        this.model.base.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                console.log("Roket mesh adı:", child.name)
                
                // Materyal atama
                if(child.material) {
                    // Materyalleri kopyala ve atama
                    if(this.materials.items.matcapRedTexture) {
                        child.material = new THREE.MeshMatcapMaterial({
                            matcap: this.materials.items.matcapRedTexture,
                            transparent: false
                        })
                    }
                }
            }
        })
        
        // Roket altında ateş efekti için parçacık sistemi oluştur
        this.createFireEffect()
        
        // Modeli ekle
        this.container.add(this.model.base)
    }
    
    createFireEffect() {
        // Ateş efekti için parçacık sistemi
        this.fireParticles = {
            count: 150,
            particles: [],
            container: new THREE.Object3D()
        }
        
        // Parçacık geometrisi - 0.8 çok büyük, daha küçük yapalım
        const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8) // 0.8'den 0.3'e düşürdüm
        
        // Ateş materyalleri - sarı ve kırmızı
        const fireYellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const fireRedMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 })
        
        // Parçacıkları oluştur
        for(let i = 0; i < this.fireParticles.count; i++) {
            const particle = {
                mesh: new THREE.Mesh(
                    particleGeometry, 
                    i % 2 === 0 ? fireYellowMaterial : fireRedMaterial
                ),
                speed: Math.random() * 0.1 + 0.05,
                offset: Math.random() * Math.PI * 2
            }
            
            // Parçacık başlangıç pozisyonu - zemin üzerinde başlasın
            particle.mesh.position.set(0, 0, -0.5) // z ekseninde 0'dan başlamasın, -0.5'ten başlasın
            
            // Konteyner'a ekle
            this.fireParticles.container.add(particle.mesh)
            
            // Diziyi kaydet
            this.fireParticles.particles.push(particle)
        }
        
        // Ateş konteynerini roket altına konumlandır - zeminin üzerinde olacak şekilde
        this.fireParticles.container.position.set(0, 0, 0.5) // -0.8'den 0.5'e değiştirdim
        this.fireParticles.container.visible = false
        this.model.base.add(this.fireParticles.container)
        
        // Animasyon güncelleme
        this.time.on('tick', () => {
            if(this.rocketFired) {
                this.updateFireEffect()
            }
        })
    }
    
    updateFireEffect() {
        // Ateş parçacıklarını güncelle
        for(const particle of this.fireParticles.particles) {
            // Aşağı doğru hareket - zemin üzerinde kalması için daha az hareket
            particle.mesh.position.z -= particle.speed * 1.5
            
            // Rastgele X/Y hareketi
            particle.mesh.position.x = Math.sin(this.time.elapsed * 0.01 + particle.offset) * 0.2
            particle.mesh.position.y = Math.cos(this.time.elapsed * 0.01 + particle.offset + Math.PI / 2) * 0.2
            
            // Sınır kontrolü - döngüsel animasyon - gözüken kısmı zemin üzerinde tutmak için
            if(particle.mesh.position.z < -2.5) { // -3'ten -2.5'e değiştirdim
                particle.mesh.position.z = -0.5 // 0'dan -0.5'e değiştirdim - hafif yukarıdan başlasın
            }
        }
    }

    createLaunchButton() {
        // Fırlatma butonu
        this.launchButton = {}
        
        // Buton konumu - roketin önünde
        const buttonX = this.x;
        const buttonY = this.y - 3; 
        
        // Butonu oluştur
        this.launchButton = this.createButton('Roketi Fırlat', buttonX, buttonY, '#FF4500', 'launchRocket');
        
        // Buton etkileşimini ayarla
        this.launchButton.triggerArea.on('interact', () => {
            this.launchRocket();
        });
        
        // Hover efekti
        this.launchButton.triggerArea.on('in', () => {
            // Buton için hover - yukarı kaldırma efekti
            gsap.to(this.launchButton.label.mesh.position, {
                z: 0.25, // Biraz daha yukarı kaldır
                duration: 0.3,
                ease: 'back.out'
            });
            
            // Opaklığı artır
            gsap.to(this.launchButton.label.material, {
                opacity: 1,
                duration: 0.3
            });
            
            // Enter ikonunu da yukarı kaldır
            if(this.launchButton.enter && this.launchButton.enter.mesh) {
                gsap.to(this.launchButton.enter.mesh.position, {
                    z: 0.26, // Label'dan biraz daha yüksek
                    duration: 0.3,
                    ease: 'back.out'
                });
            }
        });
        
        this.launchButton.triggerArea.on('out', () => {
            // Hover bitince normale döndür
            gsap.to(this.launchButton.label.mesh.position, {
                z: 0.15, // Normal yükseklik
                duration: 0.3,
                ease: 'back.in'
            });
            
            gsap.to(this.launchButton.label.material, {
                opacity: 0.7,
                duration: 0.3
            });
            
            // Enter ikonu da normale dönsün
            if(this.launchButton.enter && this.launchButton.enter.mesh) {
                gsap.to(this.launchButton.enter.mesh.position, {
                    z: 0.16, // Normal yükseklik
                    duration: 0.3,
                    ease: 'back.in'
                });
            }
        });
    }
    
    createButton(text, offsetX, offsetY, color, type) {
        const button = {}
        
        // Buton konumu
        button.position = new THREE.Vector3(
            offsetX,
            offsetY,
            0.01 
        )
        
        // Buton konteyneri
        button.container = new THREE.Object3D()
        button.container.position.copy(button.position)
        this.container.add(button.container)
        
        // Label
        button.label = {}
        button.label.size = 3.0  // Boyut
        button.label.geometry = new THREE.PlaneGeometry(button.label.size, button.label.size / 2.5, 1, 1)
        
        // Buton texture'ını oluştur
        button.label.texture = this.createButtonTexture(text, color);
        
        // Materyal oluştur
        button.label.material = new THREE.MeshBasicMaterial({ 
            map: button.label.texture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false
        })
        
        // Mesh oluştur - Zemin üzerinde yatay konumlandır
        button.label.mesh = new THREE.Mesh(button.label.geometry, button.label.material)
        button.label.mesh.rotation.x = -Math.PI * 0.5 // 90 derece çevir - zemine yatay
        button.label.mesh.position.z = 0.15 // Zemin üzerinde daha yüksekte
        button.label.mesh.matrixAutoUpdate = false
        button.label.mesh.updateMatrix()
        
        // Konteynere ekle
        button.container.add(button.label.mesh)
        
        // Enter texture ekle (varsa)
        if (this.resources.items.areaKeyEnterTexture) {
            // Enter ikonu ekle
            button.enter = {};
            button.enter.size = 0.8; // Enter ikonu
            button.enter.geometry = new THREE.PlaneGeometry(button.enter.size, button.enter.size, 1, 1);
            
            button.enter.texture = this.resources.items.areaKeyEnterTexture;
            button.enter.texture.magFilter = THREE.LinearFilter;
            button.enter.texture.minFilter = THREE.LinearFilter;
            
            button.enter.material = new THREE.MeshBasicMaterial({
                map: button.enter.texture,
                transparent: true,
                opacity: 0.9,
                depthWrite: false
            });
            
            button.enter.mesh = new THREE.Mesh(button.enter.geometry, button.enter.material);
            button.enter.mesh.rotation.x = -Math.PI * 0.5; // Zemine yatay
            button.enter.mesh.position.x = button.label.size * 0.35; // Sağ tarafta
            button.enter.mesh.position.z = 0.16; // Yazıdan biraz daha yüksekte
            button.enter.mesh.matrixAutoUpdate = false;
            button.enter.mesh.updateMatrix();
            
            button.container.add(button.enter.mesh);
        }
        
        // Trigger alanı oluştur - invisible
        button.triggerArea = this.areas.add({
            position: new THREE.Vector2(button.position.x, button.position.y),
            halfExtents: new THREE.Vector2(1.5, 1.0), // Buton boyutuna uygun tetikleme alanı
            hasKey: true,
            testCar: true, // Arabayı test et
            active: true
        })
        
        // Buton bilgilerini sakla
        button.name = text
        button.color = color
        button.type = type
        
        return button
    }
    
    createButtonTexture(text, color) {
        // Yazı texturesi oluştur
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 600
        canvas.height = 240
        
        // Zemin çiz - kenarları yuvarlak dikdörtgen
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(25, 0);
        context.lineTo(canvas.width - 25, 0);
        context.quadraticCurveTo(canvas.width, 0, canvas.width, 25);
        context.lineTo(canvas.width, canvas.height - 25);
        context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - 25, canvas.height);
        context.lineTo(25, canvas.height);
        context.quadraticCurveTo(0, canvas.height, 0, canvas.height - 25);
        context.lineTo(0, 25);
        context.quadraticCurveTo(0, 0, 25, 0);
        context.closePath();
        context.fill();
        
        // Kenar çizgisi ekle
        context.strokeStyle = '#ffffff';
        context.lineWidth = 4;
        context.stroke();
        
        // Enter ikonunu ekle (sağ tarafta küçük bir ikon)
        const enterIconSize = 50;
        const enterIconX = canvas.width - enterIconSize - 20;
        const enterIconY = (canvas.height - enterIconSize) / 2;
        
        // Enter tuşu ikonu çiz
        context.fillStyle = '#ffffff';
        context.fillRect(enterIconX, enterIconY, enterIconSize * 0.8, enterIconSize);
        context.fillRect(enterIconX + enterIconSize * 0.6, enterIconY + enterIconSize * 0.3, enterIconSize * 0.4, enterIconSize * 0.4);
        
        // Enter ok işareti
        context.beginPath();
        context.moveTo(enterIconX + enterIconSize * 0.6, enterIconY + enterIconSize * 0.5);
        context.lineTo(enterIconX + enterIconSize * 0.8, enterIconY + enterIconSize * 0.7);
        context.lineTo(enterIconX + enterIconSize * 0.6, enterIconY + enterIconSize * 0.9);
        context.closePath();
        context.fill();
        
        // "ENTER" yazısı
        context.font = 'bold 28px Arial';
        context.textAlign = 'right';
        context.fillText('ENTER', enterIconX - 10, enterIconY + enterIconSize / 2 + 10);
        
        // Ana konum yazısı
        context.font = 'bold 90px Arial'
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillStyle = '#ffffff'
        context.fillText(text, 30, canvas.height / 2)
        
        // Gölge efekti
        context.shadowColor = 'rgba(0, 0, 0, 0.3)'
        context.shadowBlur = 10
        context.shadowOffsetX = 5
        context.shadowOffsetY = 5
        
        // Texture oluştur
        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        
        return texture
    }
    
    launchRocket() {
        // Eğer roket zaten fırlatılmışsa bir şey yapma
        if(this.rocketLaunched) return;
        
        console.log('Roket fırlatılıyor!');
        
        // Ateşi görünür yap
        this.fireParticles.container.visible = true;
        this.rocketFired = true;
        
        // Roket fırlatma sesi - yeni eklediğimiz sesi kullan
        if(this.sounds) {
            this.sounds.play('rocketLaunch');
        } else {
            // Alternatif ses kaynakları
            if(this.resources.items.carHornSound) {
                const sound = this.resources.items.carHornSound.play();
                if(sound) {
                    sound.volume = 1.0;
                    sound.rate = 0.5;
                }
            } else if(this.resources.items.hitSound) {
                const sound = this.resources.items.hitSound.play();
                if(sound) {
                    sound.volume = 1.0;
                }
            }
        }
        
        // Kamera sarsıntısı efekti daha güçlü
        if(this.camera) {
            // Kamera titreşimi efekti
            let strength = 0.15;
            let count = 0;
            
            // Kamera titreten animasyon
            const shakeAnimation = () => {
                if(count < 20) {
                    this.camera.instance.position.x += (Math.random() - 0.5) * strength;
                    this.camera.instance.position.y += (Math.random() - 0.5) * strength;
                    
                    count++;
                    requestAnimationFrame(shakeAnimation);
                } else {
                    // Kamera pozisyonunu normale döndür
                    gsap.to(this.camera.instance.position, {
                        x: this.camera.instance.position.x - (Math.random() - 0.5) * strength,
                        y: this.camera.instance.position.y - (Math.random() - 0.5) * strength,
                        duration: 0.5
                    });
                }
            };
            
            shakeAnimation();
        }
        
        // Roketi yavaşça kaldır
        gsap.to(this.model.base.position, {
            z: 1, // Önce biraz kaldır
            duration: 1.5,
            ease: 'power1.in',
            onComplete: () => {
                // İkinci aşama sesi burada çalsın
                if(this.sounds) {
                    this.sounds.play('horn');
                } else if(this.resources.items.brickHitSound) {
                    const sound = this.resources.items.brickHitSound.play();
                    if(sound) {
                        sound.volume = 1.0;
                        sound.rate = 0.7;
                    }
                }
                
                // Sonra hızlanarak yükselsin
                gsap.to(this.model.base.position, {
                    z: 30, // Gökyüzüne doğru
                    duration: 3,
                    ease: 'power2.in',
                    onComplete: () => {
                        // Son aşama sesi
                        if(this.sounds) {
                            this.sounds.play('brick', 5);
                        }
                        
                        this.rocketLaunched = true;
                        // 5 saniye sonra roketi sıfırla
                        setTimeout(() => this.resetRocket(), 5000);
                    }
                });
            }
        });
    }
    
    resetRocket() {
        // Roket ateşini kapat
        this.fireParticles.container.visible = false;
        this.rocketFired = false;
        
        // Roketi başlangıç pozisyonuna getir
        gsap.to(this.model.base.position, {
            x: this.x,
            y: this.y, 
            z: 0,
            duration: 0.5
        });
        
        // Roketin fırlatılmış olma durumunu sıfırla
        this.rocketLaunched = false;
        
        console.log('Roket sıfırlandı');
    }
} 