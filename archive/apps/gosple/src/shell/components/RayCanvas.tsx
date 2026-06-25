// FFS LOCKED SPLASH, canonical, do not redesign. Install/repair via the /ffs-splash
// skill; locked by ~/.claude/rules/ffs-splash-lock.md. GL ray-shader splash, company
// logo + "Romans 8:28". NEVER the Skia RadiantSplashScreen (it black-screens Release
// builds). Chief enforces this in the weekly audit.
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import type { StyleProp, ViewStyle } from 'react-native';
import { VERT, FRAG } from './rayShaderSource';

/**
 * Runs the EXACT live Gosple WebGL splash shader natively via expo-gl, so the
 * splash rays are pixel-identical to the shipped web build (and identical across
 * every game). Render it behind the logo, sized to a square (web uses 300x300).
 */
export default function RayCanvas({ style }: { style?: StyleProp<ViewStyle> }) {
  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uResolution');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    gl.uniform2f(uRes, w, h);

    const t0 = Date.now();
    const draw = () => {
      gl.uniform1f(uTime, (Date.now() - t0) / 1000);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.flush();
      gl.endFrameEXP();
      requestAnimationFrame(draw);
    };
    draw();
  };

  return <GLView style={style} onContextCreate={onContextCreate} />;
}
