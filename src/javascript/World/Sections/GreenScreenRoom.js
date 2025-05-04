import * as THREE from 'three'
import CANNON from 'cannon'
import gsap from 'gsap'

export default class GreenScreenRoom {
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

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setModel()
        this.createButtons()
        
        // Debug kontrolü ekle
        if(this.debug) {
            const folder = this.debug.addFolder('greenScreen')
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
        }
    }
    
    setModel() {
        // Model
        this.model = {}
        
        // Base model - GLB dosyasını yükleme
        this.model.base = this.resources.items.greenScreenRoomBase.scene.clone()
        
        // Modeli 0.8 ölçeğinde yeniden boyutlandır (biraz daha büyük)
        this.model.base.scale.set(0.8, 0.8, 0.8)  // 0.6'dan 0.8'e çıkarttım
        this.model.base.position.x = this.x
        this.model.base.position.y = this.y
        this.model.base.position.z = 0
        
        // Modeli çevir (düzeltme gerekebilir)
        this.model.base.rotation.x = 0 
        this.model.base.rotation.y = 0  // Düz duruş
        this.model.base.rotation.z = 0
        
        // GLTF'ye göre materyaller
        this.model.base.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                console.log("Mesh adı:", child.name)
                
                // Gerekli materyalleri atama
                if(child.name === 'shadeWhite' || child.name === 'Cube.001') {
                    console.log("Beyaz materyal atanıyor")
                    child.material = this.materials.items.hubitWhite || this.materials.shades.items.white
                }
                
                if(child.name === 'pureUc' || child.name === 'Cube.002') {
                    console.log("Yeşil materyal atanıyor")
                    child.material = this.materials.items.hubitGreen
                }
                
                if(child.name === 'shadeBlack' || child.name === 'Cube.003') {
                    console.log("Siyah materyal atanıyor")
                    child.material = this.materials.items.hubitBlack || this.materials.shades.items.black
                }
            }
        })
        
        // Modeli ekle
        this.container.add(this.model.base)
    }

    createButtons() {
        // Texture butonlarını hazırla - Zemin üzerinde olacak şekilde
        this.locationButtons = {}
        
        // Butonları zeminde konumlandır (yeşil ekranın ÖNÜNDEKİ boş alanda)
        const buttonY = this.y - 6; // Yeşil ekranın daha da uzağında
        
        // Çöl butonu (sol)
        this.locationButtons.desert = this.createLocationButton('Çöl', -4, buttonY, '#daa520', 'desert');
        
        // Sivas butonu (orta)
        this.locationButtons.sivas = this.createLocationButton('Sivas', 0, buttonY - 1, '#4169e1', 'sivas'); // Biraz daha öne
        
        // New York butonu (sağ)
        this.locationButtons.newYork = this.createLocationButton('New York', 4, buttonY, '#2e8b57', 'newYork');
        
        // Buton etkileşimlerini ayarla
        this.setupLocationButtonInteractions();
    }
    
    createLocationButton(locationName, offsetX, offsetY, color, type) {
        const button = {}
        
        // Buton konumu ve boyutu - Zemin üzerinde
        button.position = new THREE.Vector3(
            this.x + offsetX,
            offsetY,
            0.01 // Zemin üzerinde çok az yükseklik (z-fighting önlemek için)
        )
        
        // Buton konteyneri
        button.container = new THREE.Object3D()
        button.container.position.copy(button.position)
        this.container.add(button.container)
        
        // Label - Zemine oturacak şekilde
        button.label = {}
        button.label.size = 3.2  // Çok daha büyük boyut
        button.label.geometry = new THREE.PlaneGeometry(button.label.size, button.label.size / 2.5, 1, 1)
        
        // Hazır texture'ları kullanmaya çalış
        const textureName = `greenScreen${type.charAt(0).toUpperCase() + type.slice(1)}ButtonTexture`;
        
        if (this.resources.items[textureName]) {
            // Eğer hazır texture varsa onu kullan
            button.label.texture = this.resources.items[textureName];
            button.label.texture.magFilter = THREE.LinearFilter;
            button.label.texture.minFilter = THREE.LinearFilter;
        } else {
            // Yoksa canvas ile oluştur
            button.label.texture = this.createButtonTexture(locationName, color);
        }
        
        // Materyal oluştur
        button.label.material = new THREE.MeshBasicMaterial({ 
            map: button.label.texture,
            transparent: true,
            opacity: 0.95,
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
        
        // Enter texture ekle
        if (this.resources.items.greenScreenEnterKeyTexture) {
            // Enter ikonu ekle
            button.enter = {};
            button.enter.size = 0.8; // Daha büyük enter ikonu
            button.enter.geometry = new THREE.PlaneGeometry(button.enter.size, button.enter.size, 1, 1);
            
            button.enter.texture = this.resources.items.greenScreenEnterKeyTexture;
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
        } else if (this.resources.items.areaKeyEnterTexture) {
            // Area keyEnter texture'ını kullan
            button.enter = {};
            button.enter.size = 0.8; // Daha büyük enter ikonu
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
            halfExtents: new THREE.Vector2(1.8, 1.0), // Daha geniş tetikleme alanı
            hasKey: true,
            testCar: true, // Arabayı test et
            active: true
        })
        
        // Buton bilgilerini sakla
        button.name = locationName
        button.color = color
        button.type = type
        
        return button
    }
    
    createButtonTexture(locationName, color) {
        // Yazı texturesi oluştur
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 800
        canvas.height = 320
        
        // Zemin çiz - kenarları yuvarlak dikdörtgen
        this.drawRoundRectFill(context, 0, 0, canvas.width, canvas.height, 25, color);
        
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
        context.font = 'bold 36px Arial';
        context.textAlign = 'right';
        context.fillText('ENTER', enterIconX - 10, enterIconY + enterIconSize / 2 + 10);
        
        // Ana konum yazısı
        context.font = 'bold 100px Arial'
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillStyle = '#ffffff'
        context.fillText(locationName, 30, canvas.height / 2)
        
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
    
    drawRoundRectFill(ctx, x, y, width, height, radius, fillColor) {
        // Gradient oluştur
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, this.adjustColor(fillColor, -50));
        
        ctx.fillStyle = gradient;
        
        // Yuvarlak köşeli dikdörtgen çiz
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        // Kenar çizgisi ekle - parlak
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Üst tarafta parlak vurgu
        const highlightGradient = ctx.createLinearGradient(0, y, 0, y + height * 0.3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y + 2); // İç kenara doğru 2px
        ctx.lineTo(x + width - radius, y + 2);
        ctx.quadraticCurveTo(x + width - 2, y + 2, x + width - 2, y + radius);
        ctx.lineTo(x + width - 2, y + height * 0.3);
        ctx.lineTo(x + 2, y + height * 0.3);
        ctx.lineTo(x + 2, y + radius);
        ctx.quadraticCurveTo(x + 2, y + 2, x + radius, y + 2);
        ctx.closePath();
        ctx.fill();
    }
    
    adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }
    
    setupLocationButtonInteractions() {
        // Çöl butonu etkileşimi
        this.locationButtons.desert.triggerArea.on('interact', () => {
            this.highlightActiveButton(this.locationButtons.desert);
            this.spawnCarInGreenScreen('desert');
        });
        
        // Sivas butonu etkileşimi
        this.locationButtons.sivas.triggerArea.on('interact', () => {
            this.highlightActiveButton(this.locationButtons.sivas);
            this.spawnCarInGreenScreen('sivas');
        });
        
        // New York butonu etkileşimi
        this.locationButtons.newYork.triggerArea.on('interact', () => {
            this.highlightActiveButton(this.locationButtons.newYork);
            this.spawnCarInGreenScreen('newYork');
        });
        
        // Hover efektleri
        const buttons = [this.locationButtons.desert, this.locationButtons.sivas, this.locationButtons.newYork];
        
        for (const button of buttons) {
            button.triggerArea.on('in', () => {
                // Zemin için hover - yukarı kaldırma efekti
                gsap.to(button.label.mesh.position, {
                    z: 0.25, // Biraz daha yukarı kaldır
                    duration: 0.3,
                    ease: 'back.out'
                });
                
                // Opaklığı artır
                gsap.to(button.label.material, {
                    opacity: 1,
                    duration: 0.3
                });
                
                // Enter ikonunu da yukarı kaldır
                if(button.enter && button.enter.mesh) {
                    gsap.to(button.enter.mesh.position, {
                        z: 0.26, // Label'dan biraz daha yüksek
                        duration: 0.3,
                        ease: 'back.out'
                    });
                }
            });
            
            button.triggerArea.on('out', () => {
                // Hover bitince normale döndür
                gsap.to(button.label.mesh.position, {
                    z: 0.15, // Normal yükseklik
                    duration: 0.3,
                    ease: 'back.in'
                });
                
                gsap.to(button.label.material, {
                    opacity: 0.95,
                    duration: 0.3
                });
                
                // Enter ikonu da normale dönsün
                if(button.enter && button.enter.mesh) {
                    gsap.to(button.enter.mesh.position, {
                        z: 0.16, // Normal yükseklik
                        duration: 0.3,
                        ease: 'back.in'
                    });
                }
            });
        }
    }
    
    highlightActiveButton(activeButton) {
        // Tüm butonları sönük yap
        const buttons = [this.locationButtons.desert, this.locationButtons.sivas, this.locationButtons.newYork];
        
        for (const button of buttons) {
            if (button !== activeButton) {
                gsap.to(button.label.material, {
                    opacity: 0.6,
                    duration: 0.3
                });
                
                gsap.to(button.label.mesh.position, {
                    z: 0.15,
                    duration: 0.3
                });
                
                if(button.enter && button.enter.mesh) {
                    gsap.to(button.enter.mesh.position, {
                        z: 0.16,
                        duration: 0.3
                    });
                    
                    gsap.to(button.enter.material, {
                        opacity: 0.6,
                        duration: 0.3
                    });
                }
            }
        }
        
        // Aktif butonu parlat
        gsap.to(activeButton.label.material, {
            opacity: 1,
            duration: 0.3
        });
        
        // Aktif butonu yukarı kaldır
        gsap.to(activeButton.label.mesh.position, {
            z: 0.35,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
        
        // Enter ikonunu da yukarı kaldır
        if(activeButton.enter && activeButton.enter.mesh) {
            gsap.to(activeButton.enter.mesh.position, {
                z: 0.36,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
            
            gsap.to(activeButton.enter.material, {
                opacity: 1,
                duration: 0.3
            });
        }
        
        // Basma efekti
        gsap.to(activeButton.label.mesh.position, {
            z: 0.25,
            duration: 0.1,
            delay: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
    }

    spawnCarInGreenScreen(location) {
        console.log(`Araba ${location} konumunda spawn edildi!`);
        
        // Eğer car bileşeni varsa
        if(this.areas.car && this.areas.car.physics) {
            // Önce aracın durumunu ve hızını sıfırla
            this.areas.car.physics.car.chassis.body.velocity.set(0, 0, 0);
            this.areas.car.physics.car.chassis.body.angularVelocity.set(0, 0, 0);
            
            // Yeşil ekranın tam ortasında konumlandır
            const centerOffsetX = 0; // Yatay merkez
            const centerOffsetY = 0; // Dikey merkez
            
            const spawnPosition = new CANNON.Vec3(
                this.x + centerOffsetX,  
                this.y + centerOffsetY,
                0.5 // Yerden yükseklik
            );
            
            // Aracın physics engine'deki pozisyonunu güncelle
            this.areas.car.physics.car.chassis.body.position.copy(spawnPosition);
            
            // Arabanın yönünü ayarla - kameraya dönük olacak
            const rotationAngle = this.getRotationForLocation(location);
            const rotation = new CANNON.Quaternion();
            rotation.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rotationAngle);
            this.areas.car.physics.car.chassis.body.quaternion.copy(rotation);
            
            // Aracın uykuda olmasını önle
            this.areas.car.physics.car.chassis.body.wakeUp();
            
            // Yeşil ekranın arka plan materyalini değiştir
            this.changeBackgroundByLocation(location);
            
            // Efektli geçiş için ışık efekti
            this.createSpawnEffect(spawnPosition);
        }
    }
    
    createSpawnEffect(position) {
        // Spawn efekti oluştur (basit bir ışık parlama efekti)
        if (this.spawnLight) {
            // Önceki ışık varsa temizle
            this.container.remove(this.spawnLight);
        }
        
        // Nokta ışık oluştur
        this.spawnLight = new THREE.PointLight(0xffffff, 3, 4);
        this.spawnLight.position.copy(position);
        this.spawnLight.position.z += 1; // Biraz yukarıda
        this.container.add(this.spawnLight);
        
        // Işık animasyonu
        gsap.to(this.spawnLight, {
            intensity: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => {
                this.container.remove(this.spawnLight);
                this.spawnLight = null;
            }
        });
    }
    
    getRotationForLocation(location) {
        // Her konum için araba kameraya dönük olacak şekilde ayarla
        // -Math.PI * 0.5 = 270 derece (kameraya bakar)
        return -Math.PI * 0.2; // Tüm konumlar için kameraya dönük
    }
    
    changeBackgroundByLocation(location) {
        // Yeşil ekran mesh'ini bul
        let greenScreenMesh = null;
        
        this.model.base.traverse((child) => {
            if(child instanceof THREE.Mesh && 
              (child.name === 'pureUc' || child.name === 'Cube.002')) {
                greenScreenMesh = child;
            }
        });
        
        if(!greenScreenMesh) {
            console.error('Yeşil ekran mesh bulunamadı!');
            return;
        }
        
        // Geçiş efekti - eski materyal üzerine alpha crossfade
        const oldMaterial = greenScreenMesh.material;
        const oldColor = oldMaterial.color ? oldMaterial.color.clone() : new THREE.Color(0x00ff00);
        
        // Lokasyona göre arka plan materyalini değiştir
        switch(location) {
            case 'desert':
                // Çöl temalı materyal - gradient ve doku ile
                if(this.materials.items.desertMaterial) {
                    // Varolan materyali kullan
                    this.animateMaterialChange(greenScreenMesh, this.materials.items.desertMaterial);
                } else {
                    // Yeni çöl materyali oluştur
                    const desertMaterial = new THREE.MeshBasicMaterial({ 
                        color: 0xe1c78f // Kum rengi
                    });
                    
                    // Doku ekle (sahte bir doku oluştur)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 512;
                    canvas.height = 512;
                    
                    // Gradyan arkaplan
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, '#f7e7ce'); // Açık kum rengi
                    gradient.addColorStop(0.7, '#d2b48c'); // Orta kum rengi
                    gradient.addColorStop(1, '#8b7355'); // Koyu kum rengi
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Kum deseni ekle
                    ctx.fillStyle = 'rgba(210, 180, 140, 0.3)';
                    for (let i = 0; i < 2000; i++) {
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * canvas.height;
                        const size = Math.random() * 2 + 1;
                        ctx.fillRect(x, y, size, size);
                    }
                    
                    // Uzakta dağlar çiz
                    ctx.fillStyle = '#8b7355';
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height * 0.4);
                    ctx.lineTo(canvas.width * 0.2, canvas.height * 0.3);
                    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.35);
                    ctx.lineTo(canvas.width * 0.5, canvas.height * 0.25);
                    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.35);
                    ctx.lineTo(canvas.width * 0.85, canvas.height * 0.3);
                    ctx.lineTo(canvas.width, canvas.height * 0.35);
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.lineTo(0, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Doku olarak kullan
                    const texture = new THREE.CanvasTexture(canvas);
                    desertMaterial.map = texture;
                    
                    // Animation ile geçiş
                    this.animateMaterialChange(greenScreenMesh, desertMaterial);
                    
                    // Materials sınıfında kullanmak için kaydedelim
                    if(this.materials.items) {
                        this.materials.items.desertMaterial = desertMaterial;
                    }
                }
                console.log('Çöl arka planı yüklendi');
                break;
                
            case 'sivas':
                // Sivas temalı materyal - kar ve karlı dağ görünümü
                if(this.materials.items.sivasMaterial) {
                    this.animateMaterialChange(greenScreenMesh, this.materials.items.sivasMaterial);
                } else {
                    // Yeni Sivas materyali oluştur
                    const sivasMaterial = new THREE.MeshBasicMaterial();
                    
                    // Doku ekle (sahte kar manzarası oluştur)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 512;
                    canvas.height = 512;
                    
                    // Mavi gökyüzü gradyanı
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
                    gradient.addColorStop(0, '#6495ed'); // Gök mavi
                    gradient.addColorStop(1, '#b0c4de'); // Açık mavi
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Karlı dağlar
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height * 0.5);
                    ctx.lineTo(canvas.width * 0.2, canvas.height * 0.3);
                    ctx.lineTo(canvas.width * 0.4, canvas.height * 0.4);
                    ctx.lineTo(canvas.width * 0.6, canvas.height * 0.25);
                    ctx.lineTo(canvas.width * 0.8, canvas.height * 0.35);
                    ctx.lineTo(canvas.width, canvas.height * 0.3);
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.lineTo(0, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Kar taneleri ekle
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    for (let i = 0; i < 100; i++) {
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * canvas.height * 0.6; // Sadece gökyüzünde
                        const size = Math.random() * 3 + 1;
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Doku olarak kullan
                    const texture = new THREE.CanvasTexture(canvas);
                    sivasMaterial.map = texture;
                    
                    // Animation ile geçiş
                    this.animateMaterialChange(greenScreenMesh, sivasMaterial);
                    
                    // Materials sınıfında kullanmak için kaydedelim
                    if(this.materials.items) {
                        this.materials.items.sivasMaterial = sivasMaterial;
                    }
                }
                console.log('Sivas arka planı yüklendi');
                break;
                
            case 'newYork':
                // New York temalı materyal - şehir silüeti
                if(this.materials.items.newYorkMaterial) {
                    this.animateMaterialChange(greenScreenMesh, this.materials.items.newYorkMaterial);
                } else {
                    // Yeni New York materyali oluştur
                    const newYorkMaterial = new THREE.MeshBasicMaterial();
                    
                    // Doku ekle (şehir silüeti oluştur)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 512;
                    canvas.height = 512;
                    
                    // Gece gökyüzü gradyanı
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, '#191970'); // Gece mavisi
                    gradient.addColorStop(0.7, '#483d8b'); // Koyu mor
                    gradient.addColorStop(1, '#000000'); // Siyah
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Yıldızlar ekle
                    ctx.fillStyle = '#ffffff';
                    for (let i = 0; i < 200; i++) {
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * canvas.height * 0.7;
                        const size = Math.random() * 1.5;
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Şehir silüeti çiz
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    
                    // Başlangıç noktası
                    ctx.moveTo(0, canvas.height * 0.8);
                    
                    // Binalar oluştur
                    for (let x = 0; x < canvas.width; x += 15) {
                        const buildingHeight = Math.random() * (canvas.height * 0.3) + (canvas.height * 0.4);
                        ctx.lineTo(x, buildingHeight);
                        ctx.lineTo(x + 15, buildingHeight);
                    }
                    
                    // Silüeti tamamla
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.lineTo(0, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Bina pencerelerini ekle (ışıklar)
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
                    for (let i = 0; i < 300; i++) {
                        const x = Math.random() * canvas.width;
                        const y = Math.random() * (canvas.height * 0.3) + (canvas.height * 0.5);
                        const width = Math.random() * 4 + 2;
                        const height = Math.random() * 4 + 2;
                        ctx.fillRect(x, y, width, height);
                    }
                    
                    // Doku olarak kullan
                    const texture = new THREE.CanvasTexture(canvas);
                    newYorkMaterial.map = texture;
                    
                    // Animation ile geçiş
                    this.animateMaterialChange(greenScreenMesh, newYorkMaterial);
                    
                    // Materials sınıfında kullanmak için kaydedelim
                    if(this.materials.items) {
                        this.materials.items.newYorkMaterial = newYorkMaterial;
                    }
                }
                console.log('New York arka planı yüklendi');
                break;
                
            default:
                // Varsayılan yeşil materyal
                if(this.materials.items.hubitGreen) {
                    this.animateMaterialChange(greenScreenMesh, this.materials.items.hubitGreen);
                }
                console.log('Varsayılan arka plan yüklendi');
        }
    }
    
    animateMaterialChange(mesh, newMaterial) {
        // Materyalleri yumuşak geçişle değiştir
        // Kopya materyaller oluşturup onlar üzerinde animasyon yaparız
        
        // Eski materyal
        const oldMaterial = mesh.material;
        
        // Yeni materyal kopyası
        const transitionMaterial = newMaterial.clone();
        transitionMaterial.transparent = true;
        transitionMaterial.opacity = 0;
        
        // Geçici olarak iki materyal göster
        mesh.material = transitionMaterial;
        
        // Animasyon ile geçiş
        gsap.to(transitionMaterial, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                // Animasyon tamamlandığında orjinal materyali ata
                mesh.material = newMaterial;
            }
        });
    }
} 