uniform float uTime;
varying vec2 vUv;
        
void main() {
    float dist = distance(vUv, vec2(0.5, 0.5));
    float glow = smoothstep(0.5, 0.0, dist);
    float pulse = sin(uTime) * 0.5 + 0.5;
    gl_FragColor = vec4(glow * pulse, 0.0, glow * (1.0 - pulse), 1.0);
}