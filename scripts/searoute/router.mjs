// Lightweight sea-route router over a compact indexed graph
// ({ nodes:[[lng,lat],...], edges:[[ai,bi,weightNM],...] }). Builds a CSR
// adjacency + binary-heap Dijkstra — cheap enough for a Supabase Edge Function
// (~36 MB heap, ~40 ms build, ~8 ms/route), unlike geojson-path-finder's
// topology compaction (~440 MB, ~2.2 s) which exceeds the 256 MB / 2 s limits.
//
// This is the single source of truth for routing: the build script self-checks
// with it, and the edge function ships a near-verbatim copy (Deno TS).

export function haversineNM(aLng, aLat, bLng, bLat) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3440.065; // nautical miles
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Build a router over the compact graph. Returns { route, nearestIndex }.
export function makeRouter(nodes, edges) {
  const n = nodes.length;

  // CSR adjacency (undirected): head[i]..head[i+1] is node i's edge slice.
  const head = new Int32Array(n + 1);
  for (const [a, b] of edges) { head[a + 1]++; head[b + 1]++; }
  for (let i = 0; i < n; i++) head[i + 1] += head[i];
  const deg = new Int32Array(n);
  const to = new Int32Array(edges.length * 2);
  const w = new Float64Array(edges.length * 2);
  for (const [a, b, wt] of edges) {
    to[head[a] + deg[a]] = b; w[head[a] + deg[a]] = wt; deg[a]++;
    to[head[b] + deg[b]] = a; w[head[b] + deg[b]] = wt; deg[b]++;
  }

  function nearestIndex(lng, lat) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) {
      const d = (nodes[i][0] - lng) ** 2 + (nodes[i][1] - lat) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  // Dijkstra from src to dst. Returns { distNM, path:[[lng,lat],...] } or null.
  function route(src, dst) {
    const dist = new Float64Array(n).fill(Infinity);
    const prev = new Int32Array(n).fill(-1);
    dist[src] = 0;

    const heap = [[0, src]]; // [dist, node], min-heap by dist
    const hpush = (x) => {
      heap.push(x); let i = heap.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const hpop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last; let i = 0;
        for (;;) {
          let l = 2 * i + 1, r = 2 * i + 2, s = i;
          if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
          if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
          if (s === i) break;
          [heap[s], heap[i]] = [heap[i], heap[s]]; i = s;
        }
      }
      return top;
    };

    while (heap.length) {
      const [d, u] = hpop();
      if (d > dist[u]) continue;
      if (u === dst) break;
      for (let e = head[u]; e < head[u + 1]; e++) {
        const v = to[e], nd = d + w[e];
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; hpush([nd, v]); }
      }
    }
    if (dist[dst] === Infinity) return null;

    const path = [];
    for (let u = dst; u !== -1; u = prev[u]) path.push(nodes[u]);
    path.reverse();
    return { distNM: dist[dst], path };
  }

  return { route, nearestIndex };
}
