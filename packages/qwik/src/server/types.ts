import type { SnapshotState } from '../core/object/store';
import type { QwikManifest, QwikBundle, QwikSymbol } from '../optimizer/src';

/**
 * Partial Window used by Qwik Framework.
 *
 * A set of properties which the Qwik Framework expects to find on global.
 * @public
 */
export interface QwikWindow extends WindowProxy {
  /**
   * Document used by Qwik during rendering.
   */
  document: QwikDocument;
  location: Location;
}

/**
 * Partial Document used by Qwik Framework.
 *
 * A set of properties which the Qwik Framework expects to find on document.
 * @public
 */
export interface QwikDocument extends Document {}

/**
 * Options when creating a mock Qwik Document object.
 * @public
 */
export interface DocumentOptions {
  url?: URL | string;
  html?: string;
  debug?: boolean;
}

/**
 * Options when creating a mock Qwik Window object.
 * @public
 */
export interface WindowOptions extends DocumentOptions {}

/**
 * @public
 */
export interface SerializeDocumentOptions extends DocumentOptions {
  manifest?: QwikManifest;
  qrlMapper?: QrlMapper;
}

/**
 * @alpha
 */
export interface PrefetchStrategy {
  implementation?: PrefetchImplementation;
  symbolsToPrefetch?: SymbolsToPrefetch;
}

/**
 * @alpha
 */
export type PrefetchImplementation =
  | 'link-prefetch-html'
  | 'link-prefetch'
  | 'link-preload-html'
  | 'link-preload'
  | 'link-modulepreload-html'
  | 'link-modulepreload'
  | 'worker-fetch'
  | 'none';

/**
 * all: Prefetch all QRLs used by the app.
 * all-document: Prefetch all QRLs used by the document.
 * events-document: Prefetch event QRLs used by the document. Default
 *
 * @alpha
 */
export type SymbolsToPrefetch =
  | 'all'
  | 'events-document'
  | ((opts: { document: QwikDocument; manifest: QwikManifest }) => PrefetchResource[]);

/**
 * @alpha
 */
export interface PrefetchResource {
  url: string;
  imports: PrefetchResource[];
}

export { QwikManifest, QwikBundle, QwikSymbol };

/**
 * @public
 */
export type QrlMapper = (symbolName: string) => string | undefined;

/**
 * @public
 */
export interface RenderToDocumentResult {
  prefetchResources: PrefetchResource[];
  snapshotState: SnapshotState | null;
}

/**
 * @public
 */
export interface RenderToStringResult extends RenderToDocumentResult {
  html: string;
  timing: {
    createDocument: number;
    render: number;
    toString: number;
  };
}

/**
 * @public
 */
export interface RenderToDocumentOptions extends SerializeDocumentOptions, DocumentOptions {
  /**
   * Defaults to `true`
   */
  snapshot?: boolean;

  /**
   * Specifies the root of the JS files of the client build.
   * Setting a base, will cause the render of the `q:base` attribute in the `q:container` element.
   */
  base?: string;

  /**
   * Specifies if the Qwik Loader script is added to the document or not. Defaults to `{ include: true }`.
   */
  qwikLoader?: { events?: string[]; include?: boolean };

  prefetchStrategy?: PrefetchStrategy;
}

/**
 * @public
 */
export interface RenderToStringOptions extends RenderToDocumentOptions {
  /**
   * When set, the app is serialized into a fragment. And the returned html is not a complete document.
   * Defaults to `undefined`
   */
  fragmentTagName?: string;
}

/**
 * @public
 */
export interface CreateRenderToStringOptions {
  symbolsPath: string;
}

/**
 * @public
 */
export type RenderToString = (opts: RenderToStringOptions) => Promise<RenderToStringResult>;
