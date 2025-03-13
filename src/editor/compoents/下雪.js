import * as THREE from "three";

// 初始参数
const initParameters = {
    particleCount: 1000,  // 粒子数量
    particleSize: 1,      // 粒子大小
    fallSpeed: 0.1,       // 下落速度
    swayFactor: 0.1,      // 摇摆幅度
    range: 100,           // 分布范围
    color: 0xffffff       // 雪花颜色
};

// 雪花类
class SnowEffect extends THREE.Object3D {
    constructor(params) {
        super();
        
        // 保存参数
        this.params = { ...params };
        
        // 创建材质
        this.material = this.createMaterial();
        
        // 创建几何体
        this.geometry = this.createGeometry();
        
        // 创建粒子系统
        this.snowMesh = new THREE.Points(this.geometry, this.material);
        this.add(this.snowMesh);
        
        // 动画控制
        this.needsUpdate = true;
    }
    
    // 创建材质
    createMaterial() {
        const material = new THREE.PointsMaterial({
            size: this.params.particleSize,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,  // 防止深度排序问题
            sizeAttenuation: true, // 粒子大小会随距离衰减
        });
        
        // 创建雪花纹理
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 绘制柔和的白色圆形
        const gradient = ctx.createRadialGradient(
            32, 32, 0, 
            32, 32, 32
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        // 创建纹理并应用到材质
        const snowTexture = new THREE.Texture(canvas);
        snowTexture.needsUpdate = true;
        material.map = snowTexture;
        material.alphaMap = snowTexture;
        
        // 着色器定制
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uColor = {
                value: new THREE.Color(this.params.color)
            };
            
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `
                #include <common>
                uniform vec3 uColor;
                `
            );
            
            // 改进片段着色器中的颜色处理
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <output_fragment>`,
                `
                #include <output_fragment>
                // 应用颜色
                gl_FragColor.rgb = uColor * gl_FragColor.a;
                
                // 平滑边缘
                float alpha = gl_FragColor.a;
                if (alpha < 0.05) discard; // 去除边缘杂点
                `
            );
            
            // 保存着色器引用，便于后续更新颜色
            this.shader = shader;
        };
        
        return material;
    }
    
    // 创建几何体
    createGeometry() {
        const geometry = new THREE.BufferGeometry();
        const { particleCount, range } = this.params;
        
        // 创建粒子位置数组
        const positions = new Float32Array(particleCount * 3);
        
        // 随机生成粒子位置
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = Math.random() * range * 2 - range;         // x
            positions[i + 1] = Math.random() * range * 2 - range;     // y
            positions[i + 2] = Math.random() * range * 2 - range;     // z
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }
    
    // 更新雪花动画
    update() {
        if (!this.needsUpdate) return;
        
        const positions = this.geometry.getAttribute('position').array;
        const { fallSpeed, swayFactor, range } = this.params;
        
        // 更新每个雪花的位置
        for (let i = 0; i < positions.length; i += 3) {
            // 下落
            positions[i + 1] -= fallSpeed;
            
            // 摇摆
            positions[i] -= Math.sin(i) * swayFactor;
            positions[i + 2] -= Math.sin(i) * swayFactor;
            
            // 当雪花落到底部时，重置到顶部
            if (positions[i + 1] < -range) {
                positions[i + 1] = range;
            }
        }
        
        // 标记几何体需要更新
        this.geometry.getAttribute('position').needsUpdate = true;
    }
    
    // 更新参数
    updateParameters() {
        // 更新粒子大小
        this.material.size = this.params.particleSize;
        
        // 更新颜色（如果着色器已编译）
        if (this.shader && this.shader.uniforms.uColor) {
            this.shader.uniforms.uColor.value.set(this.params.color);
        }
        
        // 如果没有着色器但有材质，直接设置材质颜色
        if (!this.shader && this.material) {
            this.material.color.set(this.params.color);
        }
    }
    
    // 清理资源
    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}

// 导出组件定义
export default {
    name: 'snow',
    
    label: '下雪',
    
    initParameters,
    
    // 初始化面板
    initPanel: function(folder) {
        folder.add(this.initParameters, 'particleCount', 100, 5000).step(100).name('粒子数量');
        folder.add(this.initParameters, 'particleSize', 1, 20).name('粒子大小');
        folder.add(this.initParameters, 'fallSpeed', 0.01, 1).name('下落速度');
        folder.add(this.initParameters, 'swayFactor', 0, 0.5).name('摇摆幅度');
        folder.add(this.initParameters, 'range', 10, 500).name('分布范围');
        folder.addHexColor(this.initParameters, 'color').name('雪花颜色');
    },
    
    // 创建组件
    create: function(storage, {scene}) {
        // 获取参数
        const params = { ...this.initParameters };
        
        if (storage?.params) {
            Object.assign(params, storage.params);
        }
        
        // 创建雪花效果
        const snowEffect = new SnowEffect(params);
        
        // 添加更新回调
        scene.addUpdateListener(() => {
            snowEffect.update();
        });
        
        return snowEffect;
    },
    
    // 创建参数面板
    createPanel: function(snowEffect, folder) {
        const params = snowEffect.params;
        
        // 粒子参数
        folder.add(params, 'particleCount', 100, 5000).step(100).name('粒子数量').onChange(() => {
            // 重新创建几何体
            snowEffect.geometry.dispose();
            snowEffect.geometry = snowEffect.createGeometry();
            snowEffect.snowMesh.geometry = snowEffect.geometry;
        });
        
        folder.add(params, 'particleSize', 1, 20).name('粒子大小').onChange(() => {
            snowEffect.updateParameters();
        });
        
        // 动画参数
        folder.add(params, 'fallSpeed', 0.01, 1).name('下落速度');
        folder.add(params, 'swayFactor', 0, 0.5).name('摇摆幅度');
        
        // 分布范围
        folder.add(params, 'range', 10, 500).name('分布范围').onChange(() => {
            // 重新创建几何体
            snowEffect.geometry.dispose();
            snowEffect.geometry = snowEffect.createGeometry();
            snowEffect.snowMesh.geometry = snowEffect.geometry;
        });
        
        // 颜色控制
        folder.addColorRGB(params, 'color').name('雪花颜色').onChange(() => {
            snowEffect.updateParameters();
        });
        
        // 动画开关
        folder.add(snowEffect, 'needsUpdate').name('启用动画');
    },
    
    // 获取存储数据
    getStorage: function(snowEffect) {
        return {
            params: { ...snowEffect.params },
            needsUpdate: snowEffect.needsUpdate
        };
    },
    
    // 设置存储数据
    setStorage: function(snowEffect, storage) {
        if (!storage) return;
        
        if (storage.params) {
            Object.assign(snowEffect.params, storage.params);
            
            // 更新参数
            snowEffect.updateParameters();
            
            // 重新创建几何体
            snowEffect.geometry.dispose();
            snowEffect.geometry = snowEffect.createGeometry();
            snowEffect.snowMesh.geometry = snowEffect.geometry;
        }
        
        if (storage.needsUpdate !== undefined) {
            snowEffect.needsUpdate = storage.needsUpdate;
        }
    }
};
