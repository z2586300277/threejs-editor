import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const initParameters = {
    text: 'Three-Editor',
    size: 50,
    height: 15,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 5,
    bevelSize: 1.5,
    bevelSegments: 10,
    color: 0xffffff,
    amplitude: 5.0,
    opacity: 0.3,
    animationSpeed: 0.5,
    fontUrl: 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'
};

class ParticleText extends THREE.Object3D {
    constructor(params) {
        super();
        this.params = { ...params };
        this.clock = new THREE.Clock();
        this.loaded = false;
        this.needsUpdate = true;
        this.createMaterial();
        this.loadFont();
    }
    
    createMaterial() {
        const vertexShader = `
            uniform float amplitude;
            attribute vec3 displacement;
            attribute vec3 customColor;
            varying vec3 vColor;
            void main() {
                vec3 newPosition = position + amplitude * displacement;
                vColor = customColor;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;
        const fragmentShader = `
            uniform vec3 color;
            uniform float opacity;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor * color, opacity);
            }
        `;
        this.uniforms = {
            amplitude: { value: this.params.amplitude },
            opacity: { value: this.params.opacity },
            color: { value: new THREE.Color(this.params.color) },
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
        });
    }
    
    loadFont() {
        const loader = new FontLoader();
        loader.load(this.params.fontUrl, (font) => {
            this.font = font;
            this.createText();
            this.loaded = true;
        });
    }
    
    createText() {
        if (this.line) {
            this.remove(this.line);
            this.line.geometry.dispose();
        }
        const geometry = new TextGeometry(this.params.text, {
            font: this.font,
            size: this.params.size,
            height: this.params.height,
            curveSegments: this.params.curveSegments,
            bevelEnabled: this.params.bevelEnabled,
            bevelThickness: this.params.bevelThickness,
            bevelSize: this.params.bevelSize,
            bevelSegments: this.params.bevelSegments
        });
        geometry.center();
        const count = geometry.attributes.position.count;
        const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
        geometry.setAttribute('displacement', displacement);
        const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
        geometry.setAttribute('customColor', customColor);
        const col = new THREE.Color();
        for (let i = 0, l = customColor.count; i < l; i++) {
            col.setHSL(i / l, 0.5, 0.5);
            col.toArray(customColor.array, i * customColor.itemSize);
        }
        this.line = new THREE.Line(geometry, this.material);
        // this.line.rotation.x = 0.2;
        this.add(this.line);
    }
    
    update() {
        if (!this.needsUpdate || !this.loaded || !this.line) return;
        const time = this.clock.getElapsedTime() * this.params.animationSpeed;
        this.uniforms.amplitude.value = Math.sin(0.5 * time);
        this.uniforms.color.value.offsetHSL(0.0005, 0, 0);
        const array = this.line.geometry.attributes.displacement.array;
        for (let i = 0, l = array.length; i < l; i += 3) {
            array[i] += 0.3 * (0.5 - Math.random());
            array[i + 1] += 0.3 * (0.5 - Math.random());
            array[i + 2] += 0.3 * (0.5 - Math.random());
        }
        this.line.geometry.attributes.displacement.needsUpdate = true;
    }
    
    updateParameters() {
        if (!this.loaded) return;
        this.uniforms.color.value.set(this.params.color);
        this.uniforms.opacity.value = this.params.opacity;
        this.uniforms.amplitude.value = this.params.amplitude;
        this.createText();
    }
    
    dispose() {
        if (this.line && this.line.geometry) {
            this.line.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}

export default {
    name: 'particleText',
    label: '粒子文字',
    initParameters,
    
    create: function(storage, { scene }) {
        const params = { ...initParameters };
        if (storage?.params) {
            Object.assign(params, storage.params);
        }
        const particleText = new ParticleText(params);
        scene.addUpdateListener(() => {
            particleText.update();
        });
        return particleText;
    },
    
    createPanel: function(particleText, folder) {
        const params = particleText.params;
        folder.add(params, 'text').name('文本内容').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'size', 1, 30).name('文字大小').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'height', 0.1, 10).name('文字厚度').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'curveSegments', 1, 10).step(1).name('曲线细分').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'bevelEnabled').name('启用斜面').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'bevelThickness', 0.1, 5).name('斜面厚度').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'bevelSize', 0.1, 5).name('斜面尺寸').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'bevelSegments', 1, 10).step(1).name('斜面细分').onChange(() => {
            particleText.updateParameters();
        });
        folder.add(params, 'amplitude', 0, 10).name('波动幅度');
        folder.add(params, 'opacity', 0, 1).name('透明度').onChange(() => {
            particleText.uniforms.opacity.value = params.opacity;
        });
        folder.add(params, 'animationSpeed', 0.1, 2).name('动画速度');
        folder.addColorRGB(particleText.uniforms.color.value).name('颜色');
        folder.add(params, 'fontUrl').name('字体URL');
        folder.addFn(() => {
            particleText.loadFont();
        }).name('重新加载字体');
        folder.add(particleText, 'needsUpdate').name('启用动画');
    },
    
    getStorage: function(particleText) {
        const { uniforms, params, needsUpdate } = particleText;
        return {
            params: {
                ...params,
                color: uniforms.color.value.getHex()
            },
            needsUpdate
        };
    },
    
    setStorage: function(particleText, storage) {
        if (!storage) return;
        if (storage.params) {
            Object.assign(particleText.params, storage.params);
            particleText.uniforms.color.value.setHex(storage.params.color);
            particleText.uniforms.opacity.value = storage.params.opacity;
            particleText.uniforms.amplitude.value = storage.params.amplitude;
            particleText.createText();
        }
        if (storage.needsUpdate !== undefined) {
            particleText.needsUpdate = storage.needsUpdate;
        }
    }
};
