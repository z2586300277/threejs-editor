import * as THREE from 'three'
function createRuler() {

    const group = new THREE.Group()

    const start = new THREE.Vector3(-10, 0, 0)
    const end = new THREE.Vector3(10, 0, 0)
    const distance = start.distanceTo(end)

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }))
    group.add(line)

    for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const pos = new THREE.Vector3().lerpVectors(start, end, t)
        const height = i % 5 === 0 ? 1 : 0.5

        const tickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pos.x, 0, 0),
            new THREE.Vector3(pos.x, height, 0)
        ])
        const tick = new THREE.Line(tickGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }))
        group.add(tick)

        if (i % 5 === 0) {
            const text = i + 'cm'
            const s = createText(text, pos.x, height + 1, 0)
            group.add(s)
        }

    }

    const creatL = function () {

        const start = new THREE.Vector3(-10, 3, 0)
        const end = new THREE.Vector3(10, 3, 0)

        // 主线段（虚线）
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end])
        const lineMaterial = new THREE.LineDashedMaterial({
            color: 0xffffff,
            dashSize: 0.5,
            gapSize: 0.3
        })
        const line = new THREE.Line(lineGeometry, lineMaterial)
        line.computeLineDistances()
        group.add(line)

        // 左箭头（实心三角形）
        const leftArrowGeometry = new THREE.BufferGeometry()
        const leftVertices = new Float32Array([
            start.x, start.y, start.z,
            start.x + 0.5, start.y - 0.3, start.z,
            start.x + 0.5, start.y + 0.3, start.z
        ])
        leftArrowGeometry.setAttribute('position', new THREE.BufferAttribute(leftVertices, 3))
        const leftArrowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide  // 确保两面都可见
        })
        const leftArrowMesh = new THREE.Mesh(leftArrowGeometry, leftArrowMaterial)
        group.add(leftArrowMesh)

        // 右箭头（实心三角形）
        const rightArrowGeometry = new THREE.BufferGeometry()
        const rightVertices = new Float32Array([
            end.x, end.y, end.z,
            end.x - 0.5, end.y + 0.3, end.z,
            end.x - 0.5, end.y - 0.3, end.z
        ])
        rightArrowGeometry.setAttribute('position', new THREE.BufferAttribute(rightVertices, 3))
        const rightArrowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide  // 确保两面都可见
        })
        const rightArrowMesh = new THREE.Mesh(rightArrowGeometry, rightArrowMaterial)
        group.add(rightArrowMesh)

        // 距离标注
        const center = new THREE.Vector3().lerpVectors(start, end, 0.5)
        const s = createText('20cm', center.x, center.y + 1, center.z)
        group.add(s)

    }

    creatL()

    return group
}

function createText(text, x, y, z) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 128
    canvas.height = 64

    ctx.font = '20px Arial'
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.textAlign = 'center'
    ctx.fillText(text, 64, 40)

    const texture = new THREE.CanvasTexture(canvas)
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }))
    sprite.position.set(x, y, z)
    sprite.scale.set(2, 1, 1)
    return sprite
}

export default {
    name: '刻度轴',
    label: '刻度轴',
    create: createRuler
}