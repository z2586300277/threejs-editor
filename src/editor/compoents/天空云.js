import * as THREE from 'three';

function createRandom(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

export default {
    name: '天空云',
    label: '天空云',
    async create(_, {scene}) {
        const vs = /* glsl */ `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `;

        const fs = /* glsl */ `
          varying vec2 vUv;
          uniform sampler2D map;
          uniform float fogNear;
          uniform float fogFar;
          uniform vec3 fogColor;
          uniform int enableFog;
          
          void main(){
            if(enableFog == 1){
              float depth = gl_FragCoord.z / gl_FragCoord.w;
              float fogFactor = smoothstep(fogNear, fogFar, depth);
              gl_FragColor.w *= pow(gl_FragCoord.z, 20.0);
              gl_FragColor = mix(texture2D(map, vUv), vec4(fogColor, gl_FragColor.w), fogFactor);
            }else{
              gl_FragColor = texture2D(map, vUv);
            }
          }
        `;

        const dummy = new THREE.Object3D();
        const startTime = Date.now();
        const params = {
            count: 800,
            enableFog: true,
            fogColor: '#4584b4',
            fogNear: -100,
            fogFar: 3000,
        };

        // 加载云朵纹理
        const loader = new THREE.TextureLoader();
        const cloudTexture = await loader.loadAsync(
            `https://z2586300277.github.io/3d-file-server/` + 'images/channels/cloud.png'
        );

        // 创建几何体和材质
        const geometry = new THREE.PlaneGeometry(64, 64);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: cloudTexture },
                fogColor: { value: new THREE.Color(params.fogColor) },
                fogNear: { value: params.fogNear },
                fogFar: { value: params.fogFar },
                enableFog: { value: Number(params.enableFog) }
            },
            vertexShader: vs,
            fragmentShader: fs,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
            transparent: true,
        });

        // 创建实例化网格
        const mesh = new THREE.InstancedMesh(geometry, material, params.count);

        // 初始化实例矩阵
        for (let j = 0, k = params.count; j < k; j++) {
            dummy.position.x = createRandom(-500, 500);
            dummy.position.y = -Math.random() * Math.random() * 200 - 15;
            dummy.position.z = j;
            dummy.rotation.z = Math.random() * Math.PI;
            dummy.scale.x = dummy.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
            dummy.updateMatrix();
            mesh.setMatrixAt(j, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        // 添加动画更新
        scene.addUpdateListener(() => {
            mesh.position.z = -((Date.now() - startTime) * 0.03) % params.count;
        });

        return mesh;
    }
}

/**
 * title: Cloud Shader
 * author: wuyifan0203 https://github.com/wuyifan0203
 */
