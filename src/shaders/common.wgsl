struct VSOutput {
  @builtin(position) position: vec4f,
};

struct Vertex {
  @location(0) position: vec3f,
};

struct MatrixUniforms {
  model: mat4x4f,
  view: mat4x4f,
  projection: mat4x4f,
};