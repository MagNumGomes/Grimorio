export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('file://')) {
    try {
      return await nextResolve(specifier, context);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
        const candidates = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
        for (const ext of candidates) {
          try {
            return await nextResolve(specifier + ext, context);
          } catch {}
        }
      }
      throw err;
    }
  }
  return nextResolve(specifier, context);
}
