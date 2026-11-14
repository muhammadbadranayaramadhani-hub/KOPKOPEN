export async function resolve(spec, ctx, next) {
  if (spec === 'express') return { url: new URL('./express-shim.mjs', import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
