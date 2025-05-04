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
        
        // Modeli daha küçük boyutlandır
        this.model.base.scale.set(1.0, 1.0, 1.0)
        this.model.base.position.x = this.x
        this.model.base.position.y = this.y
        this.model.base.position.z = 0.6
        
        // Modeli çevir (düzeltme gerekebilir)
        this.model.base.rotation.x = 0 
        this.model.base.rotation.y = 0
        this.model.base.rotation.z = 0
        
        // Roket materyallerini atama
        this.model.base.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                console.log("Roket mesh adı:", child.name)
                
                // İsme göre materyal atama
                if(child.name.includes("shadeGray")) {
                    child.material = this.materials.items.gray;
                }
                else if(child.name.includes("shadeWhite")) {
                    child.material = this.materials.items.white;
                }
                else if(child.name.includes("shadeRed")) {
                    child.material = this.materials.items.red;
                }
                else {
                    // Eğer bilinen bir isim yoksa varsayılan materyal
                    child.material = this.materials.items.white;
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
            count: 200, // Daha fazla parçacık
            particles: [],
            container: new THREE.Object3D()
        }
        
        // Farklı türde ateş parçacıkları için geometriler - boyutları küçültüldü
        const coreGeometry = new THREE.ConeGeometry(0.25, 0.8, 8); // 0.4, 1.2'den küçültüldü
        const flameGeometry = new THREE.ConeGeometry(0.15, 0.6, 8); // 0.2, 0.8'den küçültüldü
        const sparkGeometry = new THREE.SphereGeometry(0.05, 8, 8); // 0.08'den küçültüldü
        
        // Ateş renkleri - daha canlı
        const coreColor = new THREE.Color(0xFFFFFF); // Beyaz merkez
        const innerFlameColor = new THREE.Color(0xFFF636); // Sarı iç alev
        const outerFlameColor = new THREE.Color(0xFF4500); // Kırmızı-turuncu dış alev
        const sparkColor = new THREE.Color(0xFF9E45); // Kıvılcımlar
        
        // Materyal özelliklerini ayarla - Glow efekti
        const flameCoreMaterial = new THREE.MeshBasicMaterial({ 
            color: coreColor,
            transparent: true,
            opacity: 0.9
        });
        
        const innerFlameMaterial = new THREE.MeshBasicMaterial({ 
            color: innerFlameColor,
            transparent: true,
            opacity: 0.8
        });
        
        const outerFlameMaterial = new THREE.MeshBasicMaterial({ 
            color: outerFlameColor, 
            transparent: true,
            opacity: 0.6
        });
        
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: sparkColor,
            transparent: true,
            opacity: 0.7
        });
        
        // Parçacıkları oluştur - 3 farklı katman
        // 1. Merkez parçacıklar (çekirdek)
        const coreCount = Math.floor(this.fireParticles.count * 0.2);
        for(let i = 0; i < coreCount; i++) {
            const particle = {
                mesh: new THREE.Mesh(coreGeometry, flameCoreMaterial),
                speed: Math.random() * 0.15 + 0.2,
                offset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                scale: Math.random() * 0.3 + 0.5,
                type: 'core'
            }
            
            // Merkez parçacıklar roketin tam altında ve daha hızlı
            particle.mesh.position.set(0, 0, -0.1);
            particle.mesh.scale.set(particle.scale, particle.scale, particle.scale);
            
            // Alev konisini doğru yöne çevir
            particle.mesh.rotation.x = Math.PI; // Aşağı doğru baksın
            
            this.fireParticles.container.add(particle.mesh);
            this.fireParticles.particles.push(particle);
        }
        
        // 2. İç alev parçacıklar
        const innerFlameCount = Math.floor(this.fireParticles.count * 0.4);
        for(let i = 0; i < innerFlameCount; i++) {
            const particle = {
                mesh: new THREE.Mesh(flameGeometry, innerFlameMaterial),
                speed: Math.random() * 0.12 + 0.15,
                offset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                scale: Math.random() * 0.3 + 0.4,
                type: 'innerFlame'
            }
            
            // İç parçacıklar biraz dağınık
            particle.mesh.position.set(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                -0.2 - Math.random() * 0.2
            );
            particle.mesh.scale.set(particle.scale, particle.scale * 1.2, particle.scale);
            
            // Alev konisini doğru yöne çevir
            particle.mesh.rotation.x = Math.PI; // Aşağı doğru baksın
            
            this.fireParticles.container.add(particle.mesh);
            this.fireParticles.particles.push(particle);
        }
        
        // 3. Dış alev parçacıklar
        const outerFlameCount = Math.floor(this.fireParticles.count * 0.3);
        for(let i = 0; i < outerFlameCount; i++) {
            const particle = {
                mesh: new THREE.Mesh(flameGeometry, outerFlameMaterial),
                speed: Math.random() * 0.1 + 0.1,
                offset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                scale: Math.random() * 0.2 + 0.3,
                type: 'outerFlame'
            }
            
            // Dış parçacıklar daha fazla dağınık
            particle.mesh.position.set(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                -0.3 - Math.random() * 0.3
            );
            particle.mesh.scale.set(particle.scale, particle.scale * 1.5, particle.scale);
            
            // Alev konisini doğru yöne çevir
            particle.mesh.rotation.x = Math.PI; // Aşağı doğru baksın
            
            this.fireParticles.container.add(particle.mesh);
            this.fireParticles.particles.push(particle);
        }
        
        // 4. Kıvılcım parçacıklar
        const sparkCount = Math.floor(this.fireParticles.count * 0.1);
        for(let i = 0; i < sparkCount; i++) {
            const particle = {
                mesh: new THREE.Mesh(sparkGeometry, sparkMaterial),
                speed: Math.random() * 0.2 + 0.15,
                offset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                scale: Math.random() * 0.15 + 0.05,
                type: 'spark'
            }
            
            // Kıvılcımlar daha dağınık ve daha aşağıda
            particle.mesh.position.set(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                -0.3 - Math.random() * 0.5
            );
            particle.mesh.scale.set(particle.scale, particle.scale, particle.scale);
            
            this.fireParticles.container.add(particle.mesh);
            this.fireParticles.particles.push(particle);
        }
        
        // Ateş konteynerini roket altına konumlandır
        this.fireParticles.container.position.set(0, 0, 0.1);
        this.fireParticles.container.visible = false;
        this.model.base.add(this.fireParticles.container);
        
        // Animasyon güncelleme
        this.time.on('tick', () => {
            if(this.rocketFired) {
                this.updateFireEffect();
            }
        });
    }
    
    updateFireEffect() {
        // Her parçacık türü için farklı hareket
        for(const particle of this.fireParticles.particles) {
            // Parçacık tipine göre farklı davranış
            switch(particle.type) {
                case 'core':
                    // Merkez parçacıklar daha az hareket eder
                    particle.mesh.position.z -= particle.speed * 0.8;
                    
                    // Hafif X/Y dalgalanma
                    particle.mesh.position.x = Math.sin(this.time.elapsed * 0.01 + particle.offset) * 0.1;
                    particle.mesh.position.y = Math.cos(this.time.elapsed * 0.01 + particle.offset + Math.PI / 2) * 0.1;
                    
                    // Hafif döndürme
                    particle.mesh.rotation.z += particle.rotationSpeed;
                    
                    // Boyut pulslama (yanıp sönme)
                    const scalePulse = 0.1 * Math.sin(this.time.elapsed * 0.01 + particle.offset);
                    particle.mesh.scale.set(
                        particle.scale + scalePulse, 
                        particle.scale * 1.2 + scalePulse, 
                        particle.scale + scalePulse
                    );
                    
                    // Döngü - daha kısa döngü
                    if(particle.mesh.position.z < -1.2) {
                        particle.mesh.position.z = -0.1;
                    }
                    break;
                    
                case 'innerFlame':
                    // İç alevler biraz daha hareketli
                    particle.mesh.position.z -= particle.speed;
                    
                    // Orta seviye X/Y dalgalanma
                    particle.mesh.position.x += (Math.random() - 0.5) * 0.02;
                    particle.mesh.position.y += (Math.random() - 0.5) * 0.02;
                    
                    // Alev dönüşü
                    particle.mesh.rotation.z += particle.rotationSpeed;
                    
                    // Boyut değişimi - küçülme efekti
                    particle.mesh.scale.multiplyScalar(0.99);
                    
                    // Döngü - uzun döngü
                    if(particle.mesh.position.z < -1.8 || particle.mesh.scale.x < 0.2) {
                        particle.mesh.position.set(
                            (Math.random() - 0.5) * 0.3,
                            (Math.random() - 0.5) * 0.3,
                            -0.2
                        );
                        particle.mesh.scale.set(particle.scale, particle.scale * 1.2, particle.scale);
                    }
                    break;
                    
                case 'outerFlame':
                    // Dış alevler daha yavaş hareket eder
                    particle.mesh.position.z -= particle.speed * 0.8;
                    
                    // Daha fazla X/Y dalgalanma
                    particle.mesh.position.x += (Math.random() - 0.5) * 0.04;
                    particle.mesh.position.y += (Math.random() - 0.5) * 0.04;
                    
                    // Dönüş
                    particle.mesh.rotation.z += particle.rotationSpeed;
                    particle.mesh.rotation.y += particle.rotationSpeed * 0.5;
                    
                    // Boyut değişimi - küçülme efekti
                    particle.mesh.scale.multiplyScalar(0.985);
                    
                    // Döngü - kısa döngü
                    if(particle.mesh.position.z < -2.0 || particle.mesh.scale.x < 0.1) {
                        particle.mesh.position.set(
                            (Math.random() - 0.5) * 0.5,
                            (Math.random() - 0.5) * 0.5,
                            -0.3
                        );
                        particle.mesh.scale.set(particle.scale, particle.scale * 1.5, particle.scale);
                    }
                    break;
                    
                case 'spark':
                    // Kıvılcımlar hızlı ve rastgele hareket eder
                    particle.mesh.position.z -= particle.speed * 1.5;
                    
                    // Daha fazla X/Y dalgalanma
                    particle.mesh.position.x += (Math.random() - 0.5) * 0.08;
                    particle.mesh.position.y += (Math.random() - 0.5) * 0.08;
                    
                    // Boyut değişimi - küçülme efekti
                    particle.mesh.scale.multiplyScalar(0.97);
                    
                    // Döngü - uzun döngü
                    if(particle.mesh.position.z < -3.0 || particle.mesh.scale.x < 0.02) {
                        particle.mesh.position.set(
                            (Math.random() - 0.5) * 0.6,
                            (Math.random() - 0.5) * 0.6,
                            -0.5
                        );
                        particle.mesh.scale.set(particle.scale, particle.scale, particle.scale);
                    }
                    break;
            }
            
            // Transparanlık değişimi - uzaklaştıkça saydamlaşma
            if(particle.mesh.material.opacity) {
                // Z pozisyonuna göre saydamlık değişimi
                const distanceFromSource = Math.abs(particle.mesh.position.z + 0.1);
                
                // Parçacık tipine göre farklı saydamlık değişimi
                if(particle.type === 'core') {
                    particle.mesh.material.opacity = Math.max(0.3, 0.9 - distanceFromSource * 0.4);
                } else if(particle.type === 'innerFlame') {
                    particle.mesh.material.opacity = Math.max(0.2, 0.8 - distanceFromSource * 0.3);
                } else if(particle.type === 'outerFlame') {
                    particle.mesh.material.opacity = Math.max(0.1, 0.6 - distanceFromSource * 0.25);
                } else if(particle.type === 'spark') {
                    particle.mesh.material.opacity = Math.max(0.1, 0.7 - distanceFromSource * 0.2);
                }
            }
        }
    }

    createLaunchButton() {
        // Fırlatma butonu
        this.launchButton = {}
        
        // Buton konumu - roketin önünde ve daha yakın
        const buttonX = this.x;
        const buttonY = this.y - 2; // 3'ten 2'ye düşürüldü - rokete daha yakın
        
        // Butonu oluştur - daha küçük boyutlarda
        this.launchButton = this.createButton('Roketi Fırlat', buttonX, buttonY, '#FF4500', 'launchRocket');
        
        // Buton etkileşimini ayarla
        this.launchButton.triggerArea.on('interact', () => {
            this.launchRocket();
        });
        
        // Hover efekti
        this.launchButton.triggerArea.on('in', () => {
            // Buton için hover - yukarı kaldırma efekti
            gsap.to(this.launchButton.label.mesh.position, {
                z: 0.2, // 0.25'ten 0.2'ye küçültüldü
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
                    z: 0.22, // 0.26'dan 0.22'ye küçültüldü
                    duration: 0.3,
                    ease: 'back.out'
                });
            }
        });
        
        this.launchButton.triggerArea.on('out', () => {
            // Hover bitince normale döndür
            gsap.to(this.launchButton.label.mesh.position, {
                z: 0.12, // 0.15'ten 0.12'ye küçültüldü
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
                    z: 0.13, // 0.16'dan 0.13'e küçültüldü
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
        button.label.size = 2.5  // 3.0'dan 2.5'e küçültüldü
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
        
        // Kamera sarsıntısı efekti - küçültüldü
        if(this.camera) {
            // Kamera titreşimi efekti
            let strength = 0.1; // 0.15'ten 0.1'e küçültüldü
            let count = 0;
            
            // Kamera titreten animasyon
            const shakeAnimation = () => {
                if(count < 15) { // 20'den 15'e küçültüldü
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
        
        // Roketi yavaşça kaldır - değerler küçültüldü
        gsap.to(this.model.base.position, {
            z: 0.8, // 1'den 0.8'e küçültüldü
            duration: 1.2, // 1.5'ten 1.2'ye küçültüldü
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
                
                // Sonra hızlanarak yükselsin - yükseklik değeri küçültüldü
                gsap.to(this.model.base.position, {
                    z: 20, // 30'dan 20'ye küçültüldü
                    duration: 2.5, // 3'ten 2.5'e küçültüldü
                    ease: 'power2.in',
                    onComplete: () => {
                        // Son aşama sesi
                        if(this.sounds) {
                            this.sounds.play('brick', 5);
                        }
                        
                        this.rocketLaunched = true;
                        // 4 saniye sonra roketi sıfırla - 5'ten 4'e düşürüldü
                        setTimeout(() => this.resetRocket(), 4000);
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