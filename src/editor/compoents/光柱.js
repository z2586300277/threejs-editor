import * as THREE from 'three'

// 组件开发参考示例 
export default {

    name: 'lightColumn',

    label: '光柱',

    // 只针对必要初始传参
    initParameters: {

        url: 'https://z2586300277.github.io/3d-file-server/images/channels/lightMap.png',

        size: 0.25,

    },

    // 只针对必要初始传参面板
    initPanel: function (folder) {

        folder.add(this.initParameters, 'url').name('资源路径')

        folder.add(this.initParameters, 'size').name('立柱尺寸')

    },

    /* 没有初始必要参数的话一般不使用storage */
    create: function (storage) {
        
        // 获取初始参数 只针对初始参数还原
        const initPrarams = { 
            
            size: storage?.initParameters?.size || this.initParameters.size,

            url: storage?.initParameters?.url || this.initParameters.url

        }

        // 创建mesh
        const geometry = new THREE.CylinderGeometry(initPrarams.size || 0.3, initPrarams.size || 0.3, 20, 6)

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random(), transparent: true, opacity: 0.5, side: THREE.DoubleSide })

        const mesh = new THREE.Mesh(geometry, material)

        material.blending = THREE.AdditiveBlending

        // 创建纹理
        const texture = new THREE.TextureLoader().load(initPrarams.url)

        texture.wrapS = THREE.RepeatWrapping

        texture.wrapT = THREE.RepeatWrapping

        // 创建平面
        const plane = new THREE.PlaneGeometry(1.5, 20)

        const planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, side: THREE.DoubleSide, map: texture })

        planeMaterial.blending = THREE.AdditiveBlending

        planeMaterial.depthTest = false

        const planeMesh = new THREE.Mesh(plane, planeMaterial)

        const planeMesh2 = planeMesh.clone()

        planeMesh2.rotation.y = Math.PI / 3

        const planeMesh3 = planeMesh.clone()

        planeMesh3.rotation.y = -Math.PI / 3

        mesh.add(planeMesh3)

        mesh.add(planeMesh)

        mesh.add(planeMesh2)

        mesh.position.y = 10

        // 创建group
        const group = new THREE.Group()

        group.RootMaterials = [material, planeMaterial]

        group.add(mesh)

        group.initParameters = initPrarams

        return group

    },

    createPanel(group, folder) {

        const [material, planeMaterial] = group.RootMaterials

        folder.add(group.initParameters, 'url').name('资源路径')

        folder.addHexColor(material.color).name('立柱颜色')

        folder.add(material, 'opacity', 0, 1).name('立柱透明度')

        folder.addHexColor(planeMaterial.color).name('面颜色')

        folder.add(planeMaterial, 'opacity', 0, 1).name('面透明度')

        folder.addFn(() => {

            const { url } = group.initParameters

            if (!url) return

            const texture = new THREE.TextureLoader().load(url)

            texture.wrapS = THREE.RepeatWrapping

            texture.wrapT = THREE.RepeatWrapping

            group.children[0].children.forEach(mesh => {

                mesh.material.map = texture

            })

        }).name('更新贴图')

    },

    getStorage: function (group) {

        const { initParameters } = group

        const [material, planeMaterial] = group.RootMaterials

        return {

            initParameters,

            RootMaterials: [

                {

                    color: material.color.getHex(),

                    opacity: material.opacity

                },

                {

                    color: planeMaterial.color.getHex(),

                    opacity: planeMaterial.opacity

                }

            ]

        }

    },

    setStorage: function (group, storage) {

        if (!storage) return

        const [material, planeMaterial] = group.RootMaterials

        const [materialStorage, planeMaterialStorage] = storage.RootMaterials

        material.color.setHex(materialStorage.color)

        material.opacity = materialStorage.opacity

        planeMaterial.color.setHex(planeMaterialStorage.color)

        planeMaterial.opacity = planeMaterialStorage.opacity

    }

}