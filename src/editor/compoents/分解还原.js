import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

async function create(_, { scene }) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
    loader.setDRACOLoader(dracoLoader);
    const gltf = await loader.loadAsync('https://z2586300277.github.io/3d-file-server/files/model/Fox.glb');
    
    const group = new THREE.Group();
    const modelBox = new THREE.Box3().setFromObject(gltf.scene);
    const modelSize = modelBox.getSize(new THREE.Vector3());
    const maxSize = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const scaleRatio = maxSize / 100;
    
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry.clone();
            const positions = geometry.attributes.position.array.slice();
            
            // 创建动画几何体
            const animGeometry = new THREE.BufferGeometry();
            animGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
            animGeometry.setAttribute("originPosition", new THREE.BufferAttribute(new Float32Array(positions), 3));
            if (geometry.attributes.normal) {
                animGeometry.setAttribute("normal", new THREE.BufferAttribute(geometry.attributes.normal.array.slice(), 3));
            }
            if (geometry.attributes.uv) {
                animGeometry.setAttribute("uv", new THREE.BufferAttribute(geometry.attributes.uv.array.slice(), 2));
            }
            if (geometry.index) {
                animGeometry.setIndex(geometry.index.clone());
            }

            const boundingBox = new THREE.Box3().setFromBufferAttribute(animGeometry.attributes.position);
            const width = boundingBox.max.x - boundingBox.min.x;
            const faceCount = animGeometry.index ? animGeometry.index.count / 3 : animGeometry.attributes.position.count / 3;
            
            // 简化动画数据
            animGeometry.faceData = [];
            for (let i = 0; i < faceCount; i++) {
                const firstVertexIndex = animGeometry.index ? animGeometry.index.getX(i * 3) : i * 3;
                const y = animGeometry.attributes.position.getY(firstVertexIndex);
                const z = animGeometry.attributes.position.getZ(firstVertexIndex);
                const y_sign = Math.sign(y) || 1;
                const z_sign = Math.sign(z) || 1;
                
                animGeometry.faceData.push({
                    circle: 2000 + Math.random() * 1000,
                    startTime: null,
                    progress: 0,
                    control1: {
                        x: (Math.random() - 0.5) * 60 * scaleRatio, // 增加X方向扩散范围
                        y: y_sign * (Math.random() * 80 + 30) * scaleRatio, // 增加Y方向扩散范围
                        z: z_sign * (Math.random() * 60 + 20) * scaleRatio // 增加Z方向扩散范围
                    },
                    control2: {
                        x: (Math.random() - 0.5) * 45 * scaleRatio, // 增加X方向扩散范围
                        y: -y_sign * (Math.random() * 40 + 20) * scaleRatio, // 增加Y方向扩散范围
                        z: -z_sign * (Math.random() * 45 + 15) * scaleRatio // 增加Z方向扩散范围
                    }
                });
            }

            // 使用原始材质
            const originalMaterial = child.material.clone();
            const mesh = new THREE.Mesh(animGeometry, originalMaterial);
            
            // 简化线框材质
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00aaff,
                wireframe: true,
                transparent: true,
                opacity: 0
            });
            const wireframeMesh = new THREE.Mesh(animGeometry.clone(), wireframeMaterial);

            // 复制变换
            mesh.position.copy(child.position);
            mesh.rotation.copy(child.rotation);
            mesh.scale.copy(child.scale);
            wireframeMesh.position.copy(mesh.position);
            wireframeMesh.rotation.copy(mesh.rotation);
            wireframeMesh.scale.copy(mesh.scale);

            // 贝塞尔曲线函数
            const bezier = (P0, P1, P2, P3, t) => {
                const t2 = t * t, t3 = t2 * t, mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;
                return {
                    x: P0.x * mt3 + 3 * P1.x * mt2 * t + 3 * P2.x * mt * t2 + P3.x * t3,
                    y: P0.y * mt3 + 3 * P1.y * mt2 * t + 3 * P2.y * mt * t2 + P3.y * t3,
                    z: P0.z * mt3 + 3 * P1.z * mt2 * t + 3 * P2.z * mt * t2 + P3.z * t3
                };
            };

            let startTime = Date.now();
            const circle = 2500;
            
            mesh.updateAnimation = () => {
                const currentTime = Date.now();
                const progress = Math.min((currentTime - startTime) / circle, 1);
                const currX = boundingBox.min.x + width * progress;
                const isAnimating = progress > 0.1 && progress < 0.9;

                // 简化材质切换
                if (isAnimating) {
                    originalMaterial.transparent = true;
                    originalMaterial.opacity = 0.3;
                    wireframeMaterial.opacity = 0.6;
                } else {
                    originalMaterial.transparent = false;
                    originalMaterial.opacity = 1.0;
                    wireframeMaterial.opacity = 0;
                }

                // 高效面动画
                const positionAttr = animGeometry.attributes.position;
                const originAttr = animGeometry.attributes.originPosition;
                const wireframePositions = wireframeMesh.geometry.attributes.position;
                
                animGeometry.faceData.forEach((face, faceIndex) => {
                    const firstVertexIndex = animGeometry.index ? animGeometry.index.getX(faceIndex * 3) : faceIndex * 3;
                    const face_firstVertex_x = originAttr.getX(firstVertexIndex);
                    
                    if (!face.startTime && face_firstVertex_x < currX) {
                        face.startTime = currentTime;
                    }

                    if (face.startTime && face.progress < 1) {
                        face.progress = Math.min((currentTime - face.startTime) / face.circle, 1);
                        
                        // 简化缓动
                        const t = face.progress;
                        const easedProgress = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
                        
                        for (let i = 0; i < 3; i++) {
                            const vertexIndex = animGeometry.index ? animGeometry.index.getX(faceIndex * 3 + i) : faceIndex * 3 + i;
                            
                            const originX = originAttr.getX(vertexIndex);
                            const originY = originAttr.getY(vertexIndex);
                            const originZ = originAttr.getZ(vertexIndex);
                            
                            const bezierPos = bezier(
                                { x: 0, y: 0, z: 0 },
                                face.control1,
                                face.control2,
                                { x: 0, y: 0, z: 0 },
                                easedProgress
                            );
                            
                            const newX = originX + bezierPos.x;
                            const newY = originY + bezierPos.y;
                            const newZ = originZ + bezierPos.z;
                            
                            positionAttr.setXYZ(vertexIndex, newX, newY, newZ);
                            wireframePositions.setXYZ(vertexIndex, newX, newY, newZ);
                        }
                    }
                });
                
                positionAttr.needsUpdate = true;
                wireframePositions.needsUpdate = true;
            };

            mesh.resetAnimation = () => {
                startTime = Date.now();
                originalMaterial.transparent = false;
                originalMaterial.opacity = 1.0;
                wireframeMaterial.opacity = 0;
                animGeometry.faceData.forEach(face => {
                    face.startTime = null;
                    face.progress = 0;
                });
            };

            group.add(mesh);
            group.add(wireframeMesh);
        }
    });

    // 简化更新监听
    scene.addUpdateListener(() => {
        group.children.forEach(child => child.updateAnimation?.());
    });

    // 简化循环重置
    setInterval(() => {
        group.children.forEach(child => child.resetAnimation?.());
    }, 5000);

    group.position.copy(gltf.scene.position);
    group.rotation.copy(gltf.scene.rotation);
    group.scale.copy(gltf.scene.scale);

    return group;
}

export default {
    name: '分解还原',
    label: '分解还原',
    create
}
