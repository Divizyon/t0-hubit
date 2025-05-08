import * as THREE from 'three'

export function createFloor(options = {}) {
    // Default options
    const defaultOptions = {
        size: new THREE.Vector3(30, 30, 1),
        color: 0xd6c685,
        fade: {
            top: true,
            right: true,
            bottom: true,
            left: true,
            startDistance: 0.5,
            endDistance: 1.0
        }
    };

    // Merge provided options with defaults
    const config = {
        ...defaultOptions,
        fade: { ...defaultOptions.fade, ...(options.fade || {}) },
        size: options.size || defaultOptions.size,
        color: options.color || defaultOptions.color
    };

    // Convert color to normalized RGB components for shader
    const color = new THREE.Color(config.color);

    // Define shader materials for the floor
    const vertexShader = `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 color;
        uniform float fadeStartDistance;
        uniform float fadeEndDistance;
        uniform bool fadeTop;
        uniform bool fadeRight;
        uniform bool fadeBottom;
        uniform bool fadeLeft;
        
        varying vec2 vUv;
        
        void main() {
            // Base color from uniform
            vec3 baseColor = color;
            
            // Calculate directional fade based on UV coordinates
            float alpha = 1.0;
            
            // X-axis fading (left and right edges)
            if (fadeLeft && vUv.x < 0.5) {
                float distFromEdge = vUv.x * 2.0; // Normalize to 0-1 range for left half
                alpha *= smoothstep(0.0, fadeStartDistance * 2.0, distFromEdge);
            }
            
            if (fadeRight && vUv.x > 0.5) {
                float distFromEdge = (1.0 - vUv.x) * 2.0; // Normalize to 0-1 range for right half
                alpha *= smoothstep(0.0, fadeStartDistance * 2.0, distFromEdge);
            }
            
            // Y-axis fading (top and bottom edges)
            if (fadeBottom && vUv.y < 0.5) {
                float distFromEdge = vUv.y * 2.0; // Normalize to 0-1 range for bottom half
                alpha *= smoothstep(0.0, fadeStartDistance * 2.0, distFromEdge);
            }
            
            if (fadeTop && vUv.y > 0.5) {
                float distFromEdge = (1.0 - vUv.y) * 2.0; // Normalize to 0-1 range for top half
                alpha *= smoothstep(0.0, fadeStartDistance * 2.0, distFromEdge);
            }
            
            gl_FragColor = vec4(baseColor, alpha);
        }
    `;

    const uniforms = {
        color: { value: new THREE.Color(config.color) },
        fadeStartDistance: { value: config.fade.startDistance },
        fadeEndDistance: { value: config.fade.endDistance },
        fadeTop: { value: config.fade.top },
        fadeRight: { value: config.fade.right },
        fadeBottom: { value: config.fade.bottom },
        fadeLeft: { value: config.fade.left }
    };

    const geometry = new THREE.PlaneGeometry(config.size.x, config.size.y);
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        transparent: true,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();

    return mesh;
}