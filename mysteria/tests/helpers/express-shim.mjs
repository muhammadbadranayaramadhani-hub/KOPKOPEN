// Pengganti Express MINIMAL, hanya untuk pengujian di lingkungan tanpa paket npm "express".
// Tidak dipakai produksi. Meniru: app.use/get/post, Router, json(), res.status/json/set/setHeader, urutan middleware & error handler.
import http from 'node:http';

function compose(stack) {
  return (req, res, done) => {
    let i = 0;
    const next = (err) => {
      const layer = stack[i++];
      if (!layer) return done(err);
      const { method, path, fns, prefix } = layer;
      const url = req.path;
      const match = (!method || method === req.method) && (path === null || (prefix ? url === path || url.startsWith(path + '/') || path === '/' : url === path));
      if (!match) return next(err);
      let j = 0;
      const run = (e) => {
        const fn = fns[j++];
        if (!fn) return next(e);
        try {
          if (e) { if (fn.length === 4) return fn(e, req, res, run); return run(e); }
          if (fn.length === 4) return run();
          const saved = req.path;
          if (prefix && path !== null && path !== '/') req.path = url.slice(path.length) || '/';
          const r = fn(req, res, (x) => { req.path = saved; run(x); });
          if (r && r.catch) r.catch(run);
        } catch (x) { if (process.env.DEBUG_SHIM) console.error(x.stack); run(x); }
      };
      run(err);
    };
    next();
  };
}

function makeRouter() {
  const stack = [];
  const add = (method, path, prefix) => (...a) => {
    let p = path;
    let fns = a;
    if (typeof a[0] === 'string') { p = a[0]; fns = a.slice(1); }
    stack.push({ method, path: method ? p : (typeof a[0] === 'string' ? p : null), fns, prefix });
    return r;
  };
  const r = (req, res, next) => compose(stack)(req, res, next);
  r.use = add(null, null, true);
  r.get = add('GET', null, false);
  r.post = add('POST', null, false);
  r._stack = stack;
  return r;
}

function express() {
  const router = makeRouter();
  const app = (req, res) => {
    req.path = req.url.split('?')[0];
    req.headers ||= {};
    req.ip = req.socket.remoteAddress;
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
    res.set = (k, v) => { res.setHeader(k, v); return res; };
    router(req, res, (err) => { res.statusCode = 500; res.end(err ? String(err) : 'unhandled'); });
  };
  app.use = router.use; app.get = router.get; app.post = router.post;
  app.disable = () => app; app.set = () => app;
  app.listen = (port, host, cb) => { const s = http.createServer(app); s.listen(port, host, cb); return s; };
  return app;
}
express.Router = makeRouter;
express.json = ({ limit = '100kb' } = {}) => {
  const max = /kb$/i.test(limit) ? parseInt(limit) * 1024 : parseInt(limit);
  return (req, res, next) => {
    if (req.method !== 'POST') return next();
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > max) { const e = new Error('too large'); e.type = 'entity.too.large'; e.status = 413; req.removeAllListeners('data'); next(e); } else chunks.push(c); });
    req.on('end', () => {
      if (size > max) return;
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) { req.body = {}; return next(); }
      try { req.body = JSON.parse(raw); next(); } catch { const e = new Error('bad json'); e.type = 'entity.parse.failed'; e.status = 400; next(e); }
    });
  };
};
export default express;
