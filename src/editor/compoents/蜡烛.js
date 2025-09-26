import * as THREE from 'three'

// 火焰材质（保留原有 Shader）
function getFlameMaterial(isFrontSide) {
  const side = isFrontSide ? THREE.FrontSide : THREE.BackSide;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float hValue;
        float random (in vec2 st) {
            return fract(sin(dot(st.xy,
                                 vec2(12.9898,78.233)))
                         * 43758.5453123);
        }

        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            // Smooth Interpolation

            // Cubic Hermine Curve.  Same as SmoothStep()
            vec2 u = f*f*(3.0-2.0*f);
            // u = smoothstep(0.,1.,f);

            // Mix 4 coorners percentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          pos *= vec3(0.8, 2, 0.725);
          hValue = position.y;
          float posXZlen = length(position.xz);

          pos.y *= 1. + (cos((posXZlen + 0.25) * 3.1415926) * 0.25 + noise(vec2(0, time)) * 0.125 + noise(vec2(position.x + time, position.z + time)) * 0.5) * position.y; // flame height

          pos.x += noise(vec2(time * 2., (position.y - time) * 4.0)) * hValue * 0.0312; // flame trembling
          pos.z += noise(vec2((position.y - time) * 4.0, time * 2.)) * hValue * 0.0312; // flame trembling

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
      `,
    fragmentShader: `
        varying float hValue;
        varying vec2 vUv;

        // honestly stolen from https://www.shadertoy.com/view/4dsSzr
        vec3 heatmapGradient(float t) {
          return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
        }

        void main() {
          float v = abs(smoothstep(0.0, 0.4, hValue) - 1.);
          float alpha = (1. - v) * 0.99; // bottom transparency
          alpha -= 1. - smoothstep(1.0, 0.97, hValue); // tip transparency
          gl_FragColor = vec4(heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4), alpha) ;
          gl_FragColor.rgb = mix(vec3(0,0,1), gl_FragColor.rgb, smoothstep(0.0, 0.3, hValue)); // blueish for bottom
          gl_FragColor.rgb += vec3(1, 0.9, 0.5) * (1.25 - vUv.y); // make the midst brighter
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue)); // tip
        }
      `,
    transparent: true,
    // 关键：透明对象正确遮挡与叠加
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side
  })
}

function create(_, { scene }) {
  // 主体容器，返回给编辑器
  const group = new THREE.Group();

  // 烛台（壳体）
  const casePath = new THREE.Path();
  casePath.moveTo(0, 0);
  casePath.lineTo(0, 0);
  casePath.absarc(1.5, 0.5, 0.5, Math.PI * 1.5, Math.PI * 2);
  casePath.lineTo(2, 1.5);
  casePath.lineTo(1.99, 1.5);
  casePath.lineTo(1.9, 0.5);
  const caseGeo = new THREE.LatheGeometry(casePath.getPoints(), 64);
  const caseMat = new THREE.MeshStandardMaterial({ color: 'silver' });
  const caseMesh = new THREE.Mesh(caseGeo, caseMat);
  caseMesh.castShadow = true;

  // 石蜡
  const paraffinPath = new THREE.Path();
  paraffinPath.moveTo(0, -0.25);
  paraffinPath.lineTo(0, -0.25);
  paraffinPath.absarc(1, 0, 0.25, Math.PI * 1.5, Math.PI * 2);
  paraffinPath.lineTo(1.25, 0);
  paraffinPath.absarc(1.89, 0.1, 0.1, Math.PI * 1.5, Math.PI * 2);
  const paraffinGeo = new THREE.LatheGeometry(paraffinPath.getPoints(), 64);
  paraffinGeo.translate(0, 1.25, 0);
  const paraffinMat = new THREE.MeshStandardMaterial({ color: 0xffff99, side: THREE.BackSide, metalness: 0, roughness: 0.75 });
  const paraffinMesh = new THREE.Mesh(paraffinGeo, paraffinMat);
  caseMesh.add(paraffinMesh);

  // 烛芯
  const candlewickProfile = new THREE.Shape();
  candlewickProfile.absarc(0, 0, 0.0625, 0, Math.PI * 2);

  const candlewickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.5, -0.0625),
    new THREE.Vector3(0.25, 0.5, 0.125)
  ]);

  const candlewickGeo = new THREE.ExtrudeGeometry(candlewickProfile, {
    steps: 8,
    bevelEnabled: false,
    extrudePath: candlewickCurve
  });

  const colors = [];
  const color1 = new THREE.Color('black');
  const color2 = new THREE.Color(0x994411);
  const color3 = new THREE.Color(0xffff44);
  for (let i = 0; i < candlewickGeo.attributes.position.count; i++) {
    if (candlewickGeo.attributes.position.getY(i) < 0.4) {
      color1.toArray(colors, i * 3);
    } else {
      color2.toArray(colors, i * 3);
    }
    if (candlewickGeo.attributes.position.getY(i) < 0.15) color3.toArray(colors, i * 3);
  }
  candlewickGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  candlewickGeo.translate(0, 0.95, 0);
  const candlewickMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const candlewickMesh = new THREE.Mesh(candlewickGeo, candlewickMat);
  caseMesh.add(candlewickMesh);

  // 火焰（双面两个 mesh 叠加）
  const flameMaterials = [];
  function addFlame(isFrontSide) {
    const flameGeo = new THREE.SphereGeometry(0.5, 32, 32);
    flameGeo.translate(0, 0.5, 0);
    const flameMat = getFlameMaterial(isFrontSide);
    flameMaterials.push(flameMat);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(0.06, 1.2, 0.06);
    flameMesh.rotation.y = THREE.MathUtils.degToRad(-45);
    // 关键：背面先画、正面后画，避免透明排序问题
    flameMesh.renderOrder = isFrontSide ? 2 : 1;
    caseMesh.add(flameMesh);
  }
  addFlame(false);
  addFlame(true);

  // 烛光
  const candleLight = new THREE.PointLight(0xffaa33, 1, 5, 2);
  candleLight.position.set(0, 3, 0);
  candleLight.castShadow = true;
  caseMesh.add(candleLight);

  const candleLight2 = new THREE.PointLight(0xffaa33, 1, 10, 2);
  candleLight2.position.set(0, 4, 0);
  candleLight2.castShadow = true;
  caseMesh.add(candleLight2);

  // 底座（缩小版桌面，以免组件过大）
  const baseGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 48);
  baseGeo.translate(0, -0.1, 0);
  const baseMat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('https://z2586300277.github.io/3d-file-server/images/map/diban.jpg'),
    metalness: 0,
    roughness: 0.75
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.receiveShadow = true;

  baseMesh.add(caseMesh);
  group.add(baseMesh);

  // 动画更新（与扩散波组件同一方案）
  let t = 0;
  scene.addUpdateListener(() => {
    t += 0.01;
    // 火焰动画
    for (const m of flameMaterials) m.uniforms.time.value = t;
    // 灯光轻微抖动与闪烁
    candleLight2.position.x = Math.sin(t * Math.PI) * 0.25;
    candleLight2.position.z = Math.cos(t * Math.PI * 0.75) * 0.25;
    candleLight2.intensity = 2 + Math.sin(t * Math.PI * 2) * Math.cos(t * Math.PI * 1.5) * 0.25;
  });

  // 返回给编辑器，由编辑器负责添加到场景
  return group;
}

export default {
  name: '蜡烛',
  label: '蜡烛',
  create
}

