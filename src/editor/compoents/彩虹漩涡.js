import * as THREE from 'three';

export default {
    name: '彩虹漩涡',
    label: '彩虹漩涡',

    initParameters: {
        size: 20,
        speed: 1
    },

    create(storage, { scene, DOM }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.PlaneGeometry(params.size, params.size);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float iTime;
                uniform vec2 iResolution;
                varying vec2 vUv;

                vec3 palette(float t) {
                    vec3 a = vec3(0.5, 0.5, 0.5);
                    vec3 b = vec3(0.5, 0.5, 0.5);
                    vec3 c = vec3(1.0, 1.0, 1.0);
                    vec3 d = vec3(0.263, 0.416, 0.557);
                    return a + b * cos(6.28318 * (c * t + d));
                }

                void main() {
                    vec2 uv = (vUv - 0.5) * 2.0;
                    vec2 uv0 = uv;
                    vec3 finalColor = vec3(0.0);

                    for(float i = 0.0; i < 4.0; i++) {
                        uv = fract(uv * 1.5) - 0.5;
                        float d = length(uv) * exp(-length(uv0));
                        vec3 col = palette(length(uv0) + i * 0.4 + iTime * 0.4);
                        d = sin(d * 8.0 + iTime) / 8.0;
                        d = abs(d);
                        d = pow(0.01 / d, 1.2);
                        finalColor += col * d;
                    }

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.addUpdateListener(() => {
            material.uniforms.iTime.value += 0.016 * params.speed;
        });

        mesh.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
        };

        mesh.userData.params = params;
        return mesh;
    },

    createPanel(mesh, folder) {
        const p = mesh.userData.params;
        folder.add(p, 'speed', 0, 5).name('速度');
    },

    getStorage(mesh) {
        return mesh.userData.params;
    }
};
