import * as THREE from "three";

class WideWaterFlow extends THREE.Object3D {
    constructor(params) {
        super();
        this.params = { ...params };

        this.uniforms = {
            time: { value: 0 },
            nozzlePos: { value: new THREE.Vector3(this.params.nozzleX, this.params.nozzleY, 0) },
            velocity: { value: new THREE.Vector2(this.params.velocityX, this.params.velocityY) },
            spread: { value: this.params.spread },
            gravity: { value: this.params.gravity },
            lifeTime: { value: this.params.lifeTime },
            nozzleSize: { value: new THREE.Vector2(this.params.nozzleLengthX, this.params.nozzleLengthZ) },
            baseColor: { value: new THREE.Color(this.params.color) },
            opacity: { value: this.params.opacity },
            density: { value: this.params.density },
            alpTest: { value: this.params.alpTest },
            finalOpacity: { value: this.params.finalOpacity },
        };

        this.material = this.createMaterial();
        this.geometry = this.createGeometry();
        this.particles = new THREE.Points(this.geometry, this.material);
        this.add(this.particles);
    }

    createMaterial() {
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                  #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute float size;
        attribute float phase;
        attribute vec3 randomVel;
        uniform float time;
        uniform vec3 nozzlePos;
        uniform vec2 velocity;
        uniform float spread;
        uniform float gravity;
        uniform float lifeTime;
        uniform vec2 nozzleSize;
        varying float vAlpha;

        void main() {
            float age = mod(time + phase, lifeTime);
            float ageRatio = age / lifeTime;

            vec3 pos = nozzlePos;
            pos.x += randomVel.x * nozzleSize.x;
            pos.y += randomVel.y * 0.05;
            pos.z += randomVel.z * nozzleSize.y;

            vec3 vel = vec3(velocity.x, velocity.y, 0.0);
            vel += randomVel * spread;

            pos += vel * age;
            pos.y -= 0.5 * gravity * age * age;

            vAlpha = smoothstep(0.0, 0.05, ageRatio) * (1.0 - smoothstep(0.85, 1.0, ageRatio));

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * (250.0 / -mvPosition.z);
            #include <logdepthbuf_vertex>
        }
    `,
            fragmentShader: `
                           #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform sampler2D map;
        uniform vec3 baseColor;
        uniform float opacity;
        uniform float density;
        uniform float alpTest;
        uniform float finalOpacity;
        varying float vAlpha;

        void main() {
            vec4 texColor = texture2D(map, gl_PointCoord);
            vec3 finalColor = baseColor * texColor.rgb;
            float alpha = pow(texColor.a, 1.0 / max(density, 0.01)) * vAlpha * opacity;
            if(opacity < 1.0 && alpha < alpTest) discard;
            gl_FragColor = vec4(finalColor, alpha * finalOpacity);
            #include <logdepthbuf_fragment>
        }
    `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const c = document.createElement('canvas');
        c.width = c.height = 32;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(200,235,255,1)');
        g.addColorStop(1, 'rgba(120,190,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
        this.uniforms.map = { value: new THREE.CanvasTexture(c) };

        return material;
    }

    createGeometry() {
        const geo = new THREE.BufferGeometry();
        const positions = [], sizes = [], phases = [], randomVels = [];

        for (let i = 0; i < this.params.count; i++) {
            positions.push(0, 0, 0);
            sizes.push(this.params.particleSize * (0.8 + Math.random() * 0.4));
            phases.push(Math.random() * this.params.lifeTime);
            randomVels.push(
                (Math.random() - 0.5),
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.8
            );
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
        geo.setAttribute('randomVel', new THREE.Float32BufferAttribute(randomVels, 3));
        return geo;
    }

    update() {
        this.uniforms.time.value += 0.01;
    }

    updateParameters() {
        this.uniforms.nozzlePos.value.set(this.params.nozzleX, this.params.nozzleY, 0);
        this.uniforms.velocity.value.set(this.params.velocityX, this.params.velocityY);
        this.uniforms.spread.value = this.params.spread;
        this.uniforms.gravity.value = this.params.gravity;
        this.uniforms.lifeTime.value = this.params.lifeTime;
        this.uniforms.nozzleSize.value.set(this.params.nozzleLengthX, this.params.nozzleLengthZ);
        this.uniforms.baseColor.value.set(this.params.color);
        this.uniforms.opacity.value = this.params.opacity;
        this.uniforms.density.value = this.params.density;
        this.uniforms.alpTest.value = this.params.alpTest;
        this.uniforms.finalOpacity.value = this.params.finalOpacity;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}

export default {
    name: '宽水流',
    label: '宽水流',

    create: function(storage, { scene }) {
        const params = {
            count: 3000,
            nozzleX: 0,
            nozzleY: 6,
            nozzleLengthX: 0.5,
            nozzleLengthZ: 0.2,
            velocityX: 1.5,
            velocityY: 2.0,
            spread: 1.5,
            gravity: 10,
            particleSize: 0.15,
            lifeTime: 2.0,
            color: '#c8ebff',
            opacity: 0.75,
            density: 1.0,
            alpTest: 0.0,
            finalOpacity: 1.0,
        };
        if (storage?.params) {
            Object.assign(params, storage.params);
        }

        const waterFlow = new WideWaterFlow(params);
        scene.addUpdateListener(() => waterFlow.update());
        return waterFlow;
    },

    createPanel: function(waterFlow, folder) {
        const params = waterFlow.params;

        folder.add(params, 'nozzleX', -5, 5).name('喷嘴X').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'nozzleY', 0, 10).name('喷嘴高度').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'nozzleLengthX', 0.05, 5.0).name('喷口长(X)').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'nozzleLengthZ', 0.05, 5.0).name('喷口宽(Z)').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'velocityX', -5, 5).name('水平速度').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'velocityY', 0, 5).name('上升速度').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'spread', 0, 3).name('扩散').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'gravity', 0, 20).name('重力').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'lifeTime', 0.5, 5).name('生命周期').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'count', 500, 8000, 500).name('粒子数').onChange(() => {
            waterFlow.geometry.dispose();
            waterFlow.geometry = waterFlow.createGeometry();
            waterFlow.particles.geometry = waterFlow.geometry;
        });
        folder.add(params, 'particleSize', 0.05, 0.5).name('粒子大小').onChange(() => {
            waterFlow.geometry.dispose();
            waterFlow.geometry = waterFlow.createGeometry();
            waterFlow.particles.geometry = waterFlow.geometry;
        });
        folder.addColor(params, 'color').name('水花颜色').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'opacity', 0.05, 1.0).name('透明度').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'density', 0.1, 3.0).name('浓度').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'alpTest', 0.0, 1.0).name('Alpha测试').onChange(() => waterFlow.updateParameters());
        folder.add(params, 'finalOpacity', 0.0, 1.0).name('最终透明度').onChange(() => waterFlow.updateParameters());
    },

    getStorage: function(waterFlow) {
        return { params: { ...waterFlow.params } };
    },

    setStorage: function(waterFlow, storage) {
        if (!storage?.params) return;
        Object.assign(waterFlow.params, storage.params);
        waterFlow.updateParameters();
    }
};
