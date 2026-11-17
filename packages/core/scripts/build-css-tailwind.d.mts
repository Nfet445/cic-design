// Copyright (c) Meta Platforms, Inc. and affiliates.

/** What one build found in the sheet cache. */
interface CacheReport {
  hits: number;
  misses: number;
  reused: boolean;
}

/**
 * The Astryx Tailwind stylesheet, built from `tailwind/astryx.input.css` or
 * read back from the cache when no scanned module changed.
 */
export function buildAstryxTailwindCss(options?: {
  cacheDir?: string;
  onCacheReport?: (report: CacheReport) => void;
}): Promise<string>;
