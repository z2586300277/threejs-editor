import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 导出组件定义
export default {
    name: '2D链接',
    label: '2D链接',

    // 创建组件
    create: function (storage, { transformControls }) {
        // 初始参数
        const params = {
            text: storage?.text || '🏠主页',
            fontSize: storage?.fontSize || Math.floor(Math.random() * 8 + 16) + "px",
            color: '#bedfff',
            bold: 'normal',
            editMode: false,
            url: storage?.url ||'https://z2586300277.github.io',
            imgSrc: storage?.imgSrc || 'https://z2586300277.github.io/three-cesium-examples/files/author/z2586300277.png'
        };
        
        // 创建根容器
        const container = document.createElement("div");
        // container.style.width = "200px";
        container.style.borderRadius = "8px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.gap = "8px";
        
        // 使用innerHTML设置内容
        container.innerHTML = `
            <!-- 标题栏 -->
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; color:#b1b1b1;">点图控制</span>
                <div style="display:flex; gap:6px;">
                    <button id="editBtn" title="编辑文字" style="pointer-events:auto; border:none; background:none; cursor:pointer; font-size:12px;">✏️</button>
                </div>
            </div>
            
            <div style="display:flex;justify-content:center;align-items:center;">
             <!-- 图片容器 -->
            <div id="imgContainer" style="pointer-events:auto; width:64px; height:64px; cursor:pointer;">
                <img src="${params.imgSrc}" style="width:100%; height:100%; object-fit:scale-down;">
            </div>
            
            <!-- 文本显示区域 -->
            <div id="textDisplay" style="text-align:center; width:100%;pointer-events:auto;cursor:pointer;">
                <a id="textSpan"  target="_blank" href="${params.url}" style="font-size:${params.fontSize}; color:${params.color}; font-weight:${params.bold};">${params.text}</a>
            </div>
            </div>
            
            <!-- 文本编辑区域 (初始隐藏) -->
            <div id="textEditor" style="width:100%; display:none; flex-direction:column; gap:8px;">
                <input id="textInput" type="text" value="${params.text}" style="pointer-events:auto; width:100%; padding:5px 8px; border:1px solid rgba(168, 212, 253, 0.5); border-radius:4px; background-color:rgba(40, 40, 40, 0.7); color:#fff; font-size:14px; outline:none; box-sizing:border-box;">
                
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button id="cancelBtn" style="pointer-events:auto; padding:4px 8px; border:none; border-radius:4px; background-color:#555; color:#fff; cursor:pointer; font-size:12px;">取消</button>
                    <button id="confirmBtn" style="pointer-events:auto; padding:4px 8px; border:none; border-radius:4px; background-color:#3a7eff; color:#fff; cursor:pointer; font-size:12px;">确认</button>
                </div>
            </div>
        `;
        
        // 获取DOM元素引用
        const imgContainer = container.querySelector('#imgContainer');
        const editBtn = container.querySelector('#editBtn');
        const textDisplay = container.querySelector('#textDisplay');
        const textSpan = container.querySelector('#textSpan');
        const textEditor = container.querySelector('#textEditor');
        const textInput = container.querySelector('#textInput');
        const cancelBtn = container.querySelector('#cancelBtn');
        const confirmBtn = container.querySelector('#confirmBtn');
        
        // 构建CSS2D对象
        const mesh = new CSS2DObject(container);
        
        // 存储参数
        mesh.userData.params = params;
        
        // 图片点击事件 - 附加到变换控制器
        imgContainer.addEventListener('click', () => transformControls.attach(mesh));
        
        // 编辑按钮点击事件
        editBtn.addEventListener('click', () => {
            params.editMode = true;
            textDisplay.style.display = "none";
            textEditor.style.display = "flex";
            textInput.value = params.text + '——' + params.url
            textInput.focus();
            textInput.select();
        });
        
        // 取消按钮点击事件
        cancelBtn.addEventListener('click', () => {
            params.editMode = false;
            textEditor.style.display = "none";
            textDisplay.style.display = "block";
            textInput.value = params.text;
        });
        
        // 确认按钮点击事件
        confirmBtn.addEventListener('click', () => {
            params.text = textInput.value.split('——')[0];
            textSpan.textContent = params.text;
            if(textInput.value.split('——')[1]){
                params.url = textInput.value.split('——')[1];
                textSpan.href = params.url;
            }
            params.editMode = false;
            textEditor.style.display = "none";
            textDisplay.style.display = "block";
        });
        
        // 输入框按回车确认
        textInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                confirmBtn.click();
            }
        });
        
        return mesh;
    },
    
    // 获取存储数据
    getStorage: function(mesh) {
        return mesh.userData.params;
    },
};
