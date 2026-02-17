// Interactive WebGL background with 3D point cloud effect
class InteractiveBackground {
    constructor() {
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.pointsMesh = null;
        this.canvas = null;
        this.buttonDistortions = [
            { active: false, x: 0, y: 0, targetStrength: 0, currentStrength: 0 },
            { active: false, x: 0, y: 0, targetStrength: 0, currentStrength: 0 },
            { active: false, x: 0, y: 0, targetStrength: 0, currentStrength: 0 }
        ];
    }

    init(container) {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'interactive-bg-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        container.insertBefore(this.canvas, container.firstChild);

        // Setup Three.js with perspective camera for 3D effect
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 3.5; // Adjusted for landscape aspect ratio
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: false,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('./assets/homepage/background.png', (texture) => {
            this.createPointCloud(texture);
            this.animate();
        });

        // Resize listener
        window.addEventListener('resize', () => this.onResize());
    }

    createPointCloud(texture) {
        // Create a grid of points - landscape orientation (wider than tall)
        const width = 300;  // Number of points horizontally (wider)
        const height = 120; // Number of points vertically (shorter for landscape)
        const pointCount = width * height;

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointCount * 3);
        const uvs = new Float32Array(pointCount * 2);
        
        let i = 0;
        let uvIndex = 0;
        
        // Make the plane landscape by scaling horizontally
        const aspectRatio = 16 / 9; // Landscape aspect ratio
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Position in 3D space - scale X to make it wider
                positions[i] = ((x / width) * 2 - 1) * aspectRatio;
                positions[i + 1] = (y / height) * 2 - 1;
                positions[i + 2] = 0;
                
                // UV coordinates for texture sampling
                uvs[uvIndex] = x / width;
                uvs[uvIndex + 1] = y / height;
                
                i += 3;
                uvIndex += 2;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Shader material for point cloud
        const vertexShader = `
            uniform sampler2D uTexture;
            uniform float uTime;
            
            varying vec3 vColor;
            varying float vDisplacement;
            
            void main() {
                vec3 pos = position;
                vec2 texUv = uv;
                
                // Sample texture color
                vec4 texColor = texture2D(uTexture, texUv);
                
                // Calculate brightness for subtle displacement
                float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
                
                // Distort UVs slightly for visual interest - increased
                vec2 distortedUv = texUv;
                distortedUv.x += sin(texUv.y * 10.0 + uTime * 0.8) * 0.01;
                distortedUv.y += cos(texUv.x * 10.0 + uTime * 0.8) * 0.01;
                
                // Base subtle displacement based on brightness
                float displacement = brightness * 0.15;
                
                // Add multiple wave layers for visual complexity with more amplitude
                float wave1 = sin(pos.x * 3.0 + uTime * 0.8) * cos(pos.y * 3.0 + uTime * 0.8) * 0.08;
                float wave2 = sin(pos.x * 7.0 - uTime * 1.2) * sin(pos.y * 7.0 + uTime * 1.2) * 0.06;
                float wave3 = cos(pos.x * 5.0 + pos.y * 5.0 + uTime * 0.6) * 0.07;
                
                // Add circular ripple effect
                float distFromCenter = length(pos.xy);
                float ripple = sin(distFromCenter * 8.0 - uTime * 2.0) * 0.05;
                
                displacement += wave1 + wave2 + wave3 + ripple;
                
                // Gentle breathing effect
                float breathe = sin(uTime * 0.5) * 0.04;
                displacement += breathe * brightness;
                
                // Apply subtle Z displacement (much less than before)
                pos.z = displacement;
                
                // Pass to fragment shader
                vColor = texColor.rgb;
                vDisplacement = displacement;
                
                // Point size with more variation
                float pointSize = 3.0 + abs(displacement) * 20.0;
                gl_PointSize = pointSize;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec3 vColor;
            varying float vDisplacement;
            
            void main() {
                // Create circular points
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.5) discard;
                
                // Soft glow effect
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                glow = pow(glow, 2.0);
                
                // Subtle color enhancement based on displacement
                vec3 color = vColor * (1.0 + abs(vDisplacement) * 3.0);
                
                gl_FragColor = vec4(color * glow, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uTime: { value: 0 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.pointsMesh = new THREE.Points(geometry, material);
        this.scene.add(this.pointsMesh);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.pointsMesh) {
            // Update time for animation
            this.pointsMesh.material.uniforms.uTime.value += 0.016;

            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize() {
        if (this.renderer && this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.pointsMesh) {
            this.pointsMesh.geometry.dispose();
            this.pointsMesh.material.dispose();
        }
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.pointsMesh = null;
    }
}

// Global instance
window.interactiveBackground = null;
