import * as THREE from "three";

class Steam extends THREE.Object3D {
    constructor(params) {
        super();
        this.params = { ...params };

        this.uniforms = {
            time: { value: 0 },
            baseColor: { value: new THREE.Color(this.params.color) },
            height: { value: this.params.height },
            turbulence: { value: this.params.turbulence },
            density: { value: this.params.density },
        };

        this.material = this.createMaterial();
        this.geometry = this.createGeometry();
        this.particles = new THREE.Points(this.geometry, this.material);
        this.particles.renderOrder = 999;
        this.particles.frustumCulled = false;
        this.add(this.particles);
    }

    createMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute float size;
        attribute float phase;
        attribute vec3 velocity;
        uniform float time;
        uniform float height;
        uniform float turbulence;
        varying float vAlpha;
        varying float vAge;
        void main() {
            float age = mod(time * 0.3 + phase, 1.0);
            vAge = age;
            vec3 pos = position + velocity * age * height;
            pos.x += sin(age * 8.0 + phase * 20.0) * turbulence * (0.5 + age);
            pos.z += cos(age * 6.0 + phase * 15.0) * turbulence * (0.3 + age * 0.5);
            pos.x *= (1.0 + age * 1.5);
            pos.z *= (1.0 + age * 0.8);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * (1.0 + age * 3.0) * (250.0 / -mvPosition.z);
            float fadeIn = smoothstep(0.0, 0.1, age);
            float fadeOut = 1.0 - smoothstep(0.6, 1.0, age);
            vAlpha = fadeIn * fadeOut;
            #include <logdepthbuf_vertex>
        }
    `,
            fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform vec3 baseColor;
        uniform float density;
        varying float vAlpha;
        varying float vAge;
        void main() {
            float dist = length(gl_PointCoord - 0.5) * 2.0;
            if (dist > 1.0) discard;
            float edge = 1.0 - smoothstep(0.3, 1.0, dist);
            vec3 color = mix(baseColor, vec3(0.85, 0.88, 0.92), vAge * 0.3);
            float alpha = vAlpha * edge * density;
            gl_FragColor = vec4(color * alpha, alpha);
            #include <logdepthbuf_fragment>
        }
    `,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            transparent: true,
        });
    }

    createGeometry() {
        const geo = new THREE.BufferGeometry();
        const positions = [], sizes = [], phases = [], velocities = [];

        for (let i = 0; i < this.params.count; i++) {
            positions.push(
                (Math.random() - 0.5) * this.params.width,
                Math.random() * 0.3,
                (Math.random() - 0.5) * this.params.depth
            );
            sizes.push(this.params.particleSize * (0.6 + Math.random() * 0.8));
            phases.push(Math.random());
            velocities.push(
                (Math.random() - 0.5) * this.params.spread,
                this.params.riseSpeed * (0.8 + Math.random() * 0.4),
                (Math.random() - 0.5) * this.params.spread * 0.5
            );
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
        geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        return geo;
    }

    update() {
        this.uniforms.time.value += 0.01;
    }

    updateParameters() {
        this.uniforms.baseColor.value.set(this.params.color);
        this.uniforms.height.value = this.params.height;
        this.uniforms.turbulence.value = this.params.turbulence;
        this.uniforms.density.value = this.params.density;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}

export default {
    name: '蒸汽',
    label: '蒸汽',

    create: function(storage, { scene }) {
        const params = {
            count: 3000,
            particleSize: 3,
            width: 12,
            depth: 4,
            height: 15,
            riseSpeed: 0.4,
            spread: 0.3,
            turbulence: 0.3,
            density: 0.16,
            color: '#ffffff',
        };
        if (storage?.params) Object.assign(params, storage.params);

        const steam = new Steam(params);
        steam.disBlendShader = true;
        scene.addUpdateListener(() => steam.update());
        return steam;
    },

    createPanel: function(steam, folder) {
        const p = steam.params;
        folder.add(p, 'height', 5, 30).name('上升高度').onChange(() => steam.updateParameters());
        folder.add(p, 'turbulence', 0, 1).name('湍流强度').onChange(() => steam.updateParameters());
        folder.add(p, 'density', 0.1, 1).name('浓度').onChange(() => steam.updateParameters());
        folder.add(p, 'width', 1, 20).name('喷口宽度').onChange(() => {
            steam.geometry.dispose();
            steam.geometry = steam.createGeometry();
            steam.particles.geometry = steam.geometry;
        });
        folder.add(p, 'depth', 0.5, 10).name('喷口深度').onChange(() => {
            steam.geometry.dispose();
            steam.geometry = steam.createGeometry();
            steam.particles.geometry = steam.geometry;
        });
        folder.add(p, 'riseSpeed', 0.1, 1).name('上升速度').onChange(() => {
            steam.geometry.dispose();
            steam.geometry = steam.createGeometry();
            steam.particles.geometry = steam.geometry;
        });
        folder.add(p, 'count', 500, 8000, 500).name('粒子数量').onChange(() => {
            steam.geometry.dispose();
            steam.geometry = steam.createGeometry();
            steam.particles.geometry = steam.geometry;
        });
        folder.add(p, 'particleSize', 0.1, 5).name('粒子大小').onChange(() => {
            steam.geometry.dispose();
            steam.geometry = steam.createGeometry();
            steam.particles.geometry = steam.geometry;
        });
        folder.addColor(p, 'color').name('蒸汽颜色').onChange(() => steam.updateParameters());
    },

    getStorage: (steam) => ({ params: { ...steam.params } }),
    setStorage: (steam, storage) => {
        if (storage?.params) {
            Object.assign(steam.params, storage.params);
            steam.updateParameters();
        }
    }
};
