import Renderer from "./renderer";

const renderer = new Renderer();
async function main() {
  await renderer.initialize();

  await renderer.render();
}

main();
