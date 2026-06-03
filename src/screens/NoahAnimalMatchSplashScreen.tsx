import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../stores/profileStore';
import styles from './NoahAnimalMatchSplashScreen.module.css';

const VERT = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}`;
const FRAG = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;

void main(){
  vec2 uv=gl_FragCoord.xy/uResolution;
  vec2 c=uv-vec2(0.5,0.58);
  float aspect=uResolution.x/uResolution.y;
  c.x*=aspect;
  float dist=length(c);
  float angle=atan(c.y,c.x);
  float glow=smoothstep(0.55,0.0,dist);
  glow=pow(glow,1.8);
  float rays=pow(abs(sin(angle*7.0+uTime*0.12)),6.0);
  float rayMask=smoothstep(0.0,0.08,dist)*smoothstep(0.65,0.15,dist);
  rays*=rayMask*0.8;
  float rays2=pow(abs(sin(angle*3.5-uTime*0.08)),8.0);
  rays2*=rayMask*0.24;
  float bloom=exp(-dist*dist*18.0)*0.8;
  float intensity=glow*0.5+rays*0.35+rays2*0.15+bloom*0.4;
  intensity=clamp(intensity,0.0,1.0);
  vec3 gold=vec3(0.831,0.765,0.416);
  vec3 warm=vec3(1.0,0.97,0.90);
  vec3 color=mix(gold,warm,bloom*0.6);
  gl_FragColor=vec4(color*intensity,intensity);
}`;

function useRayCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uResolution');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    gl.uniform2f(uRes, canvas.width, canvas.height);

    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, active]);
}

export function NoahAnimalMatchSplashScreen() {
  const navigate = useNavigate();
  const onboarded = useProfileStore((s) => s.onboarded);
  const [visible, setVisible] = useState(true);
  const [raysActive, setRaysActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useRayCanvas(canvasRef, raysActive);

  useEffect(() => {
    const rayTimer = setTimeout(() => setRaysActive(true), 300);
    const fadeTimer = setTimeout(() => setVisible(false), 2200);
    const navTimer = setTimeout(() => {
      navigate(onboarded ? '/noah-animal-match/home' : '/noah-animal-match/onboarding', { replace: true });
    }, 2500);
    return () => {
      clearTimeout(rayTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, onboarded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.screen}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.center}>
            <div className={styles.logoWrap}>
              <canvas ref={canvasRef} className={styles.rayCanvas} />
              <motion.span
                className={styles.logo}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  opacity: { delay: 0.2, duration: 0.5 },
                  scale: { delay: 0.2, duration: 0.8, type: 'spring', stiffness: 180, damping: 12 },
                }}
              >
                🕊️
              </motion.span>
            </div>
            <motion.p
              className={styles.studioName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
            >
              &ldquo;Two by two they came to Noah&rdquo; &mdash; Genesis 7:9
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
