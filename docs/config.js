window.editorJsons = [
    'editorJson/优雅永不过时.json',
    'editorJson/B站视频配置.json',
    'editorJson/地图.json',
    'editorJson/标签编辑.json',
    'editorJson/地空盒.json',
    'editorJson/草原追逐.json',
    'editorJson/车展.json',
    'editorJson/机房.json',
    'editorJson/胜利的导弹.json',
    'editorJson/数字飞机.json',
    'editorJson/draw.json',
    'editorJson/animous.json',
    'editorJson/几何体.json',
    'editorJson/关爱地球.json',
    'editorJson/复制物体.json',
    'editorJson/城市效果.json',
]

window.models = [
    'https://z2586300277.github.io/three-editor/dist/files/resource/datacenter.glb',
    'https://z2586300277.github.io/3d-file-server/files/model/elegant.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/computer.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/daodan.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/feiji.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/gongren.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/leida.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/plane.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/robot.glb',
    'https://z2586300277.github.io/3d-file-server/models/glb/wajueji.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/LittlestTokyo.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/Soldier.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/aroundBuilding.FBX',
    'https://z2586300277.github.io/three-editor/dist/files/resource/foorGround.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/car.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/tree.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/bird.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/bird2.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/bird3.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/Fox.glb',
    'https://z2586300277.github.io/three-editor/dist/files/resource/shanghai.FBX',
]

// 页脚链接配置
window.footerLinks = {
    left: [
        { text: "🍂GitHub", url: "https://github.com/z2586300277/threejs-editor" } ,

        { text: "⚡直接下载", url: "https://pan.quark.cn/s/bda85de79f2b"}
    ],
    right: [
        { text: "🍃组件案例", url: "https://z2586300277.github.io/three-cesium-examples" },
        
        { text: "🍁文档主页", url: "https://z2586300277.github.io/three-editor/docs/dist/" }
    ]
};

// 版权信息
window.copyright = "©2025 2586300277@qq.com All Rights Reserved.";

// 创建dom - 精简版
document.addEventListener('DOMContentLoaded', function () {
    // 创建容器
    const leftFooter = document.createElement('div');
    leftFooter.className = 'footer-links left-footer';

    const rightFooter = document.createElement('div');
    rightFooter.className = 'footer-links right-footer';

    const copyright = document.createElement('div');
    copyright.className = 'copyright';
    copyright.textContent = window.copyright;

    // 生成链接
    if (window.footerLinks.left) {
        window.footerLinks.left.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.textContent = link.text;
            leftFooter.appendChild(a);
        });
    }

    if (window.footerLinks.right) {
        window.footerLinks.right.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.textContent = link.text;
            rightFooter.appendChild(a);
        });
    }

    // 添加到页面
    document.body.appendChild(leftFooter);
    document.body.appendChild(rightFooter);
    document.body.appendChild(copyright);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .footer-links {
            position: fixed;
            bottom: 12px;
            z-index: 1000;
            display: flex;
            gap: 12px;
        }
        
        .left-footer { left: 10px; }
        .right-footer { right: 10px; }
        
        .footer-links a {
            color: #a8d4fd;
            text-decoration: none;
            font-size: 14px;
            opacity: 0.8;
            transition: all 0.3s;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        .footer-links a:hover {
            opacity: 1;
            transform: translateY(-2px);
        }
        
        .copyright {
            position: fixed;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            color: #888;
            font-size: 12px;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
});