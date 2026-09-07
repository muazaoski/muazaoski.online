import { sheenConfig } from './sheen-config.js'
// One shared WebGL surface: allocated on hover, rendered only on pointer changes.
export function createCardShader() {
  const canvas = document.createElement('canvas')
  canvas.className = 'card-shader'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true })
  let owner = null
  if (!gl) return { draw: () => {}, clear: () => {} }
  function compile(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Card shader unavailable')
    return shader
  }
  let program
  try {
    program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, `attribute vec2 position;
      varying vec2 uv;
      void main() { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `precision mediump float;
      varying vec2 uv;
      uniform vec2 pointer;
      uniform float aspect;
      uniform float intensity, bandWidth, glowSize, rainbow, angle, frequency;
      uniform float edgeIntensity, edgeWidth;
      uniform vec2 cardSize;
      uniform sampler2D artwork;
      void main() {
        vec2 delta = (uv - pointer) * vec2(aspect, 1.0);
        float light = exp(-dot(delta, delta) * 8.0 / (glowSize * glowSize));
        vec2 direction = vec2(cos(angle), sin(angle));
        float sweep = dot(uv - pointer, direction) * 0.806 + pointer.x * 0.05 + pointer.y * 0.1;
        float band = exp(-sweep * sweep * 65.0 / (bandWidth * bandWidth));
        vec3 foil = mix(vec3(1.0, 0.98, 0.88), 0.55 + 0.45 * cos(6.28318 * (sweep * frequency + vec3(0.0, 0.33, 0.67))), rainbow);
        vec3 color = mix(foil, vec3(1.0, 0.98, 0.88), light * 0.65);
        float mask = texture2D(artwork, uv).a;
        float alpha = clamp((band * 0.14 + light * 0.10) * intensity, 0.0, 1.0) * mask;
        // An inner rim for posters, following alpha silhouettes on transparent stickers.
        vec2 offset = vec2(edgeWidth) / cardSize;
        float neighbor = texture2D(artwork, uv + vec2(offset.x, 0.0)).a;
        neighbor = min(neighbor, texture2D(artwork, uv - vec2(offset.x, 0.0)).a);
        neighbor = min(neighbor, texture2D(artwork, uv + vec2(0.0, offset.y)).a);
        neighbor = min(neighbor, texture2D(artwork, uv - vec2(0.0, offset.y)).a);
        neighbor = min(neighbor, texture2D(artwork, uv + offset * 0.7071).a);
        neighbor = min(neighbor, texture2D(artwork, uv - offset * 0.7071).a);
        neighbor = min(neighbor, texture2D(artwork, uv + vec2(offset.x, -offset.y) * 0.7071).a);
        neighbor = min(neighbor, texture2D(artwork, uv + vec2(-offset.x, offset.y) * 0.7071).a);
        vec2 inset = min(uv, 1.0 - uv) * cardSize;
        float rim = 1.0 - smoothstep(0.0, edgeWidth, min(inset.x, inset.y));
        rim = max(rim * mask, max(0.0, mask - neighbor));
        float edgeAlpha = clamp(rim * edgeIntensity * (0.2 + light * 0.65 + band * 0.4), 0.0, 1.0);
        vec3 edgeColor = mix(foil, vec3(1.0), 0.65);
        gl_FragColor = vec4(edgeColor * edgeAlpha + color * alpha * (1.0 - edgeAlpha), edgeAlpha + alpha * (1.0 - edgeAlpha));
      }`))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Card shader unavailable')
  } catch {
    return { draw: () => {}, clear: () => {} }
  }
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  const pointerLocation = gl.getUniformLocation(program, 'pointer')
  const aspectLocation = gl.getUniformLocation(program, 'aspect')
  const cardSizeLocation = gl.getUniformLocation(program, 'cardSize')
  const settingsLocations = Object.fromEntries(Object.keys(sheenConfig).filter(key => key !== 'blendMode').map(key => [key, gl.getUniformLocation(program, key)]))
  function clear() {
    owner?.classList.remove('shader-active')
    owner = null
    canvas.remove()
  }
  canvas.addEventListener('webglcontextlost', clear)
  return {
    clear,
    draw(card, x, y) {
      canvas.style.mixBlendMode = sheenConfig.blendMode
      if (gl.isContextLost()) return
      const img = card.querySelector('img')
      if (!img.complete || !img.naturalWidth) return
      if (owner !== card) {
        clear()
        const scale = Math.min(devicePixelRatio || 1, 1.5, 1200 / Math.max(card.clientWidth, card.clientHeight))
        canvas.width = Math.max(1, Math.round(card.clientWidth * scale))
        canvas.height = Math.max(1, Math.round(card.clientHeight * scale))
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        owner = card
        card.append(canvas)
        card.classList.add('shader-active')
      }
      gl.uniform2f(pointerLocation, x, 1 - y)
      gl.uniform2f(cardSizeLocation, card.clientWidth, card.clientHeight)
      for (const [key, location] of Object.entries(settingsLocations)) {
        gl.uniform1f(location, key === 'angle' ? sheenConfig[key] * Math.PI / 180 : sheenConfig[key])
      }
      gl.uniform1f(aspectLocation, canvas.width / canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
  }
}
