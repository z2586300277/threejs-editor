import * as THREE from 'three';

export default {
    name: '围墙',
    label: '围墙',
    create(_,{scene}){
        const geometry = new THREE.CylinderGeometry(30, 30, 20, 4, 64, true);
        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
            },
            vertexShader: `
                        varying vec2 vUv; 
                        void main(){
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                        }
                        `,
            fragmentShader: `
                        uniform float uTime;
                        varying vec2 vUv;
                        #define PI 3.14159265

                        void main(){

                        vec4 baseColor = vec4(0.0,1.,0.5,1.);
						
                        vec4 finalColor;
                            
                        float amplitude = 1.;
                        float frequency = 10.;
                        
                        float x = vUv.x;

                        float y = sin(x * frequency) ;
                        float t = 0.01*(-uTime*130.0);
                        y += sin(x*frequency*2.1 + t)*4.5;
                        y += sin(x*frequency*1.72 + t*1.121)*4.0;
                        y += sin(x*frequency*2.221 + t*0.437)*5.0;
                        y += sin(x*frequency*3.1122+ t*4.269)*2.5;
                        y *= amplitude*0.06;
                        y /= 3.;
                        y += 0.55;

                        vec4 color = gl_FragColor.rgba;

                        float r = step(0.5, fract(vUv.y - uTime));

                        baseColor.a = step(vUv.y,y) * (y-vUv.y)/y;
                        
                        gl_FragColor = baseColor;

                        }
                        `,
        });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.y += 10;
       
        scene.addUpdateListener(() => {
            material.uniforms.uTime.value += 0.01;
        })

        return cylinder;
    }
}