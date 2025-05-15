import * as THREE from 'three';

export default class SectionStone {
    constructor(_options) {
        // Options
        this.scene = _options.scene;
        this.resources = _options.resources;
        this.objects = _options.objects;
        this.physics = _options.physics;
        this.debug = _options.debug;
        this.position = _options.position || 'default';
        this.index = _options.index || 1; // Stone index (1-9)
        this.customPosition = _options.customPosition; // Manuel pozisyon verisi
        
        // Setup
        this.container = new THREE.Object3D();
        this.container.name = `stone${this.index}`;
        
        // Set position and rotation based on the provided options or defaults
        if (_options.rotateX || _options.rotateY || _options.rotateZ) {
            this.container.rotation.x = _options.rotateX || 0;
            this.container.rotation.y = _options.rotateY || 0;
            this.container.rotation.z = _options.rotateZ || 0;
        }
        
        this.setPositions();
        this.setModel();
        
        // Add to scene
        if (this.scene) {
            this.scene.add(this.container);
        }
    }
    
    setPositions() {
        // Eğer özel pozisyon verilmişse, onu kullan
        if (this.customPosition) {
            this.container.position.set(
                this.customPosition.x || 0,
                this.customPosition.y || 0,
                this.customPosition.z || 0
            );
            return;
        }
        
        // Define different position options for stones
        const positions = {
            'default': { x: 0, y: 0, z: 0 },  // Center position
            'circle': [  // Positions in a circle
                { x: 10, y: 0, z: 0 },
                { x: 7.07, y: 0, z: 7.07 },
                { x: 0, y: 0, z: 10 },
                { x: -7.07, y: 0, z: 7.07 },
                { x: -10, y: 0, z: 0 },
                { x: -7.07, y: 0, z: -7.07 },
                { x: 0, y: 0, z: -10 },
                { x: 7.07, y: 0, z: -7.07 },
                { x: 0, y: 0, z: 0 }   // Center stone
            ],
            'grid': [  // Positions in a 3x3 grid
                { x: -10, y: 0, z: -10 },  // Top-left
                { x: 0, y: 0, z: -10 },    // Top-center
                { x: 10, y: 0, z: -10 },   // Top-right
                { x: -10, y: 0, z: 0 },    // Mid-left
                { x: 0, y: 0, z: 0 },      // Center
                { x: 10, y: 0, z: 0 },     // Mid-right
                { x: -10, y: 0, z: 10 },   // Bottom-left
                { x: 0, y: 0, z: 10 },     // Bottom-center
                { x: 10, y: 0, z: 10 }     // Bottom-right
            ],
            'random': [  // Random positions
                { x: 5, y: 0, z: -8 },
                { x: -7, y: 0, z: 3 },
                { x: 12, y: 0, z: 6 },
                { x: -3, y: 0, z: -5 },
                { x: 9, y: 0, z: -2 },
                { x: -11, y: 0, z: -7 },
                { x: 2, y: 0, z: 9 },
                { x: -8, y: 0, z: 7 },
                { x: 0, y: 0, z: 0 }
            ],
            // Manuel pozisyonlar - ihtiyaca göre düzenleyebilirsiniz
            'manuel': [
                { x: 20, y: 0, z: 0 },    // Stone 1
                { x: -15, y: 0, z: 0 },   // Stone 2
                { x: 5, y: 0, z: 0 },    // Stone 3
                { x: -25, y: 0, z: 0 },  // Stone 4
                { x: 30, y: 0, z: 0 },     // Stone 5
                { x: -20, y: 0, z: 0 },   // Stone 6
                { x: 10, y: 0, z: 0 },    // Stone 7
                { x: -5, y: 0, z: 0 },   // Stone 8
                { x: 0, y: 0, z: 0 }       // Stone 9
            ]
        };
        
        // Set the position based on the type and index
        if (this.position === 'default') {
            this.container.position.set(
                positions.default.x,
                positions.default.y,
                positions.default.z
            );
        } else if (this.position === 'circle' && this.index <= 9) {
            const pos = positions.circle[this.index - 1];
            this.container.position.set(pos.x, pos.y, pos.z);
        } else if (this.position === 'grid' && this.index <= 9) {
            const pos = positions.grid[this.index - 1];
            this.container.position.set(pos.x, pos.y, pos.z);
        } else if (this.position === 'random' && this.index <= 9) {
            const pos = positions.random[this.index - 1];
            this.container.position.set(pos.x, pos.y, pos.z);
        } else if (this.position === 'manuel' && this.index <= 9) {
            const pos = positions.manuel[this.index - 1];
            this.container.position.set(pos.x, pos.y, pos.z);
        } else {
            // Custom position
            this.container.position.set(
                this.position.x || 0,
                this.position.y || 0,
                this.position.z || 0
            );
        }
    }
    
    setModel() {
        try {
            // Get the correct stone model based on index
            const resourceName = `stone${this.index}`;
            
            if (this.resources.items[resourceName]) {
                // If we have a specific model for this stone index
                const model = this.resources.items[resourceName].scene.clone();
                
                // Add the model to the container
                this.container.add(model);
                
                // Add physics if needed
                if (this.physics && this.resources.items[`${resourceName}Collision`]) {
                    // Create physics body
                    const collision = this.resources.items[`${resourceName}Collision`].scene;
                    
                    // Add to physics world
                    this.objects.add({
                        base: model,
                        collision: collision,
                        offsetPosition: new THREE.Vector3(0, 0, 0),
                        offsetRotation: new THREE.Euler(0, 0, 0),
                        mass: 10,
                        sleep: true
                    });
                }
                
                console.log(`Stone ${this.index} loaded successfully`);
            } else {
                // Fallback to a default stone model if specific one not found
                console.warn(`Stone model ${resourceName} not found, using default stone`);
                
                // Create a simple stone mesh as fallback
                const geometry = new THREE.DodecahedronGeometry(2, 0);
                const material = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.8,
                    metalness: 0.2
                });
                
                const stoneMesh = new THREE.Mesh(geometry, material);
                this.container.add(stoneMesh);
            }
        } catch (error) {
            console.error(`Error loading stone ${this.index}:`, error);
        }
    }
} 