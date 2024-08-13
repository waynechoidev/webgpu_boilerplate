import { Vertex } from "@/engine/utils";
import { vec3 } from "gl-matrix";

export default function Cube() {
  const vertices: Vertex[] = [];
  const indices: [number, number, number][] = [];

  vertices.push({
    position: vec3.fromValues(-1, 1, -1),
  });
  vertices.push({
    position: vec3.fromValues(-1, -1, -1),
  });
  vertices.push({
    position: vec3.fromValues(1, 1, -1),
  });
  vertices.push({
    position: vec3.fromValues(1, -1, -1),
  });

  vertices.push({
    position: vec3.fromValues(-1, 1, 1),
  });
  vertices.push({
    position: vec3.fromValues(1, 1, 1),
  });
  vertices.push({
    position: vec3.fromValues(-1, -1, 1),
  });
  vertices.push({
    position: vec3.fromValues(1, -1, 1),
  });

  indices.push(
    [0, 1, 2],
    [2, 1, 3], // Front
    [2, 3, 5],
    [5, 3, 7], // Right
    [5, 7, 4],
    [4, 7, 6], // Back
    [4, 6, 0],
    [0, 6, 1], // Left
    [4, 0, 5],
    [5, 0, 2], // Top
    [1, 6, 3],
    [3, 6, 7] // Bottom
  );

  return { vertices, indices, length: indices.length * 3 };
}
