/**
 * Interactive Topography WebGL Shader Engine
 * Parameters:
 * lowColor: #1E3A8A, midColor: #3B82F6, highColor: #93C5FD
 * speed: 0.35, morphAmount: 3, morphSpeed: 0.05, bands: 4.5, thickness: 0.015
 * glow: 0.5, contrast: 3, brightness: 1, grainIntensity: 0.05
 * mouseInteraction: false (Background is purely ambient, no cursor deformation)
 */

class TopographyEngine {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!this.canvas) {
      console.error('Topography canvas not found');
      return;
    }

    this.options = Object.assign({
      lowColor: '#1E3A8A',
      midColor: '#3B82F6',
      highColor: '#93C5FD',
      speed: 0.35,
      morphAmount: 3.0,
      morphSpeed: 0.05,
      bands: 4.5,
      thickness: 0.015,
      scale: 1.0,
      glow: 0.5,
      contrast: 3.0,
      brightness: 1.0,
      opacity: 1.0,
      grain: true,
      grainIntensity: 0.05,
      mouseInteraction: false,
      mouseRadius: 0.0,
      mouseStrength: 0.0
    }, options);

    this.gl = this.canvas.getContext('webgl', { 
      alpha: true, 
      antialias: true, 
      powerPreference: 'high-performance' 
    }) || this.canvas.getContext('experimental-webgl');

    if (!this.gl) {
      console.warn('WebGL not supported, falling back to basic background');
      return;
    }

    this.startTime = performance.now();
    this.animId = null;

    this.init();
  }

  hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    ];
  }

  init() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_time;
      
      uniform vec3 u_low_color;
      uniform vec3 u_mid_color;
      uniform vec3 u_high_color;

      uniform float u_speed;
      uniform float u_morph_amount;
      uniform float u_morph_speed;
      uniform float u_bands;
      uniform float u_thickness;
      uniform float u_scale;
      uniform float u_glow;
      uniform float u_contrast;
      uniform float u_brightness;
      uniform float u_opacity;
      uniform float u_grain_intensity;

      // 2D & 3D Simplex noise implementation
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // Fractal Brownian Motion for rich topographic elevation
      float fbm(vec2 uv, float morphTime) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        vec2 p = uv;

        for (int i = 0; i < 4; i++) {
          value += amplitude * snoise(vec3(p * frequency, morphTime));
          p = mat2(1.6, 1.2, -1.2, 1.6) * p;
          amplitude *= 0.5;
          frequency *= 1.8;
        }
        return value;
      }

      void main() {
        vec2 aspect = vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 
                           u_resolution.y / min(u_resolution.x, u_resolution.y));
        
        vec2 uv = (v_uv - 0.5) * aspect * u_scale;

        float t = u_time * u_speed * 0.2;
        float morphT = u_time * u_morph_speed * 0.15;

        // Base elevation from FBM noise
        float elevation = fbm(uv * 1.35, morphT * u_morph_amount);

        // Secondary subtle continuous drift
        elevation += sin(uv.x * 2.0 + t) * cos(uv.y * 2.0 + t * 0.8) * 0.15;

        // Contour calculation
        float bandCoord = elevation * u_bands;
        float fractCoord = fract(bandCoord);
        float distToLine = abs(fractCoord - 0.5);

        // Crisp antialiased contour lines
        float lineCore = 1.0 - smoothstep(0.0, u_thickness * 1.5, distToLine);
        
        // Multi-level glow around lines
        float glowInner = exp(-distToLine * 16.0 / max(0.05, u_glow));
        float glowOuter = exp(-distToLine * 6.0 / max(0.05, u_glow));
        float glowTotal = glowInner * 0.7 + glowOuter * 0.4;

        // Elevation color interpolation (low -> mid -> high)
        float normalizedElevation = clamp((elevation * 0.5 + 0.5) * u_contrast + (u_brightness - 1.0), 0.0, 1.0);
        
        vec3 contourColor;
        if (normalizedElevation < 0.5) {
          contourColor = mix(u_low_color, u_mid_color, normalizedElevation * 2.0);
        } else {
          contourColor = mix(u_mid_color, u_high_color, (normalizedElevation - 0.5) * 2.0);
        }

        // Deep rich backdrop with subtle ambient light gradient
        vec3 deepBackdrop = mix(
          vec3(0.03, 0.05, 0.10),
          u_low_color * 0.35,
          normalizedElevation * 0.8
        );

        // Combine layers
        vec3 color = deepBackdrop;
        color += contourColor * glowTotal * (u_glow * 0.95);
        color += mix(contourColor, vec3(1.0), 0.25) * lineCore * 1.4;

        // Vignette effect for immersive depth
        float vignette = 1.0 - smoothstep(0.5, 1.4, length(v_uv - 0.5) * 1.3);
        color *= vignette * 0.85 + 0.15;

        // Organic film grain
        float grain = (fract(sin(dot(gl_FragCoord.xy + fract(u_time) * 100.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * u_grain_intensity;
        color += grain;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), u_opacity);
      }
    `;

    const program = this.createProgram(vsSource, fsSource);
    if (!program) return;

    this.program = program;
    gl.useProgram(program);

    // Quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    this.uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      lowColor: gl.getUniformLocation(program, 'u_low_color'),
      midColor: gl.getUniformLocation(program, 'u_mid_color'),
      highColor: gl.getUniformLocation(program, 'u_high_color'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      morphAmount: gl.getUniformLocation(program, 'u_morph_amount'),
      morphSpeed: gl.getUniformLocation(program, 'u_morph_speed'),
      bands: gl.getUniformLocation(program, 'u_bands'),
      thickness: gl.getUniformLocation(program, 'u_thickness'),
      scale: gl.getUniformLocation(program, 'u_scale'),
      glow: gl.getUniformLocation(program, 'u_glow'),
      contrast: gl.getUniformLocation(program, 'u_contrast'),
      brightness: gl.getUniformLocation(program, 'u_brightness'),
      opacity: gl.getUniformLocation(program, 'u_opacity'),
      grainIntensity: gl.getUniformLocation(program, 'u_grain_intensity')
    };

    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.resize();
    this.render();
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.floor(window.innerWidth * dpr);
    const displayHeight = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, displayWidth, displayHeight);
    }
  }

  render() {
    const gl = this.gl;
    if (!gl || !this.program) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - this.startTime) * 0.001;

    gl.useProgram(this.program);

    // Pass uniforms
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms.time, elapsedTime);

    const lowRGB = this.hexToRgb(this.options.lowColor);
    const midRGB = this.hexToRgb(this.options.midColor);
    const highRGB = this.hexToRgb(this.options.highColor);

    gl.uniform3f(this.uniforms.lowColor, lowRGB[0], lowRGB[1], lowRGB[2]);
    gl.uniform3f(this.uniforms.midColor, midRGB[0], midRGB[1], midRGB[2]);
    gl.uniform3f(this.uniforms.highColor, highRGB[0], highRGB[1], highRGB[2]);

    gl.uniform1f(this.uniforms.speed, this.options.speed);
    gl.uniform1f(this.uniforms.morphAmount, this.options.morphAmount);
    gl.uniform1f(this.uniforms.morphSpeed, this.options.morphSpeed);
    gl.uniform1f(this.uniforms.bands, this.options.bands);
    gl.uniform1f(this.uniforms.thickness, this.options.thickness);
    gl.uniform1f(this.uniforms.scale, this.options.scale);
    gl.uniform1f(this.uniforms.glow, this.options.glow);
    gl.uniform1f(this.uniforms.contrast, this.options.contrast);
    gl.uniform1f(this.uniforms.brightness, this.options.brightness);
    gl.uniform1f(this.uniforms.opacity, this.options.opacity);
    gl.uniform1f(this.uniforms.grainIntensity, this.options.grain ? this.options.grainIntensity : 0.0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.animId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// Global export
window.TopographyEngine = TopographyEngine;
