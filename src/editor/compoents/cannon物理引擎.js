import * as THREE from 'three'
import * as CANNON from 'cannon-es'

function createPhysicsBody(PhysicsWorld, model, mass) {
    const box = new THREE.Box3().setFromObject(model);
    const { max, min } = box
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 根据几何体类型创建对应的物理形状
    let shape;
    if (model.geometry.type === 'SphereGeometry') {
        const radius = Math.max((max.x - min.x) / 2, (max.y - min.y) / 2, (max.z - min.z) / 2);
        shape = new CANNON.Sphere(radius);
    } else if (model.geometry.type === 'CylinderGeometry') {
        const radiusTop = (max.x - min.x) / 2;
        const radiusBottom = (max.x - min.x) / 2;
        const height = max.y - min.y;
        shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
    } else {
        // 默认使用Box形状
        shape = new CANNON.Box(new CANNON.Vec3((max.x - min.x) / 2, (max.y - min.y) / 2, (max.z - min.z) / 2));
    }

    // 创建物理材料，增加弹性
    const material = new CANNON.Material({
        friction: 0.3,        // 摩擦力
        restitution: 0.8      // 弹性系数，0-1之间，1表示完全弹性碰撞
    });

    const body = new CANNON.Body({
        mass: mass,
        shape: shape,
        position: center,
        material: material
    })

    body.position.copy(model.position)
    PhysicsWorld.addBody(body)
    body.render = () => {
        model.position.copy(body.position)
        model.quaternion.copy(body.quaternion)  // 同步旋转
    }
}

async function create(_, { scene, DOM }) {
    const group = new THREE.Group()
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })

    // 创建地面材料
    const groundMaterial = new CANNON.Material({
        friction: 0.4,
        restitution: 0.6  // 地面也有一定弹性
    });

    // 渲染时间略有不同的时间显示物理模拟的状态
    world.PhysicsRender = (deltaTime) => {

        world.step(1 / 60, deltaTime, 3)

        world.bodies.forEach(body => body.render?.())

    }

    // 创建一个立方体
    setInterval(() => {

        const count = Math.floor(Math.random() * 8) + 1

        const gem = ['BoxGeometry', 'SphereGeometry', 'IcosahedronGeometry', 'CylinderGeometry', 'TorusGeometry', 'DodecahedronGeometry', 'OctahedronGeometry']

        // 随机获取几何体
        const getGeometry = () => {

            const type = gem[Math.floor(Math.random() * gem.length)]

            return new THREE[type]()

        }

        for (let i = 0; i < count; i++) {

            const cubeGeometry = getGeometry()

            const cubeMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.5, metalness: 0.5 })

            const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)

            cubeMesh.position.set((Math.random() - 0.5) * 5, 8, (Math.random() - 0.5) * 5)  // 增加高度

            cubeMesh.scale.setScalar(Math.random() * 0.2 + 0.3)  // 调整缩放范围，减小差距：0.3-0.5

            createPhysicsBody(world, cubeMesh, 1)

            group.add(cubeMesh)

        }

    }, 1000)

    // 创建一个平面
    const planeGeometry = new THREE.PlaneGeometry(20, 20)

    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5 })

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

    planeMesh.rotation.x = Math.PI / 2

    // 为地面创建特殊的物理体
    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: groundMaterial
    });
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(planeBody);
    planeBody.render = () => {
        planeMesh.position.copy(planeBody.position);
        planeMesh.quaternion.copy(planeBody.quaternion);
    }

    group.add(planeMesh)

    scene.addUpdateListener(() => world.PhysicsRender())

    return group

}

export default {
    name: 'cannon物理引擎',
    label: 'cannon物理引擎',
    create
}