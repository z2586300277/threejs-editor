import * as THREE from 'three';

export default {
    name: '精灵图标',
    label: '精灵图标',
    create(storage) {
        const group = new THREE.Group();
        group.name = '精灵图标';

        const arr = ['https://z2586300277.github.io/three-cesium-examples/files/author/nmxg.jpg', 'https://z2586300277.github.io/site.png', 'https://z2586300277.github.io/three-cesium-examples/files/author/flowers-10.jpg']
        let IMAGE_URL = arr[Math.floor(Math.random() * arr.length)];
        if (storage?.url) IMAGE_URL = storage.url;
        group.url = IMAGE_URL;
        const TEXT = '精灵文字';

        function makeCombinedSprite(text, imageUrl) {
            // 统一用 512x512，利于缩放清晰
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            function draw(img) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 文本区域高度（顶部）(增大字体并上移位置)
                const textAreaH = 150; // 原120 -> 150 给大字体空间
                ctx.save();
                ctx.font = 'bold 110px "Microsoft YaHei", sans-serif'; // 原80 -> 110
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.7)';
                ctx.shadowBlur = 18; // 略增
                ctx.lineWidth = 7; // 对应字号加粗
                ctx.strokeStyle = '#00c8ff';
                ctx.fillStyle = '#ffffff';
                const textY = textAreaH / 2 - 10; // 上移 (原 +8)
                ctx.strokeText(text, canvas.width / 2, textY);
                ctx.fillText(text, canvas.width / 2, textY);
                ctx.restore();

                // 画图片（在下方区域垂直/水平居中）
                if (img) {
                    const availH = canvas.height - textAreaH - 10; // 调整底部间距
                    const availW = canvas.width - 80;
                    const imgRatio = img.width / img.height;
                    let drawW = availW;
                    let drawH = drawW / imgRatio;
                    if (drawH > availH) { drawH = availH; drawW = drawH * imgRatio; }
                    const dx = (canvas.width - drawW) / 2;
                    const dy = textAreaH + (availH - drawH) / 2;
                    ctx.save();
                    const ir = 30;
                    ctx.beginPath();
                    ctx.moveTo(dx + ir, dy);
                    ctx.lineTo(dx + drawW - ir, dy);
                    ctx.quadraticCurveTo(dx + drawW, dy, dx + drawW, dy + ir);
                    ctx.lineTo(dx + drawW, dy + drawH - ir);
                    ctx.quadraticCurveTo(dx + drawW, dy + drawH, dx + drawW - ir, dy + drawH);
                    ctx.lineTo(dx + ir, dy + drawH);
                    ctx.quadraticCurveTo(dx, dy + drawH, dx, dy + drawH - ir);
                    ctx.lineTo(dx, dy + ir);
                    ctx.quadraticCurveTo(dx, dy, dx + ir, dy);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(img, dx, dy, drawW, drawH);
                    ctx.restore();
                }
            }

            // 先占位绘制
            draw();

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(material);
            sprite.name = 'combinedSprite';
            // 统一宽度 6，根据画布宽高比做等比
            const targetWidth = 6;
            const aspect = canvas.height / canvas.width; // 1
            sprite.scale.set(targetWidth, targetWidth * aspect, 1);

            // 加载图片后重绘
            const loader = new THREE.TextureLoader();
            loader.load(imageUrl, (tex) => {
                const img = tex.image;
                draw(img);
                texture.needsUpdate = true;
            });

            return sprite;
        }

        const combined = makeCombinedSprite(TEXT, IMAGE_URL);
        combined.renderOrder = 10;
        group.add(combined);
        return group;
    },

    getStorage: function (m) {
        return {
            url: m.url
        }
    }

}