import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export default {
    name: 'iframe',
    label: 'iframe',

    create: function (storage, { scene, transformControls }) {

        const params = {
            url: '',
            width: '1920px',
            height: '1080px',
        }

        let trans = true
        if (storage) {
            params.url = storage.url;
            params.width = storage.width;
            params.height = storage.height;
            trans = false
        }
        else params.url = window.prompt('请输入iframe的URL', 'https://z2586300277.github.io');

        const container = document.createElement("div");
        const iframe = document.createElement("iframe");
        iframe.src = params.url;
        iframe.width = params.width;
        iframe.height = params.height;
        iframe.style.backgroundColor = "white";
        iframe.style.border = "none";
        container.appendChild(iframe);

        const mesh = new CSS3DObject(container);
        mesh.add_params = params;

        if (trans) {
            container.addEventListener('click', function () {
                transformControls.attach(mesh);
            });
            setTimeout(() => {
                iframe.style.pointerEvents = 'none';
            }, 1000);
        }

        return mesh;
    },

    getStorage: function (mesh) {
        return mesh.add_params;
    },
};
