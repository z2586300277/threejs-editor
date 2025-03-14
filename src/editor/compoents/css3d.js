import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// 导出组件定义
export default {
    name: '3D 标签',

    label: '3D 标签',

    // 创建组件
    create: function (storage, { scene, transformControls }) {
        // 创建根 div
        const container = document.createElement("div");

        // 设置随机图片
        const img = document.createElement("img");
        img.src = 'https://z2586300277.github.io/three-cesium-examples/files/author/z2586300277.png'
        img.style.width = "60px";
        img.style.pointerEvents = "auto";
        img.style.height = "60px";

        const params = {
            text: Math.random().toString(36).slice(2, 4) + '-Three-Editor',
            fontSize: Math.floor(Math.random() * 20 + 20) + "px",
            color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
            blod: Math.random() > 0.5 ? 'bold' : 'normal',
        }

        if (storage) {
            params.text = storage.text;
            params.fontSize = storage.fontSize;
            params.color = storage.color;
            params.blod = storage.blod;
        }

        const tip = document.createElement("div");
        tip.textContent = '点击图片选中';
        tip.style.color = '#fff';
        tip.style.fontSize = '12px';

        // 设置随机文字
        const text = document.createElement("span");
        text.textContent = params.text;
        text.style.fontSize = params.fontSize;
        text.style.color = params.color;
        text.style.fontWeight = params.blod;

        container.appendChild(tip);
        container.appendChild(img);
        container.appendChild(text);

        const mesh = new CSS3DObject(container);
        mesh.add_params = params;

        container.addEventListener('click', function () {
            transformControls.attach(mesh);
        });

        setTimeout(() => {
            container.style.pointerEvents = 'none';
        }, 1000);
        return mesh
    },

    getStorage: function (mesh) {
        return mesh.add_params;
    },

};
