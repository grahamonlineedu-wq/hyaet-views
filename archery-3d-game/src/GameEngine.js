// src/GameEngine.js
import * as THREE from 'three';

export class GameEngine {
    constructor() {
        this.canvas = document.querySelector('#game-canvas');
        if (!this.canvas) {
            throw new Error("Canvas element with id 'game-canvas' not found.");
        }

        // 1. Create the Scene (Our empty 3D universe)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#1a1a2e'); // Deep space blue background
        
        // 2. Set up the Perspective Camera (The player's eyes)
        // Fields: Field of view (75 deg), Aspect ratio, Near clipping plane, Far clipping plane
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5); // 1.6 meters high—average eye level looking down the range

        // 3. Create the WebGL Renderer (Draws our 3D math onto the 2D screen)
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limits pixel ratio to 2 for mobile performance

        // 4. Add a basic light source so we will be able to see our 3D target tomorrow
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Handle browser window resizing dynamically
        window.addEventListener('resize', () => this.onWindowResize());

        // Kickstart the game animation loop
        this.tick();
    }

    onWindowResize() {
        // Keep aspect ratio matching the screen size changes
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    tick() {
        // Recursively call tick() on every single screen refresh (60+ FPS)
        requestAnimationFrame(() => this.tick());
        
        // Render the scene updated state from our camera's viewpoint
        this.renderer.render(this.scene, this.camera);
    }
}
