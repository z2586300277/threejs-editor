import * as THREE from 'three';

export default {
    name: '雷达扫描',
    label: '雷达扫描',

    initParameters: {
        radius: 20,
        color: '#00ff00',
        speed: 1,
        lineCount: 4
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;
        const group = new THREE.Group();

        // 扫描圆盘
        const geometry = new THREE.CircleGeometry(params.radius, 64);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms: {
                uColor: { value: new THREE.Color(params.color) },
                uAngle: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uAngle;
                varying vec2 vUv;

                void main() {
                    vec2 center = vUv - 0.5;
                    float angle = atan(center.y, center.x);
                    float dist = length(center) * 2.0;

                    float scanAngle = mod(uAngle, 6.28318);
                    float diff = mod(angle - scanAngle + 3.14159, 6.28318);

                    float alpha = smoothstep(1.5, 0.0, diff) * (1.0 - dist);
                    gl_FragColor = vec4(uColor, alpha * 0.6);
                }
            `
        });

        const circle = new THREE.Mesh(geometry, material);
        circle.rotation.x = -Math.PI / 2;
        group.add(circle);

        // 圆环
        const ringGeo = new THREE.RingGeometry(params.radius * 0.95, params.radius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: params.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);

        // 扫描线
        for (let i = 0; i < params.lineCount; i++) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(params.radius, 0, 0)
            ]);
            const lineMat = new THREE.LineBasicMaterial({ color: params.color, transparent: true, opacity: 0.8 });
            const line = new THREE.Line(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.rotation.z = (Math.PI * 2 * i) / params.lineCount;
            group.add(line);
        }

        scene.addUpdateListener(() => {
            material.uniforms.uAngle.value += 0.016 * params.speed;
            group.rotation.y += 0.01 * params.speed;
        });

        group.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
            ringGeo.dispose();
            ringMat.dispose();
        };

        group.userData.params = params;
        return group;
    },

    getStorage(mesh) {
        return mesh.userData.params;
    }
};
