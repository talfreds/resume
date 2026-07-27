export interface PerformanceMetrics {
  timestamp: string;
  label: string;
  bundleSize: {
    uncompressed: number;
    gzipped: number;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    'best-practices': number;
    seo: number;
  };
  coreWebVitals: {
    lcp: { value: number; unit: string; rating: string };
    fid: { value: number; unit: string; rating: string };
    cls: { value: number; unit: string; rating: string };
  };
}

export interface PerformanceData {
  baseline: PerformanceMetrics;
  optimized: PerformanceMetrics;
  improvements: {
    bundleReduction: string;
    performanceGain: number;
    lcpImprovement: string;
  };
}

export async function loadPerformanceData(): Promise<PerformanceData | null> {
  try {
    const baseUrl = import.meta.env.BASE_URL;
    const [baseline, optimized] = await Promise.all([
      fetch(`${baseUrl}data/performance-baseline.json`).then((r) => r.json()),
      fetch(`${baseUrl}data/performance-optimized.json`).then((r) => r.json()),
    ]);

    return {
      baseline,
      optimized,
      improvements: {
        bundleReduction: (
          ((1 - optimized.bundleSize.gzipped / baseline.bundleSize.gzipped) * 100).toFixed(1)
        ),
        performanceGain: optimized.lighthouse.performance - baseline.lighthouse.performance,
        lcpImprovement: (
          ((1 - optimized.coreWebVitals.lcp.value / baseline.coreWebVitals.lcp.value) * 100).toFixed(1)
        ),
      },
    };
  } catch (error) {
    console.error('Failed to load performance data:', error);
    return null;
  }
}
