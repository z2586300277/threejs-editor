import * as THREE from "three";

export default {
    name: '魔法阵',
    label: '魔法阵',
    create(_, {scene}) {
        // 魔法阵参数
        const height = 2;
        const circleRadius = 1;
        const circleRotateSpeed = 0.02;
        const ringRadius = 0.5;
        const ringScaleOffset = 0.01;
        const ringRotateSpeed = 0.01;
        const particlesMinSize = 0.04;
        const particlesMaxSize = 0.15;
        const particlesRangeRadius = 0.8;
        const particlesFloatSpeed = 0.01;

        // 存储动画对象
        const circle = [];
        const ring1 = [];
        const ring2 = [];
        const particles = [];

        const _url = `https://z2586300277.github.io/3d-file-server/` + 'threeExamples/application/magicCircle/';
        const point1Texture = new THREE.TextureLoader().load(_url + 'point1.png');
        const point2Texture = new THREE.TextureLoader().load(_url + 'point2.png');
        const point3Texture = new THREE.TextureLoader().load(_url + 'point3.png');
        const point4Texture = new THREE.TextureLoader().load(_url + 'point4.png');
        const magicTexture = new THREE.TextureLoader().load(_url + 'magic.png');
        const guangyunTexture = new THREE.TextureLoader().load(_url + 'guangyun.png');

        const pointTextures = [point1Texture, point2Texture, point3Texture, point4Texture];

        const group = new THREE.Group();

        // 创建圆形底面
        const circleGeo = new THREE.CircleGeometry(circleRadius, 64);
        const circleMat = new THREE.MeshBasicMaterial({
            map: magicTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const circleObj = new THREE.Mesh(circleGeo, circleMat);
        circleObj.rotateX(-Math.PI / 2);
        circle.push(circleObj);
        group.add(circleObj);

        // 创建光环几何体
        const getCylinderGeo = (radius = 1, height = 1, segment = 64) => {
            const bottomPos = [];
            const topPos = [];
            const bottomUvs = [];
            const topUvs = [];
            const angleOffset = (Math.PI * 2) / segment;
            const uvOffset = 1 / (segment - 1);
            
            for (let i = 0; i < segment; i++) {
                const x = Math.cos(angleOffset * i) * radius;
                const z = Math.sin(angleOffset * i) * radius;
                bottomPos.push(x, 0, z);
                topPos.push(x, height, z);
                bottomUvs.push(i * uvOffset, 0);
                topUvs.push(i * uvOffset, 1);
            }
            
            const positions = bottomPos.concat(topPos);
            const uvs = bottomUvs.concat(topUvs);
            const index = [];
            
            for (let i = 0; i < segment; i++) {
                if (i != segment - 1) {
                    index.push(i + segment + 1, i, i + segment);
                    index.push(i, i + segment + 1, i + 1);
                }
                else {
                    index.push(segment, i, i + segment);
                    index.push(i, segment, 0);
                }
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
            geo.setIndex(new THREE.BufferAttribute(new Uint16Array(index), 1));
            return geo;
        };

        // 创建光环
        const ringGeo = getCylinderGeo(ringRadius, height);
        const ringMat = new THREE.MeshBasicMaterial({
            map: guangyunTexture,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false,
            depthWrite: false
        });
        
        const ring1Obj = new THREE.Mesh(ringGeo, ringMat);
        ring1.push(ring1Obj);
        group.add(ring1Obj);

        const ring2Obj = ring1Obj.clone();
        ring2Obj.userData.ringScaleOffset = ringScaleOffset;
        group.add(ring2Obj);
        ring2.push(ring2Obj);

        // 创建粒子
        const getParticles = (radius, height, texture, pointMinSize, pointMaxSize, pointFloatSpeed) => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
            const material = new THREE.PointsMaterial({
                size: Math.random() * (pointMaxSize - pointMinSize) + pointMinSize,
                map: texture,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.8
            });
            const particlesObj = new THREE.Points(geometry, material);
            particlesObj.userData.floatSpeed = 0.001 + Math.random() * pointFloatSpeed;
            particlesObj.userData.radius = radius;
            particlesObj.position.x = Math.random() * radius * 2 - radius;
            particlesObj.position.y = Math.random() * height;
            particlesObj.position.z = Math.random() * radius * 2 - radius;
            return particlesObj;
        };

        // 创建多个粒子
        for (let j = 0; j < 10; j++) {
            for (let i = 0; i < pointTextures.length; i++) {
                const particlesObj = getParticles(particlesRangeRadius, height, pointTextures[i], particlesMinSize, particlesMaxSize, particlesFloatSpeed);
                particles.push(particlesObj);
                group.add(particlesObj);
            }
        }

        // 添加动画更新
        scene.addUpdateListener(() => {
            // 更新圆形底面
            for (let i = 0; i < circle.length; i++) {
                circle[i].rotateZ(circleRotateSpeed);
            }

            // 更新光环
            for (let i = 0; i < ring1.length; i++) {
                ring1[i].rotateY(ringRotateSpeed);
            }
            for (let i = 0; i < ring2.length; i++) {
                ring2[i].rotateY(-ringRotateSpeed);
                if (ring2[i].scale.x < 0.9 || ring2[i].scale.x > 1.4) {
                    ring2[i].userData.ringScaleOffset *= -1;
                }
                ring2[i].scale.x -= ring2[i].userData.ringScaleOffset;
                ring2[i].scale.z -= ring2[i].userData.ringScaleOffset;
            }

            // 更新粒子
            for (let i = 0; i < particles.length; i++) {
                particles[i].position.y += particles[i].userData.floatSpeed;
                if (particles[i].position.y >= height) {
                    particles[i].position.y = 0;
                    particles[i].position.x = Math.random() * particles[i].userData.radius * 2 - particles[i].userData.radius;
                    particles[i].position.z = Math.random() * particles[i].userData.radius * 2 - particles[i].userData.radius;
                    particles[i].userData.floatSpeed = 0.001 + Math.random() * particlesFloatSpeed;
                }
            }
        });

        return group;
    }
}
