import * as THREE from 'three';

export default {
    name: '火焰球',
    label: '火焰球',

    initParameters: {
        radius: 5,
        speed: 1
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.SphereGeometry(params.radius, 64, 64);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                iTime: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float iTime;
                varying vec2 vUv;
                varying vec3 vPosition;

                float hash(vec3 p) {
                    p = fract(p * 0.3183099 + 0.1);
                    p *= 17.0;
                    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }

                float noise(vec3 x) {
                    vec3 p = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(mix(hash(p), hash(p + vec3(1,0,0)), f.x),
                            mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
                        mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
                            mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y),
                        f.z);
                }

                float fbm(vec3 p) {
                    float f = 0.0;
                    f += 0.5000 * noise(p); p *= 2.01;
                    f += 0.2500 * noise(p); p *= 2.02;
                    f += 0.1250 * noise(p); p *= 2.03;
                    f += 0.0625 * noise(p);
                    return f;
                }

                void main() {
                    vec3 p = vPosition * 0.5 + vec3(0.0, iTime * 0.5, 0.0);
                    float n = fbm(p);

                    vec3 color1 = vec3(1.0, 0.3, 0.0);
                    vec3 color2 = vec3(1.0, 0.8, 0.0);
                    vec3 color = mix(color1, color2, n);

                    float alpha = smoothstep(0.3, 0.7, n);
                    gl_FragColor = vec4(color, alpha);
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
