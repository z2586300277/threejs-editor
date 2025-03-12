import * as THREE from 'three'

// 初始参数
const initParameters = {
    size: 50,
    count: 100000,
    bladeWidth: 0.1,
    bladeHeight: 0.8,
    bladeHeightVariation: 0.6,
    bladeVertexCount: 5,
    bladeTipOffset: 0.1,
    cloudTextureUrl: 'https://z2586300277.github.io/3d-file-server/threeExamples/shader/cloud.jpg',
    offsetX: 0.5,
    offsetY: 0.3,
    groundColor: 0x33994d
}

// 插值函数
function interpolate(val, oldMin, oldMax, newMin, newMax) {
    return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
}

// 草几何体类
class GrassGeometry extends THREE.BufferGeometry {
    constructor(params) {
        super()
        
        const { 
            size, 
            count, 
            bladeWidth, 
            bladeHeight, 
            bladeHeightVariation, 
            bladeVertexCount, 
            bladeTipOffset 
        } = params
        
        const positions = []
        const uvs = []
        const indices = []

        for (let i = 0; i < count; i++) {
            const surfaceMin = (size / 2) * -1
            const surfaceMax = size / 2
            const radius = (size / 2) * Math.random()
            const theta = Math.random() * 2 * Math.PI

            const x = radius * Math.cos(theta)
            const y = radius * Math.sin(theta)

            uvs.push(
                ...Array.from({ length: bladeVertexCount }).flatMap(() => [
                    interpolate(x, surfaceMin, surfaceMax, 0, 1),
                    interpolate(y, surfaceMin, surfaceMax, 0, 1)
                ])
            )

            const blade = this.computeBlade([x, 0, y], i, params)
            positions.push(...blade.positions)
            indices.push(...blade.indices)
        }

        this.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        )
        this.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
        this.setIndex(indices)
        this.computeVertexNormals()
    }

    // 计算草叶
    computeBlade(center, index = 0, params) {
        const { 
            bladeWidth,
            bladeHeight, 
            bladeHeightVariation, 
            bladeVertexCount, 
            bladeTipOffset
        } = params
        
        const height = bladeHeight + Math.random() * bladeHeightVariation
        const vIndex = index * bladeVertexCount

        // 随机草叶方向和弯曲角度
        const yaw = Math.random() * Math.PI * 2
        const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
        const bend = Math.random() * Math.PI * 2
        const bendVec = [Math.sin(bend), 0, -Math.cos(bend)]

        // 计算底部、中部和顶部顶点
        const bl = yawVec.map((n, i) => n * (bladeWidth / 2) * 1 + center[i])
        const br = yawVec.map((n, i) => n * (bladeWidth / 2) * -1 + center[i])
        const tl = yawVec.map((n, i) => n * (bladeWidth / 4) * 1 + center[i])
        const tr = yawVec.map((n, i) => n * (bladeWidth / 4) * -1 + center[i])
        const tc = bendVec.map((n, i) => n * bladeTipOffset + center[i])

        // 调整高度
        tl[1] += height / 2
        tr[1] += height / 2
        tc[1] += height

        return {
            positions: [...bl, ...br, ...tr, ...tl, ...tc],
            indices: [
                vIndex,
                vIndex + 1,
                vIndex + 2,
                vIndex + 2,
                vIndex + 4,
                vIndex + 3,
                vIndex + 3,
                vIndex,
                vIndex + 2
            ]
        }
    }
}

// 草类
class Grass extends THREE.Object3D {
    constructor(params) {
        super()
        
        // 加载云纹理
        const cloudTexture = new THREE.TextureLoader().load(params.cloudTextureUrl)
        cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping
        
        // 创建着色器材质
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uCloud: { value: cloudTexture },
                offsetX: { value: params.offsetX },
                offsetY: { value: params.offsetY },
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(params.groundColor) }
            },
            side: THREE.DoubleSide,
            vertexShader: `
                uniform float uTime;
                uniform float offsetX;
                uniform float offsetY;
              
                varying vec3 vPosition;
                varying vec2 vUv;
                varying vec3 vNormal;
              
                float wave(float waveSize, float tipDistance, float centerDistance) {
                  // Tip is the fifth vertex drawn per blade
                  bool isTip = (gl_VertexID + 1) % 5 == 0;
              
                  float waveDistance = isTip ? tipDistance : centerDistance;
                  return sin((uTime / 500.0) + waveSize) * waveDistance;
                }
              
                void main() {
                  vPosition = position;
                  vUv = uv;
                  
                  // Cloud shadow move
                  vUv.x += uTime * 0.0001 * offsetX;
                  vUv.y += uTime * 0.0001 * offsetY;
              
                  vNormal = normalize(normalMatrix * normal);
                  if (vPosition.y < 0.0) {
                    vPosition.y = 0.0;
                  } else {
                    vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);      
                  }
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uCloud;
                uniform float uTime;
                uniform vec3 uColor;
                varying vec3 vPosition;
                varying vec2 vUv;
                varying vec3 vNormal;
              
                void main() {
                  vec3 color = mix(uColor * 0.7, uColor, vPosition.y);
                  color = mix(color, texture2D(uCloud, vUv).rgb, 0.4);
                  float lighting = normalize(dot(vNormal, vec3(10)));
                  gl_FragColor = vec4(color + lighting * 0.03, 1.0);
                }
            `
        })
        
        // 创建草几何体
        const geometry = new GrassGeometry(params)
        const grassMesh = new THREE.Mesh(geometry, material)
        this.add(grassMesh)
        
        // 创建地面
        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(params.size / 2, 8).rotateX(Math.PI / 2),
            material
        )
        floor.position.y = -Number.EPSILON
        this.add(floor)
        
        // 保存参数和材质引用
        this.params = params
        this.material = material
    }
    
    // 更新动画
    update(time) {
        if (this.material) {
            this.material.uniforms.uTime.value = time
        }
    }
}

export default {
    name: 'grass',
    
    label: '草地',
    
    initParameters,
    
    initPanel: function(folder) {
        folder.add(this.initParameters, 'size', 10, 100).name('草地尺寸')
        folder.add(this.initParameters, 'count', 1000, 200000).step(1000).name('草叶数量')
        folder.add(this.initParameters, 'bladeWidth', 0.01, 0.5).name('草叶宽度')
        folder.add(this.initParameters, 'bladeHeight', 0.1, 2).name('草叶高度')
        folder.add(this.initParameters, 'bladeHeightVariation', 0, 1).name('高度变化')
        folder.add(this.initParameters, 'bladeTipOffset', 0, 0.5).name('尖端偏移')
        folder.add(this.initParameters, 'offsetX', 0, 1).name('云纹理X偏移')
        folder.add(this.initParameters, 'offsetY', 0, 1).name('云纹理Y偏移')
        folder.add(this.initParameters, 'cloudTextureUrl').name('云纹理URL')
        folder.addHexColor(this.initParameters, 'groundColor').name('地面颜色')
    },
    
    create: function(storage, {scene}) {
        // 获取参数
        const params = { ...this.initParameters }
        
        if (storage?.params) {
            Object.assign(params, storage.params)
        }
        
        // 创建草地
        const grass = new Grass(params)

        let time = 0

        scene.addUpdateListener(() => {
            time += 10
            grass.update(time)
        })
        
        // 标记为需要动画更新
        grass.needsUpdate = true
        
        return grass
    },
    
    createPanel: function(grass, folder) {
        const { material, params } = grass
        
        // 基本参数
        folder.add(params, 'size', 10, 100).name('草地尺寸')
        
        // 动画参数
        folder.add(material.uniforms.offsetX, 'value', 0, 1).name('云纹理X偏移')
        folder.add(material.uniforms.offsetY, 'value', 0, 1).name('云纹理Y偏移')
        
        // 颜色控制
        folder.addHexColor(material.uniforms.uColor.value).name('地面颜色')
        
        // 云纹理更新
        folder.add(params, 'cloudTextureUrl').name('云纹理URL')
        folder.addFn(() => {
            const texture = new THREE.TextureLoader().load(params.cloudTextureUrl)
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
            material.uniforms.uCloud.value = texture
        }).name('更新纹理')
        
        // 动画开关
        folder.add(grass, 'needsUpdate').name('启用动画')
    },
    
    getStorage: function(grass) {
        const { material, params } = grass
        
        return {
            params: { ...params },
            materialData: {
                offsetX: material.uniforms.offsetX.value,
                offsetY: material.uniforms.offsetY.value,
                color: material.uniforms.uColor.value.getHex(),
                needsUpdate: grass.needsUpdate
            }
        }
    },
    
    setStorage: function(grass, storage) {
        if (!storage) return
        
        // 恢复参数
        if (storage.params) {
            Object.assign(grass.params, storage.params)
        }
        
        // 恢复材质数据
        if (storage.materialData) {
            const { material } = grass
            const { offsetX, offsetY, color, needsUpdate } = storage.materialData
            
            material.uniforms.offsetX.value = offsetX
            material.uniforms.offsetY.value = offsetY
            material.uniforms.uColor.value.setHex(color)
            grass.needsUpdate = needsUpdate
        }
    }
    
}
