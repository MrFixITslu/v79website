import { registerHooks } from 'node:module';
registerHooks({
  load(url, context, nextLoad) {
    if (new URL(url).pathname.endsWith('.css')) {
      return { format: 'module', source: 'export {};', shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
