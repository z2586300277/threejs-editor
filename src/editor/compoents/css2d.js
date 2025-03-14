import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 导出组件定义
export default {
    name: '2D标签',

    label: '2D标签',

    // 创建组件
    create: function (storage, { transformControls }) {
        // 创建根容器
        const container = document.createElement("div");
        container.style.width = "200px";
        container.style.padding = "12px";
        container.style.borderRadius = "8px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.gap = "8px";
        container.style.border = "1px solid rgba(120, 120, 120, 0.5)";
        
        // 初始参数
        const params = {
            text: storage?.text || Math.random().toString(36).slice(2, 4) + '-Three-Editor',
            fontSize: storage?.fontSize || Math.floor(Math.random() * 8 + 16) + "px",
            color: storage?.color || '#' + Math.floor(Math.random() * 0xffffff).toString(16),
            bold: storage?.bold || Math.random() > 0.5 ? 'bold' : 'normal',
            editMode: false
        };
        
        // 添加标题栏
        const titleBar = document.createElement("div");
        titleBar.style.width = "100%";
        titleBar.style.display = "flex";
        titleBar.style.justifyContent = "space-between";
        titleBar.style.alignItems = "center";
        titleBar.style.marginBottom = "5px";
        container.appendChild(titleBar);
        
        // 标题文本
        const titleText = document.createElement("span");
        titleText.textContent = "编辑标签";
        titleText.style.fontSize = "12px";
        titleText.style.fontWeight = "bold";
        titleText.style.color = "#a8d4fd";
        titleBar.appendChild(titleText);
        
        // 按钮组
        const buttonGroup = document.createElement("div");
        buttonGroup.style.display = "flex";
        buttonGroup.style.gap = "6px";
        titleBar.appendChild(buttonGroup);
        
        // 编辑按钮
        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.title = "编辑文字";
        editBtn.style.pointerEvents = "auto";
        editBtn.style.border = "none";
        editBtn.style.background = "none";
        editBtn.style.cursor = "pointer";
        editBtn.style.fontSize = "12px";
        buttonGroup.appendChild(editBtn);
        
        // 设置头像/图片
        const imgContainer = document.createElement("div");
        imgContainer.style.pointerEvents = "auto";
        imgContainer.style.width = "64px";
        imgContainer.style.height = "64px";
        imgContainer.style.borderRadius = "50%";
        imgContainer.style.overflow = "hidden";
        imgContainer.style.border = "2px solid rgba(168, 212, 253, 0.5)";
        imgContainer.style.cursor = "pointer";
        container.appendChild(imgContainer);
        
        const img = document.createElement("img");
        img.src = storage?.imgSrc || 'https://z2586300277.github.io/three-cesium-examples/files/author/z2586300277.png';
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        imgContainer.appendChild(img);
        
        // 图片点击事件 - 附加到变换控制器
        imgContainer.addEventListener('click', function() {
            transformControls.attach(mesh);
        });
        
        // 文本显示区域
        const textDisplay = document.createElement("div");
        textDisplay.style.textAlign = "center";
        textDisplay.style.width = "100%";
        container.appendChild(textDisplay);
        
        // 显示的文本
        const textSpan = document.createElement("span");
        textSpan.textContent = params.text;
        textSpan.style.fontSize = params.fontSize;
        textSpan.style.color = params.color;
        textSpan.style.fontWeight = params.bold;
        textDisplay.appendChild(textSpan);
        
        // 文本编辑区域 (初始隐藏)
        const textEditor = document.createElement("div");
        textEditor.style.width = "100%";
        textEditor.style.display = "none";
        textEditor.style.flexDirection = "column";
        textEditor.style.gap = "8px";
        container.appendChild(textEditor);
        
        // 文本输入框
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.value = params.text;
        textInput.style.pointerEvents = "auto";
        textInput.style.width = "100%";
        textInput.style.padding = "5px 8px";
        textInput.style.border = "1px solid rgba(168, 212, 253, 0.5)";
        textInput.style.borderRadius = "4px";
        textInput.style.backgroundColor = "rgba(40, 40, 40, 0.7)";
        textInput.style.color = "#fff";
        textInput.style.fontSize = "14px";
        textInput.style.outline = "none";
        textInput.style.boxSizing = "border-box";
        textEditor.appendChild(textInput);
        
        // 按钮栏
        const buttonBar = document.createElement("div");
        buttonBar.style.display = "flex";
        buttonBar.style.justifyContent = "flex-end";
        buttonBar.style.gap = "8px";
        textEditor.appendChild(buttonBar);
        
        // 取消按钮
        const cancelBtn = document.createElement("button");
        cancelBtn.style.pointerEvents = "auto";
        cancelBtn.textContent = "取消";
        cancelBtn.style.padding = "4px 8px";
        cancelBtn.style.border = "none";
        cancelBtn.style.borderRadius = "4px";
        cancelBtn.style.backgroundColor = "#555";
        cancelBtn.style.color = "#fff";
        cancelBtn.style.cursor = "pointer";
        cancelBtn.style.fontSize = "12px";
        buttonBar.appendChild(cancelBtn);
        
        // 确认按钮
        const confirmBtn = document.createElement("button");
        confirmBtn.style.pointerEvents = "auto";
        confirmBtn.textContent = "确认";
        confirmBtn.style.padding = "4px 8px";
        confirmBtn.style.border = "none";
        confirmBtn.style.borderRadius = "4px";
        confirmBtn.style.backgroundColor = "#3a7eff";
        confirmBtn.style.color = "#fff";
        confirmBtn.style.cursor = "pointer";
        confirmBtn.style.fontSize = "12px";
        buttonBar.appendChild(confirmBtn);
        
        // 提示信息
        const helpText = document.createElement("div");
        helpText.textContent = '点击图片选中控制';
        helpText.style.fontSize = '11px';
        helpText.style.color = 'rgba(255, 255, 255, 0.6)';
        helpText.style.marginTop = "5px";
        helpText.style.textAlign = "center";
        container.appendChild(helpText);
        
        // 编辑按钮点击事件
        editBtn.addEventListener('click', function() {
            params.editMode = true;
            textDisplay.style.display = "none";
            textEditor.style.display = "flex";
            textInput.focus();
            textInput.select();
        });
        
        // 取消按钮点击事件
        cancelBtn.addEventListener('click', function() {
            params.editMode = false;
            textEditor.style.display = "none";
            textDisplay.style.display = "block";
            textInput.value = params.text;
        });
        
        // 确认按钮点击事件
        confirmBtn.addEventListener('click', function() {
            params.text = textInput.value;
            textSpan.textContent = params.text;
            params.editMode = false;
            textEditor.style.display = "none";
            textDisplay.style.display = "block";
        });
        
        // 构建CSS2D对象
        const mesh = new CSS2DObject(container);
        
        // 存储参数
        mesh.userData.params = params;
        
        // 输入框按回车确认
        textInput.addEventListener('keyup', function(event) {
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
