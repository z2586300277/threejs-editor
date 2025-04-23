import * as THREE from 'three';
import { TilesRenderer } from '3d-tiles-renderer'

export default {

    name: '3dtiles',

    label: '3dtiles模型',

    create(storage, { camera, scene, renderer }) {

        // 调用window.输入框获取用户输入的URL
        let url = ''
        if(storage?.url) url = storage.url
        else url = window.prompt('请输入3dtiles模型的URL', `https://z2586300277.github.io/3d-file-server/` + '3dtiles/house/tileset.json')
        if (!url) return

        const tilesRenderer = new TilesRenderer(url)

        tilesRenderer.setCamera(camera)

        tilesRenderer.setResolutionFromRenderer(camera, renderer)

        const model = new THREE.Group()

        model.url = url

        model.add(tilesRenderer.group)

        const box3 = new THREE.Box3()

        tilesRenderer.addEventListener('load-tile-set', () => {

            if (tilesRenderer.getBoundingBox(box3)) {

                box3.getCenter(tilesRenderer.group.position)

                tilesRenderer.group.position.multiplyScalar(-1)

            }

        })

        scene.addUpdateListener(() => {

            camera.updateMatrixWorld()

            tilesRenderer.update()

        })

        return model

    },

    getStorage: function(m) {
        return {
            url: m.url
        }
    },
    

}