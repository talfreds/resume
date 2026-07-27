import type { HoleModel, DrillholeInputSet } from './visualizer';

let visualizerLoaded = false;
let visualizerModule: typeof import('./visualizer') | null = null;

export async function ensureVisualizerLoaded() {
  if (!visualizerLoaded) {
    visualizerModule = await import('./visualizer');
    visualizerLoaded = true;
  }
  return visualizerModule!;
}

export function isVisualizerLoaded() {
  return visualizerLoaded;
}

export async function loadAndBuildHoleModels(inputs: DrillholeInputSet): Promise<HoleModel[]> {
  const module = await ensureVisualizerLoaded();
  return module.buildHoleModels(inputs);
}

export async function createScene(models: HoleModel[]) {
  const module = await ensureVisualizerLoaded();
  return module.createDrillholeScene(models);
}
