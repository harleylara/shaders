#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUvs;

void main() {
    vec3 gradient = vec3(vUvs.x);
    gl_FragColor = vec4(gradient, 1.0);
}
