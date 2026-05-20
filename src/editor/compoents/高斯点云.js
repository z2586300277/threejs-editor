import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { ElMessageBox } from 'element-plus'

export default {
    name: '高斯点云',
    label: '高斯点云',
    async create(storage, { scene, camera, renderer }) {

        if (!scene.spark) {
            scene.spark = new SparkRenderer({ renderer });
            scene.add(scene.spark);
        }

        const params = { url: `https://z2586300277.github.io/3d-file-server/` + 'other/deskFlower.ksplat' }
        if (storage?.url) {
            params.url = storage.url;
        }
        else {
            try {
                const { value } = await ElMessageBox.prompt('请输入iframe的URL', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValue: params.url,
                    inputPattern: /^https?:\/\/.+/,
                    inputErrorMessage: '请输入有效的URL地址',
                    closeOnClickModal: false
                });
                params.url = value;
            } catch {
                return null; // 用户取消输入
            }
        }

        const butterfly = new SplatMesh(params);
        butterfly.quaternion.set(1, 0, 0, 0);
        butterfly.url = params.url;

        return butterfly;

    },
    getStorage: function (mesh) {
        return { url: mesh.url };
    },

}