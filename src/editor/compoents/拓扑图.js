import * as THREE from "three"

async function create(_, { scene }) {
    const arr = [
        { id: 1, name: '电脑', color: 0x38c9d8, level: 1, coord: [0, 0], line: [2, 3, 4, 5, 13] },
        { id: 2, name: '主机', level: 1, color: 0x3021c1, coord: [2, 1], line: [6, 7, 8, 9, 10, 11] },
        { id: 3, name: '显示器', level: 1, color: 0x3021c1, coord: [2, 2], line: [9] },
        { id: 4, name: '键盘', level: 1, color: 0x3021c1, coord: [2, -2], line: [6] },
        { id: 5, name: '鼠标', level: 1, color: 0x3021c1, coord: [2, 3], line: [] },
        { id: 6, name: '主板', level: 1, color: 0xffe0a1, coord: [4, -1], line: [] },
        { id: 7, name: '硬盘', level: 1, color: 0xffe0a1, coord: [4, -2], line: [] },
        { id: 8, name: '显卡', level: 1, color: 0xffe0a1, coord: [4, -3], line: [] },
        { id: 9, name: '屏幕', level: 1, color: 0xffe0a1, coord: [4, 2], line: [] },
        { id: 10, name: 'CPU', level: 1, color: 0xffe0a1, coord: [4, 1], line: [] },
        { id: 11, name: '内存条', level: 1, color: 0xffe0a1, coord: [4, 0], line: [12] },
        { id: 12, name: '测试', level: 1, color: 0xff6b9d, coord: [6, 0], line: [] },
        { id: 13, name: '测试', level: 2, color: 0xff6b9d, coord: [7, 5], line: [] },
    ]

    const arr2 = [
        [2, 3, 5],
        [6, 7, 8, 9, 10, 11]
    ]

    const options = { xzScale: 10, meshScale: 5, flowDirection: 'right', fontSize: 1.5, textHeight: 0 }
    const { xzScale, meshScale } = options

    // 创建组
    const group = new THREE.Group()
    group.position.set(0, 0, 0)

    // 添加环境光照
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    group.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(50, 50, 50)
    group.add(directionalLight)

    // 优化网格辅助，使用更现代的样式
    const grid = new THREE.GridHelper(20 * xzScale, xzScale, 0x00ffff, 0x444444)
    group.add(grid)
    grid.material.opacity = 0.3
    grid.material.transparent = true

    // 添加发光的底面
    const floorGeometry = new THREE.PlaneGeometry(20 * xzScale, 20 * xzScale)
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x001122,
        transparent: true,
        opacity: 0.1,
        emissive: 0x001122,
        emissiveIntensity: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.1
    group.add(floor)

    // 遍历节点，创建更美观的节点
    const boxArr = arr.map((i, k) => {
        const box = createBoxNode(meshScale, xzScale, i)
        group.add(box)
        return box
    })

    // 创建连接线
    boxArr.forEach((i, k) => {
        const { line } = i.info
        line.map((id, z) => {
            const mesh = boxArr.find(j => j.info.id === id)
            if (mesh) try {
                const flowLine = createFlowLine(i.position, mesh.position, { ...options, radius: 0.15, color: i.info.color })
                group.add(flowLine)
            } catch (e) { }
        })
    })

    // 创建容器
    arr2.forEach((i, k) => {
        const positions = i.map(j => boxArr.find(z => z.info.id === j).position)
        const mesh = createContainerNode(positions, meshScale)
        group.add(mesh)
    })

    /* 创建容器 - 更美观的容器样式 */
    function createContainerNode(positions, meshScale) {
        const max = ['x', 'y', 'z'].map(i => Math.max(...positions.map(j => j[i])))
        const min = ['x', 'y', 'z'].map(i => Math.min(...positions.map(j => j[i])))
        const [width, height, depth] = max.map((i, k) => Math.abs(i - min[k])).map(i => i + meshScale * 2.5)
        
        // 创建圆角立方体容器
        const geometry = new THREE.BoxGeometry(width, height + 2, depth)
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00aaff,
            transparent: true, 
            opacity: 0.15,
            emissive: 0x003366,
            emissiveIntensity: 0.3
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.renderOrder = 1
        mesh.position.set((max[0] + min[0]) / 2, (max[1] + min[1]) / 2 + 1, (max[2] + min[2]) / 2)
        
        // 添加边框线
        const edges = new THREE.EdgesGeometry(geometry)
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.6 
        })
        const wireframe = new THREE.LineSegments(edges, lineMaterial)
        mesh.add(wireframe)
        
        return mesh
    }

    /* 创建立方体节点 - 更美观的节点样式 */
    function createBoxNode(meshScale, xzScale, i) {
        const { coord } = i
        
        // 创建主体几何体 - 使用圆角立方体效果
        const geometry = new THREE.BoxGeometry(meshScale, meshScale, meshScale, 2, 2, 2)
        geometry.computeVertexNormals()
        
        // 创建渐变材质效果
        const material = new THREE.MeshPhongMaterial({ 
            color: i.color,
            emissive: new THREE.Color(i.color).multiplyScalar(0.3),
            emissiveIntensity: 0.4,
            shininess: 120,
            specular: 0xffffff,
            transparent: true,
            opacity: 0.9
        })
        
        const box = new THREE.Mesh(geometry, material)
        box.position.set(coord[0] * xzScale, meshScale / 2, coord[1] * xzScale)
        box.info = i
        
        // 创建多层发光效果
        const glowGeometry1 = new THREE.BoxGeometry(meshScale * 1.2, meshScale * 1.2, meshScale * 1.2)
        const glowMaterial1 = new THREE.MeshBasicMaterial({
            color: i.color,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        })
        const glow1 = new THREE.Mesh(glowGeometry1, glowMaterial1)
        
        const glowGeometry2 = new THREE.BoxGeometry(meshScale * 1.4, meshScale * 1.4, meshScale * 1.4)
        const glowMaterial2 = new THREE.MeshBasicMaterial({
            color: new THREE.Color(i.color).multiplyScalar(0.7),
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        })
        const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2)
        
        box.add(glow1, glow2)

        // 添加装饰性边框
        const edgesGeometry = new THREE.EdgesGeometry(geometry)
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(i.color).multiplyScalar(1.5),
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        })
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
        box.add(edges)

        // 添加中心发光点
        const coreGeometry = new THREE.SphereGeometry(meshScale * 0.15, 8, 6)
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        })
        const core = new THREE.Mesh(coreGeometry, coreMaterial)
        core.position.y = meshScale * 0.3
        box.add(core)

        // 添加浮动粒子效果
        const particleCount = 6
        const particleGeometry = new THREE.BufferGeometry()
        const particlePositions = new Float32Array(particleCount * 3)
        const particleColors = new Float32Array(particleCount * 3)
        
        for (let j = 0; j < particleCount; j++) {
            const radius = meshScale * 0.8
            const angle = (j / particleCount) * Math.PI * 2
            particlePositions[j * 3] = Math.cos(angle) * radius
            particlePositions[j * 3 + 1] = meshScale * 0.6
            particlePositions[j * 3 + 2] = Math.sin(angle) * radius
            
            const color = new THREE.Color(i.color).multiplyScalar(1.2)
            particleColors[j * 3] = color.r
            particleColors[j * 3 + 1] = color.g
            particleColors[j * 3 + 2] = color.b
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        })
        
        const particles = new THREE.Points(particleGeometry, particleMaterial)
        box.add(particles)

        // 添加悬浮动画数据
        box.userData = { 
            originalY: meshScale / 2,
            animOffset: Math.random() * Math.PI * 2,
            particleOffset: Math.random() * Math.PI * 2
        }

        return box
    }

    /* 创建流程线 - 更美观的连接线 */
    function createFlowLine(p1, p2, options = {}) {
        const { meshScale, flowDirection } = options
        let p3
        if (flowDirection === 'right') p3 = new THREE.Vector3(p1.x, p1.y, p2.z)
        else p3 = new THREE.Vector3(p2.x, p1.y, p1.z)
        const distance = p3.distanceTo(p2)
        const p4 = p3.clone().lerp(p2, (distance - meshScale * 0.8) / distance)

        // 创建曲线
        const curve = new THREE.CatmullRomCurve3([p1, p3, p3.clone().multiplyScalar(1.001), p4])
        const { radius, segments, color, radialSegments } = options
        
        // 创建流动贴图
        const map = new THREE.TextureLoader().load(`https://z2586300277.github.io/3d-file-server/images/texture/flyLine1.png`)
        map.wrapS = THREE.RepeatWrapping
        map.wrapT = THREE.RepeatWrapping
        map.repeat.set(5, 2)
        
        // 主管道 - 使用流动贴图
        const geometry = new THREE.TubeGeometry(curve, segments || 100, radius || 0.5, radialSegments || 8, false)
        const material = new THREE.MeshBasicMaterial({ 
            map: map,
            color: new THREE.Color(color || 0x00ff00).multiplyScalar(1.2),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        })
        const mesh = new THREE.Mesh(geometry, material)

        // 发光外层
        const glowGeometry = new THREE.TubeGeometry(curve, 50, (radius || 0.5) * 1.5, 8, false)
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color || 0x00ff00,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        })
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)

        // 创建更美观的箭头
        const arrowGeometry = new THREE.ConeGeometry((radius || 0.5) * 3, meshScale * 0.6, radialSegments || 8)
        const arrowMaterial = new THREE.MeshPhongMaterial({ 
            color: color || 0x00ff00,
            emissive: new THREE.Color(color || 0x00ff00).multiplyScalar(0.3),
            emissiveIntensity: 0.5,
            shininess: 100
        })
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
        arrow.position.copy(p4)
        const { quaternion } = getDirectionQuaternion(p4, p2)
        arrow.quaternion.copy(quaternion)

        // 创建流动粒子效果
        const particleCount = 20
        const particleGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount
            const point = curve.getPoint(t)
            positions[i * 3] = point.x
            positions[i * 3 + 1] = point.y
            positions[i * 3 + 2] = point.z
            
            const particleColor = new THREE.Color(color || 0x00ff00)
            colors[i * 3] = particleColor.r
            colors[i * 3 + 1] = particleColor.g
            colors[i * 3 + 2] = particleColor.b
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        })
        
        const particles = new THREE.Points(particleGeometry, particleMaterial)

        // 创建组
        const flowGroup = new THREE.Group()
        flowGroup.add(glowMesh)
        flowGroup.add(mesh)
        flowGroup.add(arrow)
        flowGroup.add(particles)
        
        // 添加动画数据
        flowGroup.userData = { curve, particleCount, flowTexture: map }

        return flowGroup
    }

    function getDirectionQuaternion(start, end) {
        const direction = new THREE.Vector3()
        direction.subVectors(end, start).normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        return { quaternion }
    }

    // 添加动画循环
    const animate = () => {
        const time = Date.now() * 0.001

        // 节点悬浮动画
        boxArr.forEach(box => {
            if (box.userData) {
                // 悬浮动画
                box.position.y = box.userData.originalY + Math.sin(time + box.userData.animOffset) * 0.3
                
                // 缓慢旋转
                box.rotation.y = time * 0.15 + box.userData.animOffset
                
                // 发光效果脉冲
                const glows = box.children.filter(child => child.material && child.material.blending === THREE.AdditiveBlending)
                glows.forEach((glow, index) => {
                    if (glow.type === 'Mesh') {
                        const intensity = 0.1 + Math.sin(time * 1.5 + box.userData.animOffset + index) * 0.05
                        glow.material.opacity = intensity
                    }
                })
                
                // 中心发光点脉冲
                const core = box.children.find(child => child.geometry && child.geometry.type === 'SphereGeometry')
                if (core) {
                    core.material.opacity = 0.7 + Math.sin(time * 3 + box.userData.animOffset) * 0.2
                    core.scale.setScalar(1 + Math.sin(time * 2 + box.userData.animOffset) * 0.3)
                }
                
                // 粒子旋转动画
                const particles = box.children.find(child => child.type === 'Points')
                if (particles) {
                    particles.rotation.y = time * 0.5 + box.userData.particleOffset
                    const positions = particles.geometry.attributes.position.array
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i + 1] = box.userData.originalY + Math.sin(time * 2 + i + box.userData.particleOffset) * 0.2
                    }
                    particles.geometry.attributes.position.needsUpdate = true
                }
                
                // 边框线条发光
                const edges = box.children.find(child => child.type === 'LineSegments')
                if (edges) {
                    edges.material.opacity = 0.6 + Math.sin(time * 2 + box.userData.animOffset) * 0.2
                }
            }
        })

        // 连接线流动动画
        group.children.forEach(child => {
            if (child.userData && child.userData.curve) {
                // 贴图流动效果
                if (child.userData.flowTexture) {
                    child.userData.flowTexture.offset.x = -time * 0.5
                }
                
                // 粒子流动效果
                const particles = child.children.find(c => c.type === 'Points')
                if (particles) {
                    const positions = particles.geometry.attributes.position.array
                    for (let i = 0; i < child.userData.particleCount; i++) {
                        const t = ((time * 0.3 + i / child.userData.particleCount) % 1)
                        const point = child.userData.curve.getPoint(t)
                        positions[i * 3] = point.x
                        positions[i * 3 + 1] = point.y
                        positions[i * 3 + 2] = point.z
                    }
                    particles.geometry.attributes.position.needsUpdate = true
                }
                
                // 发光层脉冲效果
                const glowMesh = child.children.find(c => c.type === 'Mesh' && c.material.blending === THREE.AdditiveBlending)
                if (glowMesh && glowMesh !== child.children.find(c => c.userData && c.userData.flowTexture)) {
                    glowMesh.material.opacity = 0.2 + Math.sin(time * 2) * 0.1
                }
            }
        })
    }

    // 添加到场景更新循环
    scene.addUpdateListener(animate)

    return group
}

export default {
    name: '拓扑图',
    label: '拓扑图',
    create
}

