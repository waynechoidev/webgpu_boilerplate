import { toRadian } from "@/engine/utils";
import main_vert from "@/shaders/main.vert.wgsl";
import main_frag from "@/shaders/main.frag.wgsl";
import { mat4, vec2, vec3 } from "gl-matrix";
import Camera from "./camera";
import RendererBackend from "./renderer_backend";
import Cube from "./geometry/cube";

export default class Renderer extends RendererBackend {
  private _mainPipeline!: GPURenderPipeline;

  private _cubeVertexBuffer!: GPUBuffer;
  private _cubeIndexBuffer!: GPUBuffer;
  private _cubeIndicesLength!: number;
  private _matrixUniformBuffer!: GPUBuffer;

  private _mainBindGroup!: GPUBindGroup;

  private _model!: mat4;
  private _camera!: Camera;
  private _projection!: mat4;

  constructor() {
    super();
  }

  // public methods
  public async initialize() {
    await this.requestDevice();
    await this.getCanvasContext();

    this._mainPipeline = await this.createRenderPipeline({
      label: "main pipeline",
      vertexShader: main_vert,
      fragmentShader: main_frag,
      vertexBufferLayout: [
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" }, // position
          ],
        },
      ],
    });

    await this.createVertexBuffers();
    await this.createOtherBuffers();

    await this.createBindGroups();

    this.setMatrix();
  }

  public async run() {
    await this.writeBuffers();

    await this.createEncoder();

    await this.draw();

    await this.submitCommandBuffer();

    requestAnimationFrame(() => this.run());
  }

  private async createVertexBuffers() {
    const cube = Cube();
    const cubeVertexValues = new Float32Array(
      this.getVerticesData(cube.vertices)
    );
    this._cubeVertexBuffer = this._device.createBuffer({
      label: "cube vertex buffer",
      size: cubeVertexValues.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this._device.queue.writeBuffer(this._cubeVertexBuffer, 0, cubeVertexValues);
    const cubeIndexValues = new Uint32Array(cube.indices.flat());
    this._cubeIndicesLength = cube.length;
    this._cubeIndexBuffer = this._device.createBuffer({
      label: "cube index buffer",
      size: cubeIndexValues.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    this._device.queue.writeBuffer(this._cubeIndexBuffer, 0, cubeIndexValues);
  }

  private async createOtherBuffers() {
    this._matrixUniformBuffer = this._device.createBuffer({
      label: "matrix uniforms",
      size: (16 + 16 + 16) * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private async createBindGroups() {
    this._mainBindGroup = this._device.createBindGroup({
      label: "bind group for object",
      layout: this._mainPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this._matrixUniformBuffer } },
      ],
    });
  }

  private setMatrix() {
    this._model = mat4.create();
    mat4.translate(this._model, this._model, vec3.fromValues(0, 0, -4));
    mat4.rotateX(this._model, this._model, toRadian(25));
    mat4.rotateY(this._model, this._model, toRadian(-200));

    this._camera = new Camera({
      position: vec3.fromValues(0, 0, 2.5),
      center: vec3.fromValues(0, 0, 0),
      up: vec3.fromValues(0, 1, 0),
      initialRotate: vec2.fromValues(0, 0),
    });

    this._projection = mat4.create();
    mat4.perspective(
      this._projection,
      toRadian(45),
      this.WIDTH / this.HEIGHT,
      0.1,
      100
    );
  }

  private async writeBuffers() {
    const view = this._camera.getViewMatrix();
    this._device.queue.writeBuffer(
      this._matrixUniformBuffer,
      0,
      new Float32Array([...this._model, ...view, ...this._projection])
    );
  }

  private async draw() {
    const renderPassDesc: GPURenderPassDescriptor =
      await this.getRenderPassDesc();
    const renderPassEncoder: GPURenderPassEncoder =
      this._commandEncoder.beginRenderPass(renderPassDesc);

    renderPassEncoder.setPipeline(this._mainPipeline);
    renderPassEncoder?.setBindGroup(0, this._mainBindGroup);
    renderPassEncoder.setVertexBuffer(0, this._cubeVertexBuffer);
    renderPassEncoder.setIndexBuffer(this._cubeIndexBuffer, "uint32");
    renderPassEncoder.drawIndexed(this._cubeIndicesLength);

    renderPassEncoder.end();
  }
}
