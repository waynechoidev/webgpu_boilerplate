#include "common.wgsl"

@group(0) @binding(0) var<uniform> uni: MatrixUniforms;

@vertex fn vs(
  input: Vertex,
) -> VSOutput {
  var output: VSOutput;
  
  output.position = uni.projection * uni.view * uni.model * vec4f(input.position, 1.0);
  return output;
}