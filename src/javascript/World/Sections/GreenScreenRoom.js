import * as THREE from 'three'
import CANNON from 'cannon'
import gsap from 'gsap'

export default class GreenScreenRoom {
    // Arrow function olarak tanımlandığında, fonksiyon otomatik olarak sınıf 
    // instance'ına bağlanır, böylece bind etmeye gerek kalmaz
    handleDocumentClick = (event) => {
        // HTML popup kullandığımız için bu fonksiyonu artık kullanmıyoruz
        // Bu fonksiyonu boş bırakıyoruz çünkü her tıklama direkt HTML elementleri üzerinden yönetiliyor
    }

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

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        // Arkaplan verileri - 8 farklı arkaplan (çalışan URL'ler)
        this.backgrounds = [
            { 
                id: 'desert', 
                name: 'Çöl', 
                color: '#e1c78f',
                image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'beach', 
                name: 'Plaj', 
                color: '#87ceeb',
                image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'forest', 
                name: 'Orman', 
                color: '#228b22',
                image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'mountain', 
                name: 'Dağ', 
                color: '#696969',
                image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'city', 
                name: 'Şehir', 
                color: '#4682b4',
                image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'sunset', 
                name: 'Gün Batımı', 
                color: '#ff7f50',
                image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'winter', 
                name: 'Kış', 
                color: '#b0e0e6',
                image: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            },
            { 
                id: 'lake', 
                name: 'Göl', 
                color: '#1e90ff',
                image: 'https://images.unsplash.com/photo-1439824745566-5bc8a3a35a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            }
        ];

        // Popup kontrol
        this.isPopupOpen = false;
        this.popup = null;
        
        this.setModel()
        this.createButtons()
        
        // Yeşil ekran sınırları - model ölçeğine göre ayarla (0.8)
        this.greenScreenBounds = {
            minX: this.x - 3.2, // -4 * 0.8
            maxX: this.x + 3.2, // 4 * 0.8
            minY: this.y - 1.6, // -2 * 0.8
            maxY: this.y + 1.6, // 2 * 0.8
        };
        
        // Araba içeride mi kontrolü
        this.isCarInside = false;
        this.lastLocation = null;
        
        // Her frame'de araba pozisyonunu kontrol et
        this.time.on('tick', () => {
            this.checkCarPosition();
        });
        
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
        // Tek bir "Arka Plan Seç" butonu oluştur
        this.mainButton = {}
        
        // Buton konumu - zemin üzerinde, ortada
        const buttonY = this.y - 5; 
        
        // Ana butonu oluştur
        this.mainButton = this.createLocationButton('Arka Plan Seç', 0, buttonY, '#4169e1', 'selectBackground');
        
        // Buton etkileşimini ayarla
        this.mainButton.triggerArea.on('interact', () => {
            this.showBackgroundSelector();
        });
        
        // Hover efekti
        this.mainButton.triggerArea.on('in', () => {
            // Zemin için hover - yukarı kaldırma efekti
            gsap.to(this.mainButton.label.mesh.position, {
                z: 0.25, // Biraz daha yukarı kaldır
                duration: 0.3,
                ease: 'back.out'
            });
            
            // Opaklığı artır
            gsap.to(this.mainButton.label.material, {
                opacity: 1,
                duration: 0.3
            });
            
            // Enter ikonunu da yukarı kaldır
            if(this.mainButton.enter && this.mainButton.enter.mesh) {
                gsap.to(this.mainButton.enter.mesh.position, {
                    z: 0.26, // Label'dan biraz daha yüksek
                    duration: 0.3,
                    ease: 'back.out'
                });
            }
        });
        
        this.mainButton.triggerArea.on('out', () => {
            // Hover bitince normale döndür
            gsap.to(this.mainButton.label.mesh.position, {
                z: 0.15, // Normal yükseklik
                duration: 0.3,
                ease: 'back.in'
            });
            
            gsap.to(this.mainButton.label.material, {
                opacity: 0.7,
                duration: 0.3
            });
            
            // Enter ikonu da normale dönsün
            if(this.mainButton.enter && this.mainButton.enter.mesh) {
                gsap.to(this.mainButton.enter.mesh.position, {
                    z: 0.16, // Normal yükseklik
                    duration: 0.3,
                    ease: 'back.in'
                });
            }
        });
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
        button.label.size = 3.0  // Daha büyük boyut
        button.label.geometry = new THREE.PlaneGeometry(button.label.size, button.label.size / 2.5, 1, 1)
        
        // Buton texture'ını oluştur
        button.label.texture = this.createButtonTexture(locationName, color);
        
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
        if (this.resources.items.greenScreenEnterKeyTexture) {
            // Enter ikonu ekle
            button.enter = {};
            button.enter.size = 0.6; // Enter ikonu
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
        button.name = locationName
        button.color = color
        button.type = type
        
        return button
    }
    
    createButtonTexture(locationName, color) {
        // Yazı texturesi oluştur
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 600
        canvas.height = 240
        
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
        context.font = 'bold 28px Arial';
        context.textAlign = 'right';
        context.fillText('ENTER', enterIconX - 10, enterIconY + enterIconSize / 2 + 10);
        
        // Ana konum yazısı
        context.font = 'bold 90px Arial'
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
        ctx.quadraticCurveTo(x, y, x + radius, y); // Fix: Added missing end point coordinates
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
                    opacity: 0.7,
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
                    opacity: 0.7,
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
                    opacity: 0.7,
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
                        opacity: 0.7,
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
            z: 0.4,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
        
        // Enter ikonunu da yukarı kaldır
        if(activeButton.enter && activeButton.enter.mesh) {
            gsap.to(activeButton.enter.mesh.position, {
                z: 0.41,
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
            z: 0.3,
            duration: 0.1,
            delay: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
    }

    spawnCarInGreenScreen(location) {
        console.log(`Araba ${location} konumunda spawn edildi!`);
        
        // Mevcut lokasyonu kaydet
        this.currentLocation = location;
        
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
            const rotationAngle = -Math.PI * 0.2; // Kameraya dönük
            const rotation = new CANNON.Quaternion();
            rotation.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rotationAngle);
            this.areas.car.physics.car.chassis.body.quaternion.copy(rotation);
            
            // Aracın uykuda olmasını önle
            this.areas.car.physics.car.chassis.body.wakeUp();
            
            // Yeşil ekranın arka plan materyalini değiştir
            this.changeBackgroundByLocation(location);
            
            // Efektli geçiş için ışık efekti
            this.createSpawnEffect(spawnPosition);
            
            // Araba içeride olarak işaretle
            this.isCarInside = true;
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
    
    changeBackgroundByLocation(locationId) {
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
        
        // Seçilen arka plan bilgilerini bul
        const selectedBackground = this.backgrounds.find(bg => bg.id === locationId);
        
        if (!selectedBackground) {
            console.error(`${locationId} ID'li arkaplan bulunamadı!`);
            return;
        }
        
        // Arkaplan materyali oluştur veya varolan materyali kullan
        const materialKey = `${locationId}Material`;
        
        if (this.materials.items && this.materials.items[materialKey]) {
            // Varolan materyali kullan
            this.animateMaterialChange(greenScreenMesh, this.materials.items[materialKey]);
            console.log(`${selectedBackground.name} arka planı (önbellek) yüklendi`);
        } else {
            console.log(`${selectedBackground.name} arkaplanı için resim yükleniyor: ${selectedBackground.image}`);
            
            // Fallback olarak önce renk materyali oluştur
            const fallbackMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(selectedBackground.color),
                side: THREE.FrontSide
            });
            
            // Materyal geçişini hemen başlat - önce renk ile
            this.animateMaterialChange(greenScreenMesh, fallbackMaterial);
            
            // Resim yüklemesi deneyelim
            this.loadTexture(selectedBackground.image)
                .then(texture => {
                    // Başarılı yükleme
                    const newMaterial = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.FrontSide
                    });
                    
                    // Animasyonla geçiş yap
                    this.animateMaterialChange(greenScreenMesh, newMaterial);
                    
                    // Materyali daha sonra kullanmak üzere sakla
                    if (this.materials.items) {
                        this.materials.items[materialKey] = newMaterial;
                    }
                    
                    console.log(`${selectedBackground.name} resmi başarıyla yüklendi`);
                })
                .catch(error => {
                    // Yükleme hatası - zaten fallback materyal kullanılıyor
                    console.warn(`${selectedBackground.name} resmi yüklenemedi, düz renk kullanılıyor`, error);
                    
                    // Fallback materyali kaydet
                    if (this.materials.items) {
                        this.materials.items[materialKey] = fallbackMaterial;
                    }
                });
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

    checkCarPosition() {
        // Araba içeride mi kontrolü
        if (this.areas.car && this.areas.car.physics) {
            const carPosition = this.areas.car.physics.car.chassis.body.position;
            const carX = carPosition.x;
            const carY = carPosition.y;

            if (
                carX > this.greenScreenBounds.minX &&
                carX < this.greenScreenBounds.maxX &&
                carY > this.greenScreenBounds.minY &&
                carY < this.greenScreenBounds.maxY
            ) {
                // Araba yeşil kutunun içindeyse
                if (!this.isCarInside) {
                    this.isCarInside = true;
                    // Yeşil ekrana tekrar girdiğinde, son seçilen lokasyon arka planını göster
                    if (this.currentLocation) {
                        this.changeBackgroundByLocation(this.currentLocation);
                    }
                }
            } else {
                // Araba yeşil kutunun dışındaysa
                if (this.isCarInside) {
                    this.isCarInside = false;
                    // Arka planı yeşile döndür
                    this.resetBackground();
                }
            }
        }
    }
    
    resetBackground() {
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
        
        // Arka planı yeşile çevir
        if(this.materials.items.hubitGreen) {
            this.animateMaterialChange(greenScreenMesh, this.materials.items.hubitGreen);
            console.log('Arka plan yeşile döndürüldü');
        }
    }

    // Arka plan seçim popup'ını göster
    showBackgroundSelector() {
        if (this.isPopupOpen) return;
        
        console.log('Arka plan seçiciyi göster');
        
        // Popup'ı oluştur
        this.createPopup();
        
        // Popup'ı aktif olarak işaretle
        this.isPopupOpen = true;
    }
    
    createPopup() {
        // Eğer zaten bir popup varsa, önce onu kaldır
        if (document.getElementById('greenScreenPopup')) {
            document.getElementById('greenScreenPopup').remove();
        }
        
        // Popup container oluştur
        const popupContainer = document.createElement('div');
        popupContainer.id = 'greenScreenPopup';
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '50%';
        popupContainer.style.left = '50%';
        popupContainer.style.transform = 'translate(-50%, -50%)';
        popupContainer.style.backgroundColor = '#333';
        popupContainer.style.borderRadius = '10px';
        popupContainer.style.padding = '20px';
        popupContainer.style.width = '700px';
        popupContainer.style.maxWidth = '90%';
        popupContainer.style.maxHeight = '80vh';
        popupContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        popupContainer.style.zIndex = '1000';
        popupContainer.style.color = '#fff';
        popupContainer.style.fontFamily = 'Arial, sans-serif';
        popupContainer.style.overflow = 'auto';
        
        // Başlık oluştur
        const title = document.createElement('h2');
        title.textContent = 'Arka Plan Seçiniz';
        title.style.textAlign = 'center';
        title.style.margin = '0 0 20px 0';
        title.style.padding = '0 0 10px 0';
        title.style.borderBottom = '1px solid #555';
        
        // Kapat butonu
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = '#ff0000';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '50%';
        closeButton.style.width = '30px';
        closeButton.style.height = '30px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.style.fontWeight = 'bold';
        closeButton.onclick = () => this.closePopup();
        
        // Arkaplan grid container
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        gridContainer.style.gap = '15px';
        
        // Her arkaplan için grid item oluştur
        this.backgrounds.forEach(bg => {
            const bgItem = document.createElement('div');
            bgItem.style.padding = '0';
            bgItem.style.borderRadius = '5px';
            bgItem.style.cursor = 'pointer';
            bgItem.style.textAlign = 'center';
            bgItem.style.border = '2px solid white';
            bgItem.style.transition = 'transform 0.2s';
            bgItem.style.position = 'relative';
            bgItem.style.overflow = 'hidden';
            bgItem.style.height = '150px';
            
            // Resim arka planı
            const bgImage = document.createElement('div');
            bgImage.style.position = 'absolute';
            bgImage.style.top = '0';
            bgImage.style.left = '0';
            bgImage.style.right = '0';
            bgImage.style.bottom = '0';
            bgImage.style.backgroundImage = `url(${bg.image})`;
            bgImage.style.backgroundSize = 'cover';
            bgImage.style.backgroundPosition = 'center';
            bgImage.style.opacity = '0.8';
            
            // Arkaplan ismi
            const bgName = document.createElement('div');
            bgName.textContent = bg.name;
            bgName.style.position = 'absolute';
            bgName.style.bottom = '0';
            bgName.style.left = '0';
            bgName.style.right = '0';
            bgName.style.padding = '10px';
            bgName.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            bgName.style.color = 'white';
            bgName.style.fontSize = '18px';
            bgName.style.fontWeight = 'bold';
            bgName.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
            
            // Tıklama olayı
            bgItem.onclick = () => this.selectBackground(bg);
            
            // Hover efekti
            bgItem.onmouseover = () => {
                bgItem.style.transform = 'scale(1.05)';
                bgImage.style.opacity = '1';
            };
            bgItem.onmouseout = () => {
                bgItem.style.transform = 'scale(1)';
                bgImage.style.opacity = '0.8';
            };
            
            bgItem.appendChild(bgImage);
            bgItem.appendChild(bgName);
            gridContainer.appendChild(bgItem);
        });
        
        // Elemanları container'a ekle
        popupContainer.appendChild(closeButton);
        popupContainer.appendChild(title);
        popupContainer.appendChild(gridContainer);
        
        // Popup'ı sayfaya ekle
        document.body.appendChild(popupContainer);
        
        // Popup objesini referans olarak sakla
        this.popup = {
            element: popupContainer
        };
    }
    
    // Popup'ı kapat - HTML popup için güncellendi
    closePopup() {
        if (!this.isPopupOpen) return;
        
        console.log('Popup kapatılıyor');
        
        // HTML popup'ı kaldır
        if (this.popup && this.popup.element) {
            document.body.removeChild(this.popup.element);
            this.popup = null;
        }
        
        // Olay dinleyicilerini temizle - 3D popup için kullanılan dinleyiciyi kaldır
        document.removeEventListener('click', this.handleDocumentClick);
        
        // Popup'ı kapalı olarak işaretle
        this.isPopupOpen = false;
    }
    
    // Arkaplan seç ve popup'ı kapat
    selectBackground(background) {
        console.log(`${background.name} arkaplanı seçildi`);
        
        // Popup'ı kapat
        this.closePopup();
        
        // Arabayı yeşil ekrana spawn et
        this.spawnCarInGreenScreen(background.id);
    }

    // Arkaplan için texture yükleme fonksiyonu
    loadTexture(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.crossOrigin = 'anonymous'; // CORS için gerekli
            
            loader.load(
                url,
                (texture) => {
                    // Texture başarıyla yüklendi
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearFilter;
                    resolve(texture);
                },
                undefined, // Progress callback
                (error) => {
                    // Hata olduğunda
                    console.error('Texture yüklenemedi:', error);
                    reject(error);
                }
            );
        });
    }
}