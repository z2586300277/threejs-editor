import * as THREE from 'three';

export default {
    name: '黑洞',
    label: '黑洞',

    initParameters: {
        size: 20,
        speed: 1
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.PlaneGeometry(params.size, params.size);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                iTime: { value: 0 }
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
                varying vec2 vUv;

                void main() {
                    vec2 uv = (vUv - 0.5) * 2.0;
                    float dist = length(uv);
                    float angle = atan(uv.y, uv.x);

                    float warp = 1.0 / (dist + 0.1);
                    angle += iTime + warp * 0.5;

                    vec2 warpedUV = vec2(cos(angle), sin(angle)) * dist;

                    float rings = sin(dist * 20.0 - iTime * 3.0) * 0.5 + 0.5;
                    float spiral = sin(angle * 5.0 + dist * 10.0 - iTime * 2.0) * 0.5 + 0.5;

                    vec3 color = vec3(0.5, 0.2, 0.8) * rings;
                    color += vec3(0.2, 0.5, 1.0) * spiral * 0.5;

                    float alpha = smoothstep(1.0, 0.0, dist) * 0.8;
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
