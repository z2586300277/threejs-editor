import * as THREE from 'three';

// 顶点着色器
const baseVertexShader = `#include <fog_pars_vertex>

varying vec2 vUv;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;

    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
}`;

// 片元着色器
const baseFragmentShader = `#include <fog_pars_fragment>

uniform float uGridThickness;
uniform vec3 uGridColor;
uniform float uCrossScale;
uniform float uCrossThickness;
uniform float uCross;
uniform vec3 uCrossColor;
uniform vec3 uFloorColor;

varying vec2 vUv;

float gridFloor(vec2 uv, vec2 lineWidth) {
    vec4 uvDDXY = vec4(dFdx(uv), dFdy(uv));
    vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));

    bool invertLine = lineWidth.x > 0.5;
    vec2 targetWidth = invertLine ? 1.0 - lineWidth : lineWidth;

    vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
    vec2 lineAA = uvDeriv * 1.5;
    
    vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
    gridUV = invertLine ? gridUV : 1.0 - gridUV;

    vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
    grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);
    grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
    grid2 = invertLine ? 1.0 - grid2 : grid2;

    float grid = mix(grid2.x, 1.0, grid2.y);
    return grid;
}

float crossFloor(vec2 uv, float scale, float thickness, float crossIntensity) {
    vec2 lineWidth = vec2(thickness);
    vec4 uvDDXY = vec4(dFdx(uv), dFdy(uv));
    vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));
    vec2 targetWidth = lineWidth;
    vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
    vec2 lineAA = uvDeriv * 1.5;
    
    float cutOffX = abs(fract(uv.y) * 2.0 - 1.0) > crossIntensity ? 1.0 : 0.0;
    float cutOffY = abs(fract(uv.x) * 2.0 - 1.0) > crossIntensity ? 1.0 : 0.0;
    float uvX = abs(fract(uv.x) * 2.0 - 1.0) + cutOffX;
    float uvY = abs(fract(uv.y) * 2.0 - 1.0) + cutOffY;
    vec2 gridUV = vec2(uvX, uvY);

    vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
    grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);
    grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));

    float grid = mix(grid2.x, 1.0, grid2.y);
    return grid;
}

void main()
{
    vec2 lineWidth = vec2(uGridThickness);
    vec2 uv = vUv * 20.0;

    float grid = gridFloor(uv, lineWidth);
    vec3 gridColor = mix(uFloorColor, uGridColor, vec3(grid));

    float crossUv = crossFloor(uv, uCrossScale, uCrossThickness, uCross);
    vec3 color = mix(gridColor, uCrossColor, vec3(crossUv));

    gl_FragColor = vec4(color, 1.0);

    #include <fog_fragment>
}`;

// 初始参数 - 美化版
const initParameters = {
    size: 50,                      // 更大的地面尺寸
    gridThickness: 0.015,          // 更细腻的网格线
    gridColor: 0x4a88ff,           // 柔和的蓝色网格
    floorColor: 0x1a2035,          // 深蓝色地面底色
    crossColor: 0x00c8ff,          // 亮青色交叉线
    crossThickness: 0.01,          // 更细的交叉线
    cross: 0.15,                   // 交叉线范围减小
    gridScale: 24,                 // 更密的网格
    fogNear: 15,                   // 远一点的雾起始
    fogFar: 80,                    // 更远的雾结束
    fogColor: 0x0a1525            // 深蓝色雾效
};

// 网格地面类
class GridFloor extends THREE.Object3D {
    constructor(params) {
        super();
        
        // 保存参数
        this.params = { ...params };
        
        // 创建几何体
        const geometry = new THREE.PlaneGeometry(
            params.size, 
            params.size, 
            32, 
            32
        );
        
        // 创建材质
        this.material = new THREE.ShaderMaterial({
            vertexShader: baseVertexShader,
            fragmentShader: baseFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            fog: true,
            uniforms: {
                // Floor
                uFloorColor: { value: new THREE.Color(params.floorColor) },
                
                // Grid
                uGridThickness: { value: params.gridThickness },
                uGridColor: { value: new THREE.Color(params.gridColor) },
                
                // Cross
                uCrossThickness: { value: params.crossThickness },
                uCross: { value: params.cross },
                uCrossColor: { value: new THREE.Color(params.crossColor) },
                
                // Fog
                fogColor: { value: new THREE.Color(params.fogColor) },
                fogNear: { value: params.fogNear },
                fogFar: { value: params.fogFar },
            }
        });
        
        // 创建网格并添加
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = Math.PI * 0.5;
        this.add(this.mesh);
    }
    
    // 更新网格地面
    updateGeometry() {
        if (this.mesh && this.mesh.geometry) {
            // 创建新几何体
            const newGeometry = new THREE.PlaneGeometry(
                this.params.size, 
                this.params.size, 
                32, 
                32
            );
            
            // 替换几何体
            this.mesh.geometry.dispose();
            this.mesh.geometry = newGeometry;
        }
    }
    
    // 更新材质
    updateUniforms() {
        if (this.material) {
            // 更新材质参数
            this.material.uniforms.uGridThickness.value = this.params.gridThickness;
            this.material.uniforms.uGridColor.value.set(this.params.gridColor);
            this.material.uniforms.uFloorColor.value.set(this.params.floorColor);
            this.material.uniforms.uCrossThickness.value = this.params.crossThickness;
            this.material.uniforms.uCross.value = this.params.cross;
            this.material.uniforms.uCrossColor.value.set(this.params.crossColor);
            this.material.uniforms.fogColor.value.set(this.params.fogColor);
            this.material.uniforms.fogNear.value = this.params.fogNear;
            this.material.uniforms.fogFar.value = this.params.fogFar;
        }
    }
    
    // 清理资源
    dispose() {
        if (this.mesh && this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }
        
        if (this.material) {
            this.material.dispose();
        }
    }
}

// 导出组件定义
export default {
    name: 'gridFloor',
    
    label: '网格地面',
    
    initParameters,
    
    // 初始化面板
    initPanel: function(folder) {
        folder.add(this.initParameters, 'size', 10, 100).name('地面尺寸');
        folder.add(this.initParameters, 'gridThickness', 0, 0.1).step(0.001).name('网格粗细');
        folder.addHexColor(this.initParameters, 'gridColor').name('网格颜色');
        folder.addHexColor(this.initParameters, 'floorColor').name('地面颜色');
        folder.addHexColor(this.initParameters, 'crossColor').name('交叉线颜色');
        folder.add(this.initParameters, 'crossThickness', 0, 0.1).step(0.001).name('交叉线粗细');
        folder.add(this.initParameters, 'cross', 0, 1).step(0.01).name('交叉线强度');
        
        // 雾效参数
        folder.addHexColor(this.initParameters, 'fogColor').name('雾颜色');
        folder.add(this.initParameters, 'fogNear', -5, 50).name('雾起始');
        folder.add(this.initParameters, 'fogFar', 10, 100).name('雾结束');
    },
    
    // 创建组件
    create: function(storage, {scene}) {
        // 获取参数
        const params = { ...this.initParameters };
        
        if (storage?.params) {
            Object.assign(params, storage.params);
        }
        
        // 创建地面
        const gridFloor = new GridFloor(params);
        
        
        return gridFloor;
    },
    
    // 创建参数面板
    createPanel: function(gridFloor, folder) {
        const { params } = gridFloor;
        
        // 地面参数
        folder.add(params, 'size', 10, 100).name('地面尺寸').onChange(() => {
            gridFloor.updateGeometry();
        });
        
        // 网格参数
        folder.add(params, 'gridThickness', 0, 0.1).step(0.001).name('网格粗细').onChange(() => {
            gridFloor.updateUniforms();
        });
        
        folder.addColorRGB(gridFloor.material.uniforms.uGridColor.value).name('网格颜色');
        folder.addColorRGB(gridFloor.material.uniforms.uFloorColor.value).name('地面颜色');
        
        // 交叉线参数
        folder.add(params, 'crossThickness', 0, 0.1).step(0.001).name('交叉线粗细').onChange(() => {
            gridFloor.updateUniforms();
        });
        
        folder.add(params, 'cross', 0, 1).step(0.01).name('交叉线强度').onChange(() => {
            gridFloor.updateUniforms();
        });
        
        folder.addColorRGB(gridFloor.material.uniforms.uCrossColor.value).name('交叉线颜色');
        
        // 雾效参数
        folder.addColorRGB(gridFloor.material.uniforms.fogColor.value).name('雾颜色').onChange(()=>{
            // 同步更新场景雾效
            if(window.threeEditor && window.threeEditor.scene.fog){
                window.threeEditor.scene.fog.color.copy(gridFloor.material.uniforms.fogColor.value);
            }
        });
        
        folder.add(params, 'fogNear', -5, 50).name('雾起始').onChange(() => {
            gridFloor.updateUniforms();
            // 同步更新场景雾效
            if(window.threeEditor && window.threeEditor.scene.fog){
                window.threeEditor.scene.fog.near = params.fogNear;
            }
        });
        
        folder.add(params, 'fogFar', 10, 100).name('雾结束').onChange(() => {
            gridFloor.updateUniforms();
            // 同步更新场景雾效
            if(window.threeEditor && window.threeEditor.scene.fog){
                window.threeEditor.scene.fog.far = params.fogFar;
            }
        });
    },
    
    // 获取存储数据
    getStorage: function(gridFloor) {
        const { material, params } = gridFloor;
        
        return {
            params: {
                ...params,
                gridColor: material.uniforms.uGridColor.value.getHex(),
                floorColor: material.uniforms.uFloorColor.value.getHex(),
                crossColor: material.uniforms.uCrossColor.value.getHex(),
                fogColor: material.uniforms.fogColor.value.getHex(),
            }
        };
    },
    
    // 设置存储数据
    setStorage: function(gridFloor, storage) {
        if (!storage) return;
        
        // 恢复参数
        if (storage.params) {
            Object.assign(gridFloor.params, storage.params);
            
            // 更新几何体和材质
            gridFloor.updateGeometry();
            gridFloor.updateUniforms();
            
            // 更新场景雾效
            if(window.threeEditor && window.threeEditor.scene){
                const scene = window.threeEditor.scene;
                
                if(scene.fog){
                    scene.fog.color.setHex(storage.params.fogColor);
                    scene.fog.near = storage.params.fogNear;
                    scene.fog.far = storage.params.fogFar;
                } else {
                    scene.fog = new THREE.Fog(
                        storage.params.fogColor,
                        storage.params.fogNear,
                        storage.params.fogFar
                    );
                }
            }
        }
    }
};
