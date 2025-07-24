import * as THREE from "three";

export default {
    name: '警告信息',
    label: '警告信息',
    create(_, {scene}) {
  const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
                uTime: {
                    value: 0
                }
            },
            vertexShader: `
                            varying vec2 vUv;
                            void main() {
                                vUv = uv;
                                
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                            }
                        `,
            fragmentShader: `
                            varying vec2 vUv;
                            uniform float uTime;

                            void main(){
                                vec3 color = vec3(1.0,0.0,0.0);

                                vec2 center = vec2(0.5,0.5);

                                float dis = distance(vUv,center);

                                float p = 6.0;

                                float r =  fract(dis* p - uTime)/3. + step(0.99, fract(dis* p - uTime));
                                
                                
                                if(dis> 0.5 ){
                                    r = 0.0;
                                } 

                                gl_FragColor = vec4(color,r);
                            }
                        `,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;

        scene.addUpdateListener(() => {
            material.uniforms.uTime.value += 0.01;
        });

        return mesh;
    }
}

