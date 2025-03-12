import * as THREE from 'three'

// 初始参数
const initParameters = {
    count: 1000,         // 数字雨元素数量
    elementSize: 4,      // 元素大小
    range: 50,           // 分布范围
    speed: 0.05,         // 下落速度
    speedVariation: 0.1, // 速度变化
    opacity: 0.8,        // 透明度
    texturePrefix: 'https://z2586300277.github.io/3d-file-server/threeExamples/application/codeCloud/',
    randomInterval: 100  // 符号随机变化间隔(ms)
};

// 数字雨类
class CodeRain extends THREE.Object3D {
    constructor(params) {
        super();
        
        // 保存参数
        this.params = { ...params };
        
        // 创建数字雨元素容器
        this.cloudGroup = new THREE.Group();
        this.add(this.cloudGroup);
        
        // 创建材质
        this.material = this.createMaterial();
        
        // 创建数字雨元素
        this.createElements();
        
        // 设置随机定时器
        this.randomizeTimer = null;
        this.startRandomize();
        
        // 动画控制
        this.needsUpdate = true;
    }
    
    // 创建材质
    createMaterial() {
        const loader = new THREE.TextureLoader();
        const textures = {};
        
        // 加载纹理
        for (let i = 1; i <= 9; i++) {
            textures[`texture${i}`] = {
                value: loader.load(`${this.params.texturePrefix}${i}.png`)
            };
        }
        
        return new THREE.ShaderMaterial({
            uniforms: {
                ...textures,
                random: { value: Math.random() }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D texture1;
                uniform sampler2D texture2;
                uniform sampler2D texture3;
                uniform sampler2D texture4;
                uniform sampler2D texture5;
                uniform sampler2D texture6;
                uniform sampler2D texture7;
                uniform sampler2D texture8;
                uniform sampler2D texture9;
                uniform float random;
                
                void main() {
                    float selfRandom = vUv.y - fract(vUv.y);
                    float k = abs(sin(selfRandom * random)) * 10.0;
                    
                    if(k < 1.0) {
                        gl_FragColor = texture2D(texture1, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 2.0) {
                        gl_FragColor = texture2D(texture2, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 3.0) {
                        gl_FragColor = texture2D(texture3, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 4.0) {
                        gl_FragColor = texture2D(texture4, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 5.0) {
                        gl_FragColor = texture2D(texture5, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 6.0) {
                        gl_FragColor = texture2D(texture6, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 7.0) {
                        gl_FragColor = texture2D(texture7, vec2(fract(vUv.x), fract(vUv.y)));
                    } else if(k < 8.0) {
                        gl_FragColor = texture2D(texture8, vec2(fract(vUv.x), fract(vUv.y)));
                    } else {
                        gl_FragColor = texture2D(texture9, vec2(fract(vUv.x), fract(vUv.y)));
                    }
                }
            `,
            depthWrite: false,
            transparent: true,
            opacity: this.params.opacity
        });
    }
    
    // 创建数字雨元素
    createElements() {
        // 清除现有元素
        while (this.cloudGroup.children.length > 0) {
            const child = this.cloudGroup.children[0];
            child.geometry.dispose();
            this.cloudGroup.remove(child);
        }
        
        const { count, elementSize, range, speed, speedVariation } = this.params;
        
        for (let i = 0; i < count; i++) {
            // 随机位置
            const pos = new THREE.Vector3(
                Math.random() * range - range / 2,
                Math.random() * range - range / 2,
                Math.random() * range - range / 2
            );
            
            // 速度属性
            pos.vX = ((Math.random() - 0.5) / 3) / 10;
            pos.vY = -(speed + Math.random() * speedVariation) / 5;
            
            // 几何体
            const geometry = new THREE.PlaneGeometry(elementSize, elementSize);
            const s = Math.floor(Math.random() * 1000) + 1;
            geometry.attributes.uv.array = geometry.attributes.uv.array.map(e => e + s);
            
            // 网格
            const plane = new THREE.Mesh(geometry, this.material);
            plane.position.copy(pos);
            plane.userData.pos = pos;
            
            this.cloudGroup.add(plane);
        }
    }
    
    // 开始随机化
    startRandomize() {
        this.stopRandomize(); // 避免重复
        
        this.randomizeTimer = setInterval(() => {
            if (!this.needsUpdate) return;
            this.material.uniforms.random.value = Math.random();
        }, this.params.randomInterval);
    }
    
    // 停止随机化
    stopRandomize() {
        if (this.randomizeTimer) {
            clearInterval(this.randomizeTimer);
            this.randomizeTimer = null;
        }
    }
    
    // 更新函数
    update(camera) {
        if (!this.needsUpdate) return;
        
        this.cloudGroup.children.forEach(plane => {
            // 面向相机
            plane.rotation.copy(camera.rotation);
            
            // 更新位置
            const pos = plane.userData.pos;
            plane.position.y += pos.vY;
            
            // 超出范围重置
            if (plane.position.y <= -this.params.range / 2) {
                plane.position.y = this.params.range / 2;
            }
        });
    }
    
    // 清理资源
    dispose() {
        this.stopRandomize();
        
        // 清理纹理
        if (this.material && this.material.uniforms) {
            for (let i = 1; i <= 9; i++) {
                const texKey = `texture${i}`;
                if (this.material.uniforms[texKey]?.value) {
                    this.material.uniforms[texKey].value.dispose();
                }
            }
            this.material.dispose();
        }
        
        // 清理几何体
        this.cloudGroup.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
        });
    }
}

export default {
    name: 'codeRain',
    
    label: '数字雨',
    
    initParameters,
    
    // 初始化面板
    initPanel: function(folder) {
        folder.add(this.initParameters, 'count', 100, 5000).step(100).name('数量');
        folder.add(this.initParameters, 'elementSize', 1, 10).name('元素大小');
        folder.add(this.initParameters, 'range', 20, 100).name('分布范围');
        folder.add(this.initParameters, 'speed', 0.01, 0.2).name('下落速度');
        folder.add(this.initParameters, 'speedVariation', 0, 0.3).name('速度变化');
        folder.add(this.initParameters, 'opacity', 0, 1).name('透明度');
        folder.add(this.initParameters, 'randomInterval', 50, 500).step(10).name('随机间隔(ms)');
    },
    
    // 创建组件
    create: function(storage, {scene, camera}) {
        // 获取参数
        const params = { ...this.initParameters };
        
        if (storage?.params) {
            Object.assign(params, storage.params);
        }
        
        // 创建数字雨
        const codeRain = new CodeRain(params);
        
        // 添加更新回调
        scene.addUpdateListener(() => {
            codeRain.update(camera);
        });
        
        return codeRain;
    },
    
    // 创建参数面板
    createPanel: function(codeRain, folder) {
        const params = codeRain.params;
        
        // 数量和大小参数
        folder.add(params, 'count', 100, 5000).step(100).name('数量').onChange(() => {
            codeRain.createElements();
        });
        
        folder.add(params, 'elementSize', 1, 10).name('元素大小').onChange(() => {
            codeRain.createElements();
        });
        
        // 范围参数
        folder.add(params, 'range', 20, 100).name('分布范围').onChange(() => {
            codeRain.createElements();
        });
        
        // 速度参数
        folder.add(params, 'speed', 0.01, 0.2).name('下落速度');
        folder.add(params, 'speedVariation', 0, 0.3).name('速度变化');
        
        // 外观参数
        folder.add(params, 'opacity', 0, 1).name('透明度').onChange((value) => {
            codeRain.material.opacity = value;
        });
        
        folder.add(params, 'randomInterval', 50, 500).step(10).name('随机间隔(ms)').onChange((value) => {
            codeRain.stopRandomize();
            codeRain.params.randomInterval = value;
            codeRain.startRandomize();
        });
        
        // 动画开关
        folder.add(codeRain, 'needsUpdate').name('启用动画');
    },
    
    // 获取存储数据
    getStorage: function(codeRain) {
        return {
            params: { ...codeRain.params },
            needsUpdate: codeRain.needsUpdate
        };
    },
    
    // 设置存储数据
    setStorage: function(codeRain, storage) {
        if (!storage) return;
        
        if (storage.params) {
            Object.assign(codeRain.params, storage.params);
            
            // 更新透明度
            if (codeRain.material) {
                codeRain.material.opacity = storage.params.opacity;
            }
            
            // 更新元素
            codeRain.createElements();
            
            // 更新随机间隔
            codeRain.stopRandomize();
            codeRain.startRandomize();
        }
        
        if (storage.needsUpdate !== undefined) {
            codeRain.needsUpdate = storage.needsUpdate;
        }
    }
};