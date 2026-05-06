import { ElMessageBox } from 'element-plus'
import * as THREE from 'three';

export default {
    name: '全景视频',
    label: '全景视频',

    create: async function (storage, { scene, transformControls }) {


        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.src = `https://z2586300277.github.io/3d-file-server/` + 'video/vr.mp4'

        if (storage?.src) {
            video.src = storage.src;
        }
        else {
            try {
                const { value } = await ElMessageBox.prompt('请输入iframe的URL', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValue: video.src,
                    inputPattern: /^https?:\/\/.+/,
                    inputErrorMessage: '请输入有效的URL地址',
                    closeOnClickModal: false
                });
                video.src = value;
            } catch {
                return null; // 用户取消输入
            }
        }
        video.loop = true
        video.muted = true
        video.play()

        const texture = new THREE.VideoTexture(video)
        const geometry = new THREE.SphereGeometry(10000, 64, 32)

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        })

        const mesh = new THREE.Mesh(geometry, material)

        return mesh;
    },

    getStorage: function (mesh) {
        return { src: mesh.material.map.image.src };
    },
};
