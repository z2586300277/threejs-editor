import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

export default {
    name: '水雾',
    label: '水雾',
    create(_, { scene }) {


        // 可配置参数
        const config = {
            particleCount: 3000,
            particleSize: 1.2,
            width: 12,
            depth: 2,
            height: 15,
            riseSpeed: 0.4,
            spread: 0.3,
            turbulence: 0.3,
            density: 0.4,
        }

        const uniforms = {
            time: { value: 0 },
            baseColor: { value: new THREE.Color(0xffffff) },
            height: { value: config.height },
            turbulence: { value: config.turbulence },
            density: { value: config.density },
        }

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute float size;
        attribute float phase;
        attribute vec3 velocity;
        uniform float time;
        uniform float height;
        uniform float turbulence;
        varying float vAlpha;
        varying float vAge;
        void main() {
            float age = mod(time * 0.3 + phase, 1.0);
            vAge = age;
            vec3 pos = position + velocity * age * height;
            pos.x += sin(age * 8.0 + phase * 20.0) * turbulence * (0.5 + age);
            pos.z += cos(age * 6.0 + phase * 15.0) * turbulence * (0.3 + age * 0.5);
            pos.x *= (1.0 + age * 1.5);
            pos.z *= (1.0 + age * 0.8);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * (1.0 + age * 3.0) * (250.0 / -mvPosition.z);
            float fadeIn = smoothstep(0.0, 0.1, age);
            float fadeOut = 1.0 - smoothstep(0.6, 1.0, age);
            vAlpha = fadeIn * fadeOut;
            #include <logdepthbuf_vertex>
        }
    `,
            fragmentShader: `
        #include <common>
        #include <logdepthbuf_pars_fragment>
        uniform vec3 baseColor;
        uniform float density;
        varying float vAlpha;
        varying float vAge;
        void main() {
            float dist = length(gl_PointCoord - 0.5) * 2.0;
            if (dist > 1.0) discard;
            float edge = 1.0 - smoothstep(0.3, 1.0, dist);
            vec3 color = mix(baseColor, vec3(0.85, 0.88, 0.92), vAge * 0.3);
            float alpha = vAlpha * edge * density;
            gl_FragColor = vec4(color * alpha, alpha);
            #include <logdepthbuf_fragment>
        }
    `,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            transparent: true,
        })

        function buildGeometry() {
            const geo = new THREE.BufferGeometry()
            const positions = [], sizes = [], phases = [], velocities = []
            for (let i = 0; i < config.particleCount; i++) {
                positions.push(
                    (Math.random() - 0.5) * config.width,
                    Math.random() * 0.3,
                    (Math.random() - 0.5) * config.depth
                )
                sizes.push(config.particleSize * (0.6 + Math.random() * 0.8))
                phases.push(Math.random())
                velocities.push(
                    (Math.random() - 0.5) * config.spread,
                    config.riseSpeed * (0.8 + Math.random() * 0.4),
                    (Math.random() - 0.5) * config.spread * 0.5
                )
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
            geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
            geo.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
            geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3))
            return geo
        }

        const steam = new THREE.Points(buildGeometry(), material)
        steam.renderOrder = 999
        steam.frustumCulled = false

        // const gui = new GUI()
        // gui.add(config, 'height', 5, 30).name('上升高度').onChange(v => uniforms.height.value = v)
        // gui.add(config, 'turbulence', 0, 1).name('湍流强度').onChange(v => uniforms.turbulence.value = v)
        // gui.add(config, 'density', 0.1, 1).name('浓度').onChange(v => uniforms.density.value = v)
        // gui.add(config, 'width', 1, 20).name('喷口宽度').onChange(() => { steam.geometry.dispose(); steam.geometry = buildGeometry() })
        // gui.add(config, 'depth', 0.5, 10).name('喷口深度').onChange(() => { steam.geometry.dispose(); steam.geometry = buildGeometry() })
        // gui.add(config, 'riseSpeed', 0.1, 1).name('上升速度').onChange(() => { steam.geometry.dispose(); steam.geometry = buildGeometry() })
        // gui.add(config, 'particleCount', 500, 8000, 500).name('粒子数量').onChange(() => { steam.geometry.dispose(); steam.geometry = buildGeometry() })
        // gui.add(config, 'particleSize', 0.3, 3).name('粒子大小').onChange(() => { steam.geometry.dispose(); steam.geometry = buildGeometry() })
        // gui.addColor({ color: '#ffffff' }, 'color').name('蒸汽颜色').onChange(v => uniforms.baseColor.value.set(v))


        scene.addUpdateListener(() => {
            uniforms.time.value += 0.01;
            return steam;
        })

        return steam;
    }

}