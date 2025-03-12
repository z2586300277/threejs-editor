import * as THREE from 'three'

// 柱状烟花效果着色器代码
const noiseCode = `
//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}  
`;

// 初始参数
const initParameters = {
    radius: 1,
    height: 10,
    segments: 200,
    color1: 0x00ff00,
    color2: 0xff0000,
    opacity: 0.75,
    animationSpeed: 0.5
};

// SmokeFlower类
class SmokeFlower extends THREE.Object3D {
    constructor(params) {
        super();
        
        // 创建几何体
        const geometry = new THREE.CylinderGeometry(
            params.radius, 
            params.radius, 
            params.height, 
            params.segments, 
            params.segments, 
            true
        );
        
        // 材质参数
        this.uniforms = { 
            time: { value: 0 },
            color1: { value: new THREE.Color(params.color1) },
            color2: { value: new THREE.Color(params.color2) },
            animationSpeed: { value: params.animationSpeed }
        };
        
        // 创建材质
        const material = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: params.opacity,
            onBeforeCompile: shader => {
                // 添加着色器uniforms
                shader.uniforms.time = this.uniforms.time;
                shader.uniforms.color1 = this.uniforms.color1;
                shader.uniforms.color2 = this.uniforms.color2;
                shader.uniforms.animationSpeed = this.uniforms.animationSpeed;
                
                // 修改顶点着色器
                shader.vertexShader = `
                #define ss(a, b, c) smoothstep(a, b, c)
                uniform float time;
                uniform float animationSpeed;
                varying vec3 nView;
                varying vec3 nNor;
                ${noiseCode}
                vec3 getShaped(vec3 p) {
                  float curve = ss(0., 0.2, uv.y) + ss(0.5, 1., uv.y) * 2.5;
                  p.xz *= 0.75 + curve;
                  return p;
                }
                vec3 getNoised(vec3 p) {
                  float t = time * animationSpeed;
                  float n = snoise(vec4(p * 0.4 - vec3(0, t, 0), 3.14)) * (0.5 + 0.5 * uv.y);
                  p += normal * n;
                  return p;
                }
                vec3 rotY(vec3 p, float a) {
                  float s = sin(a), c = cos(a);
                  p.xz *= mat2(c, -s, s, c);
                  return p;
                }
                ${shader.vertexShader}
              `.replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                  vec3 pos = getNoised(getShaped(position));
                  vec3 pos2 = getNoised(getShaped(rotY(position, 3.1415926 * 0.001)));
                  vec3 pos3 = getNoised(getShaped(position + vec3(0., 0.001, 0.)));
                  transformed = pos;
                  nNor = normalMatrix * cross(normalize(pos2 - pos), normalize(pos3 - pos));
                `
                ).replace(
                    `#include <fog_vertex>`,
                    `#include <fog_vertex>
                  nView = normalize(mvPosition.xyz);
                `
                );
                
                // 修改片元着色器
                shader.fragmentShader = `
                #define ss(a, b, c) smoothstep(a, b, c)
                varying vec3 nView;
                varying vec3 nNor;
                uniform vec3 color1;
                uniform vec3 color2;
                ${shader.fragmentShader}
              `.replace(
                    `#include <color_fragment>`,
                    `#include <color_fragment>
                  diffuseColor.rgb = mix(color1, color2, pow(vUv.y, 2.));
                  float alpha = ss(0., 0.2, vUv.y) - ss(0.8, 1., vUv.y);
                  vec3 nor = nNor * (gl_FrontFacing ? 1. : -1.);
                  float vAlpha = abs(dot(normalize(nView), nor));
                  float angleAlpha = (1. - vAlpha) * 0.9 + 0.1;
                  float totalAlpha = clamp(alpha * 0.5 + angleAlpha * 0.5, 0., 1.) * alpha;
                  diffuseColor.rgb += vec3(1) * totalAlpha * 0.1;
                  diffuseColor.a *= totalAlpha;
                `
                );
            }
        });
        
        // 为了使用uv
        material.defines = { "USE_UV": "" };
        
        // 创建网格并添加
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
        
        // 保存参数
        this.params = params;
        this.material = material;
        this.clock = new THREE.Clock();
        this.needsUpdate = true;
    }
    
    // 更新方法
    update() {
        if (this.needsUpdate) {
            this.uniforms.time.value = this.clock.getElapsedTime();
        }
    }
}

// 导出组件定义
export default {
    name: 'smokeFlower',
    
    label: '烟花柱',
    
    initParameters,
    
    // 初始化面板
    initPanel: function(folder) {
        folder.add(this.initParameters, 'radius', 0.1, 5).name('半径');
        folder.add(this.initParameters, 'height', 1, 20).name('高度');
        folder.add(this.initParameters, 'segments', 50, 300).step(10).name('细分段数');
        folder.add(this.initParameters, 'opacity', 0, 1).name('透明度');
        folder.add(this.initParameters, 'animationSpeed', 0.1, 2).name('动画速度');
        folder.addHexColor(this.initParameters, 'color1').name('颜色1');
        folder.addHexColor(this.initParameters, 'color2').name('颜色2');
    },
    
    // 创建组件
    create: function(storage, {scene}) {
        // 获取参数
        const params = { ...this.initParameters };
        
        if (storage?.params) {
            Object.assign(params, storage.params);
        }
        
        // 创建烟花
        const smokeFlower = new SmokeFlower(params);
        
        // 添加更新回调
        scene.addUpdateListener(() => {
            smokeFlower.update();
        });
        
        return smokeFlower;
    },
    
    // 创建参数面板
    createPanel: function(smokeFlower, folder) {
        const { uniforms, params, material } = smokeFlower;
        
        // 几何参数
        folder.add(params, 'radius', 0.1, 5).name('半径').onChange(value => {
            // 需要重新创建几何体
            const newGeometry = new THREE.CylinderGeometry(
                value, value, params.height, params.segments, params.segments, true
            );
            smokeFlower.mesh.geometry.dispose();
            smokeFlower.mesh.geometry = newGeometry;
        });
        
        folder.add(params, 'height', 1, 20).name('高度').onChange(value => {
            // 需要重新创建几何体
            const newGeometry = new THREE.CylinderGeometry(
                params.radius, params.radius, value, params.segments, params.segments, true
            );
            smokeFlower.mesh.geometry.dispose();
            smokeFlower.mesh.geometry = newGeometry;
        });
        
        // 材质参数
        folder.add(material, 'opacity', 0, 1).name('透明度');
        folder.add(uniforms.animationSpeed, 'value', 0.1, 2).name('动画速度');
        folder.addColorRGB(uniforms.color1.value).name('颜色1');
        folder.addColorRGB(uniforms.color2.value).name('颜色2');
        
        // 动画控制
        folder.add(smokeFlower, 'needsUpdate').name('启用动画');
    },
    
    // 获取存储数据
    getStorage: function(smokeFlower) {
        const { uniforms, params, needsUpdate } = smokeFlower;
        
        return {
            params: {
                ...params,
                color1: uniforms.color1.value.getHex(),
                color2: uniforms.color2.value.getHex(),
                opacity: smokeFlower.material.opacity,
                animationSpeed: uniforms.animationSpeed.value
            },
            needsUpdate
        };
    },
    
    // 设置存储数据
    setStorage: function(smokeFlower, storage) {
        if (!storage) return;
        
        // 恢复参数
        if (storage.params) {
            Object.assign(smokeFlower.params, storage.params);
            
            // 更新颜色
            smokeFlower.uniforms.color1.value.setHex(storage.params.color1);
            smokeFlower.uniforms.color2.value.setHex(storage.params.color2);
            
            // 更新透明度
            smokeFlower.material.opacity = storage.params.opacity;
            
            // 更新动画速度
            smokeFlower.uniforms.animationSpeed.value = storage.params.animationSpeed;
        }
        
        // 恢复动画状态
        if (storage.needsUpdate !== undefined) {
            smokeFlower.needsUpdate = storage.needsUpdate;
        }
    }
};