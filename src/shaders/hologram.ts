export const hologramVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform sampler2D uDepthMap;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;

    // Sample depth map for displacement
    vec4 depth = texture2D(uDepthMap, uv);
    float displacement = depth.r * 0.15;

    // Mouse-reactive parallax
    vec3 pos = position;
    pos.x += uMouse.x * 0.08 * (1.0 - uv.y * 0.5);
    pos.y += uMouse.y * 0.04;
    pos.z += displacement + sin(uTime * 0.8 + uv.y * 3.0) * 0.01;

    vElevation = displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const hologramFragmentShader = `
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform sampler2D uDuotone;
  uniform vec3 uAccentColor;
  uniform float uTransmissionProgress;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    vec4 duotoneColor = texture2D(uDuotone, vUv);

    // Blend between clean and duotone based on elevation
    vec4 baseColor = mix(texColor, duotoneColor, 0.3 + vElevation * 2.0);

    // Holographic scanlines
    float scanline = sin(vUv.y * 400.0 + uTime * 2.0) * 0.03;
    float scanlineLarge = sin(vUv.y * 40.0 - uTime * 0.5) * 0.06;

    // Edge glow
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float edgeGlow = smoothstep(0.0, 0.15, edgeDist);

    // Holographic color shift
    vec3 holoShift = uAccentColor * (0.1 + scanlineLarge * 0.5);

    // Combine
    vec3 finalColor = baseColor.rgb + holoShift + scanline;
    finalColor *= edgeGlow;

    // Flicker
    float flicker = 0.97 + 0.03 * sin(uTime * 12.0);
    finalColor *= flicker;

    // Transmission fade (for contact mode)
    float alpha = texColor.a * edgeGlow * mix(1.0, 0.0, uTransmissionProgress);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
