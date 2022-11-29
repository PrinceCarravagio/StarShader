import {Canvas, extend, useFrame} from '@react-three/fiber'
import React, { useRef, Suspense } from 'react'
import "./App.css";
import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import * as THREE from 'three'


const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    iTime: 0,
    iResolution: { value: new THREE.Vector2() },
  },
  // Vertex Shader

  glsl`
      varying vec2 vUv;
      
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
  `,
  // Fragment Shader
  glsl`
     #define PI 3.1415
    #define NUM_LAYERS 4.0

    varying vec2 vUv;
    uniform float iTime;
    uniform vec2 iResolution;

    mat2 Rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float Star(vec2 uv, float flare) {
      float d = length(uv);
      float m = 0.05 / d;

      float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
      m += rays * flare;
      uv *= Rot(PI / 4.0);
      rays = max(0.0, 1.0 -abs(uv.x * uv.y * 1000.0));
      m += rays * 0.3 * flare;

      m *= smoothstep(1.0, 0.2, d);
      return m;
    }

    float Hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    vec3 StarLayer(vec2 uv) {
      vec3 col = vec3(0);

      vec2 gv = fract(uv) - 0.5;
      vec2 id = floor(uv);

      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offs = vec2(x, y);

          float n = Hash21(id + offs); // random between 0 and 1
          float size = fract(n * 345.32);

          float star = Star(gv - offs - vec2(n, fract(n * 34.0)) + 0.5, smoothstep(0.9, 1.0, size) * 0.6);

          vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(n * 2345.2) * 123.2) * 0.5 + 0.5;
          color = color * vec3(1, 0.25, 1.0 + size) + vec3(0.2, 0.2, 0.1) * 2.0;

          star *= sin(iTime * 3.0 + n * 2.0 * PI) * 0.5 + 1.0;
          col += star * size * color;
        }
      }

      return col;
    }

    void main() {
      float t = iTime * 0.02;

      vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
      uv *= Rot(t);

      // Or, if you want this in world-space
      // vec2 uv = vUv;

      vec3 col = vec3(0);
      for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYERS) {
        float depth = fract(i + t);

        float scale = mix(20.0, 0.5, depth);
        float fade = depth * smoothstep(1.0, 0.9, depth);
        col += StarLayer(uv * scale + i * 453.2) * fade;
      }

      gl_FragColor = vec4(col, 1.0);

      // Three color management
      #include <encodings_fragment>
    }
  `
);
extend({WaveShaderMaterial})

const Wave = () =>{
  const ref = useRef()
  // useFrame(({clock}) => (ref.current.iTime = clock.getElapsedTime()))
  useFrame(() => (ref.current.iTime /= 1000));
  return (
    <mesh>
      <planeBufferGeometry args={[0.4,0.6,16, 16]} />
      <waveShaderMaterial ref={ref}/>
    </mesh>
  );
}

const Scene = ()=>{
  return(
    <Canvas camera ={{fov:10, position: [0,0,5]}}>
      <Suspense fallback={null}>
        <Wave/>
      </Suspense>
    </Canvas>
  )
}
function App() {
return <Scene />
}
export default App;
