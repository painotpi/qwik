import {
  $,
  component$,
  Host,
  useHostElement,
  useScopedStyles$,
  useWatch$,
  useStore,
  useClientEffect$,
} from '@builder.io/qwik';
import type { TransformModuleInput } from '@builder.io/qwik/optimizer';
import type { SiteStore } from '../../components/app/app';
import { Repl } from '../../components/repl/repl';
import styles from './playground.css?inline';
import { Header } from '../../components/header/header';
import { setHeadMeta, setHeadStyles } from '@builder.io/qwik-city';
import playgroundApps from '@playground-data';
import { useLocation } from '../../utils/useLocation';

interface PlaygroundLayoutProps {
  store: SiteStore;
}

const Playground = component$((props: PlaygroundLayoutProps) => {
  const hostElm = useHostElement();

  const store = useStore<PlaygroundStore>(() => {
    return loadPlaygroundStore(useLocation().hash);
  });

  useWatch$(() => {
    setHeadMeta(hostElm, { title: `Qwik Playground` });
    setHeadStyles(hostElm, [
      {
        style: `html,body { margin: 0; height: 100%; overflow: hidden; }`,
      },
    ]);
  });

  useClientEffect$(() => {
    try {
      const colLeft = localStorage.getItem('qwikPlayground_colLeft');
      if (colLeft) {
        store.colLeft = JSON.parse(colLeft);
      }
    } catch (e) {
      /**/
    }
  });

  useScopedStyles$(styles);

  const pointerDown = $(() => {
    store.colResizeActive = true;
  });

  const pointerMove = $((ev: PointerEvent) => {
    if (store.colResizeActive) {
      store.colLeft = (ev.clientX, ev.clientX / window.innerWidth) * 100;
      store.colLeft = Math.max(25, store.colLeft);
      store.colLeft = Math.min(75, store.colLeft);
    }
  });

  const pointerUp = $(() => {
    store.colResizeActive = false;
    try {
      localStorage.setItem('qwikPlayground_colLeft', JSON.stringify(store.colLeft));
    } catch (e) {
      /**/
    }
  });

  return (
    <Host
      class={{ 'full-width': true, playground: true, 'repl-resize-active': store.colResizeActive }}
    >
      <Header store={props.store} />

      <Repl
        inputs={store.inputs}
        version={store.version}
        buildMode={store.buildMode}
        entryStrategy={store.entryStrategy}
        style={{
          gridTemplateColumns: `${store.colLeft}% ${100 - store.colLeft}%`,
        }}
      />

      <div
        class="repl-col-resize-bar"
        onPointerDownQrl={pointerDown}
        onPointerMoveQrl={pointerMove}
        onPointerUpQrl={pointerUp}
        onPointerOutQrl={pointerUp}
        style={{
          left: `calc(${store.colLeft}% - 6px)`,
        }}
      />
    </Host>
  );
});

export function loadPlaygroundStore(hash: string) {
  const playgroundStore: PlaygroundStore = {
    appId: 'hello-world',
    inputs: [],
    version: '',
    buildMode: 'development',
    entryStrategy: 'hook',
    colResizeActive: false,
    colLeft: 50,
  };

  let app = playgroundApps.find((p) => p.id === playgroundStore.appId)!;
  if (!app) {
    app = playgroundApps.find((p) => p.id === 'hello-world')!;
  }

  playgroundStore.appId = app.id;
  playgroundStore.inputs = app.inputs;

  return playgroundStore;
}

interface PlaygroundStore {
  appId: string;
  inputs: TransformModuleInput[];
  version: string;
  buildMode: 'development' | 'production';
  entryStrategy: string;
  colResizeActive: boolean;
  colLeft: number;
}

export default Playground;
