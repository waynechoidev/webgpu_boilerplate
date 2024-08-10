export default class Renderer {
  private _device!: GPUDevice;
  private _canvasContext!: GPUCanvasContext;

  // public methods
  public async initialize() {
    await this.requestDevice();
    await this.getCanvasContext();
  }

  public async render() {
    const commandEncoder = this._device.createCommandEncoder({
      label: "encoder",
    });

    const renderPassDesc = await this.getRenderPassDesc();

    const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDesc);

    renderPassEncoder.end();

    const commandBuffer = commandEncoder.finish();
    this._device.queue.submit([commandBuffer]);
  }

  // private methods
  private async requestDevice() {
    const adapter = await navigator.gpu?.requestAdapter();
    this._device = await adapter?.requestDevice()!;
    if (!this._device) {
      this.printError("device");
      alert("Your device does not support WebGPU");
    }
  }

  private async getCanvasContext() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) this.printError("canvas");

    canvas.width = width;
    canvas.height = height;

    this._canvasContext = canvas.getContext("webgpu") as GPUCanvasContext;
    if (!this._canvasContext) this.printError("canvas context");

    const canvasConfig: GPUCanvasConfiguration = {
      device: this._device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      alphaMode: "opaque",
    };
    this._canvasContext.configure(canvasConfig);
  }

  private async getRenderPassDesc() {
    const canvasTexture = this._canvasContext.getCurrentTexture();
    const depthTexture = this._device.createTexture({
      size: [canvasTexture.width, canvasTexture.height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const colorAttachment: GPURenderPassColorAttachment = {
      view: canvasTexture.createView(),
      clearValue: [0, 0, 0, 1],
      loadOp: "clear",
      storeOp: "store",
    };
    const depthStencilAttachment: GPURenderPassDepthStencilAttachment = {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    };
    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: "render pass",
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthStencilAttachment,
    };

    return renderPassDescriptor;
  }

  private printError(target: string) {
    console.error(`Cannot find a ${target}`);
  }
}
