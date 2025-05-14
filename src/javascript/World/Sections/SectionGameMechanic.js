import * as THREE from 'three';

export default class SectionGameMechanic {
  constructor({ scene, resources }) {
    this.scene = scene;
    this.resources = resources;

    this.container = new THREE.Object3D();
    this.position = new THREE.Vector3(0, 0, 0);

    this.container.position.set(80, 30, 0); // Yolun kenarına, zeminde pozisyonlandır
    this.container.rotation.x = -Math.PI / 1; // Yatay döndür (90 derece)
    this.container.rotation.z = Math.PI / 2; // Hafif bir açı vererek yola paralel hale getir (15 derece)
    
    // Futbol sahası ve öğelerini oluştur
    this._buildFootballField();
    
    if (this.scene) {
      this.scene.add(this.container);
    }
  }
  
  _buildFootballField() {
    try {
      // Yeşil saha (mevcut)
      const fieldGeometry = new THREE.PlaneGeometry(30, 30);
      const fieldMaterial = new THREE.MeshBasicMaterial({
        color: 0x22cc22, // Parlak yeşil
        side: THREE.DoubleSide
      });
      
      this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      this.field.rotation.x = -Math.PI / 1; // Yatay olacak şekilde
      this.field.position.set(0, 0.1, 0); // Zeminin hemen üstünde
      
      this.container.add(this.field);
      
      // Kale (mevcut kırmızı küp)
      const goalGeometry = new THREE.BoxGeometry(10, 6, 0.5);
      const goalMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Beyaz kale
        wireframe: true
      });
      
      this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
      this.goal.position.set(0, 3, -10); // Sahanın bir ucunda
      
      this.container.add(this.goal);
      
      // Top ekleyelim
      const ballGeometry = new THREE.SphereGeometry(1, 16, 16);
      const ballMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff // Beyaz top
      });
      
      this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
      this.ball.position.set(0, 1, 0); // Sahanın ortasında, yerden 1 birim yukarıda
      
      this.container.add(this.ball);
      
      // Saha çizgileri
      this._addFieldLines();
      
      console.log('Futbol sahası oluşturuldu');
    } catch (error) {
      console.error('Model oluşturma hatası:', error);
    }
  }
  
  _addFieldLines() {
    // Orta çizgi
    const midLineGeometry = new THREE.PlaneGeometry(30, 0.2);
    const linesMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    
    const midLine = new THREE.Mesh(midLineGeometry, linesMaterial);
    midLine.rotation.x = -Math.PI / 2;
    midLine.position.set(0, 0.11, 0);
    
    this.container.add(midLine);
    
    // Orta daire
    const centerCircleGeometry = new THREE.RingGeometry(4.9, 5, 32);
    const centerCircle = new THREE.Mesh(centerCircleGeometry, linesMaterial);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.11, 0);
    
    this.container.add(centerCircle);
    
    // Kale alanı
    const goalAreaGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(14, 0.1, 8)
    );
    const goalAreaMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const goalArea = new THREE.LineSegments(goalAreaGeometry, goalAreaMaterial);
    goalArea.position.set(0, 0.11, -11);
    
    this.container.add(goalArea);
  }
  
}