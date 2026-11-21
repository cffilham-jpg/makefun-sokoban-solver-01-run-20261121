// Sokoban solver: push-optimal, room by room. Original implementation.
// A level is a hallway with rooms off it; a box never leaves its room, so each
// room is solved on its own by breadth-first search over pushes (the first
// solved state met is push-optimal), with two safe prunes: dead squares (no
// push from there ever reaches a goal) and frozen 2x2 blocks. Deterministic:
// no clock, no randomness, fixed expansion order, work-bounded search.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX = 250000;
const DIRS = [[0, -1, 'u', 'U'], [0, 1, 'd', 'D'], [-1, 0, 'l', 'L'], [1, 0, 'r', 'R']];

function solve(text) {
  const rows = text.split('\n').filter((r) => r.length > 0);
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const N = w * h;
  const wall = new Uint8Array(N).fill(1);
  const goals = [];
  let boxes = [];
  let player = -1;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      const i = y * w + x;
      if (c === '#') continue;
      wall[i] = 0;
      if (c === '.' || c === '*' || c === '+') goals.push(i);
      if (c === '$' || c === '*') boxes.push(i);
      if (c === '@' || c === '+') player = i;
    }
  });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) wall[y * w + x] = 1;
  boxes.sort((a, b) => a - b);

  // Squares from which a box alone can be pushed onto some goal: pull back
  // from the goals over open floor (a square y is live when some live square
  // x = y + d has the player square y - d open too).
  function liveFor(wl, gs) {
    const live = new Uint8Array(N);
    const q = [];
    for (const g of gs) { live[g] = 1; q.push(g); }
    for (let qi = 0; qi < q.length; qi++) {
      const x = q[qi];
      for (const [dx, dy] of DIRS) {
        const d = dy * w + dx;
        const y = x - d;
        if (!wl[y] && !wl[y - d] && !live[y]) { live[y] = 1; q.push(y); }
      }
    }
    return live;
  }

  // The rooms: cut the dead squares of the player's row (the hallway) out of
  // the floor; each remaining part holding boxes is a room. Null when the
  // level is no set of rooms (a box in the hallway, a part with boxes != goals).
  function roomsOf() {
    const live = liveFor(wall, goals);
    const row = Math.floor(player / w);
    const cut = new Uint8Array(N);
    for (let i = row * w; i < (row + 1) * w; i++) if (!wall[i] && !live[i]) cut[i] = 1;
    if (boxes.some((b) => cut[b])) return null;
    const part = new Int32Array(N).fill(-1);
    const rooms = [];
    for (let s = 0; s < N; s++) {
      if (wall[s] || cut[s] || part[s] >= 0) continue;
      const squares = [s];
      part[s] = rooms.length;
      for (let i = 0; i < squares.length; i++) {
        for (const [dx, dy] of DIRS) {
          const q = squares[i] + dy * w + dx;
          if (!wall[q] && !cut[q] && part[q] < 0) { part[q] = rooms.length; squares.push(q); }
        }
      }
      rooms.push({ boxes: [], goals: [] });
    }
    for (const b of boxes) rooms[part[b]].boxes.push(b);
    for (const g of goals) if (part[g] >= 0) rooms[part[g]].goals.push(g);
    if (goals.some((g) => part[g] < 0) || rooms.some((r) => r.boxes.length !== r.goals.length)) return null;
    return rooms.filter((r) => r.boxes.length > 0);
  }

  // Push-optimal solution of one (sub-)level: BFS over pushes. A state is the
  // sorted boxes plus the player's reachable region, named by its lowest
  // square; states are keyed as digits in base N. Returns {pushes, moves} or
  // null when the state budget runs out.
  function pushBFS(wl, gs, bs, pl, maxStates) {
    const goal = new Uint8Array(N);
    for (const g of gs) goal[g] = 1;
    const live = liveFor(wl, gs);
    if (bs.some((b) => !live[b])) return null;
    const nb = bs.length;
    const solved = (arr) => arr.every((b) => goal[b]);
    const occ = new Uint8Array(N);
    const seen = new Int32Array(N);
    const mark = new Int32Array(N);
    const stack = new Int32Array(N);
    let ss = 0;
    let ms = 0;
    // Flood the player's region from `from`, marking `arr` with `stamp`;
    // returns the region's lowest square.
    function flood(arr, stamp, from) {
      let low = from;
      let n = 0;
      stack[n++] = from;
      arr[from] = stamp;
      while (n > 0) {
        const p = stack[--n];
        if (p < low) low = p;
        for (let k = 0; k < 4; k++) {
          const q = k === 0 ? p - w : k === 1 ? p + w : k === 2 ? p - 1 : p + 1;
          if (!wl[q] && !occ[q] && arr[q] !== stamp) { arr[q] = stamp; stack[n++] = q; }
        }
      }
      return low;
    }
    // Whether the box just pushed to `t` sits in a frozen 2x2 block of walls
    // and boxes with a box off its goal (occ holds the new box positions).
    function frozen(t) {
      for (const a of [t, t - 1, t - w, t - w - 1]) {
        const b = a + 1;
        const c = a + w;
        const d = c + 1;
        if (!(wl[a] || occ[a]) || !(wl[b] || occ[b]) || !(wl[c] || occ[c]) || !(wl[d] || occ[d])) continue;
        if ((occ[a] && !goal[a]) || (occ[b] && !goal[b]) || (occ[c] && !goal[c]) || (occ[d] && !goal[d])) return true;
      }
      return false;
    }
    const encode = (low, arr) => {
      let k = low;
      for (const b of arr) k = k * N + b;
      return k;
    };
    const decode = (k) => {
      const arr = new Array(nb);
      for (let i = nb - 1; i >= 0; i--) { arr[i] = k % N; k = Math.floor(k / N); }
      return { low: k, boxes: arr };
    };
    for (const b of bs) occ[b] = 1;
    const keys = [encode(flood(seen, ++ss, pl), bs)];
    const parent = [-1];
    const pf = [0];
    const pt = [0];
    const index = new Map([[keys[0], 0]]);
    for (const b of bs) occ[b] = 0;
    let found = solved(bs) ? 0 : -1;
    for (let head = 0; found < 0 && head < keys.length; head++) {
      const { low, boxes: cur } = decode(keys[head]);
      for (const b of cur) occ[b] = 1;
      flood(seen, ++ss, low);
      const st = ss;
      for (let bi = 0; bi < cur.length && found < 0; bi++) {
        const b = cur[bi];
        for (const [dx, dy] of DIRS) {
          const d = dy * w + dx;
          const t = b + d;
          if (seen[b - d] !== st || wl[t] || occ[t] || !live[t]) continue;
          occ[b] = 0;
          occ[t] = 1;
          let key2 = -1;
          let next = null;
          if (!frozen(t)) {
            next = cur.slice();
            next[bi] = t;
            next.sort((x, y) => x - y);
            key2 = encode(flood(mark, ++ms, b), next);
          }
          occ[t] = 0;
          occ[b] = 1;
          if (key2 < 0 || index.has(key2)) continue;
          if (keys.length >= maxStates) {
            for (const x of cur) occ[x] = 0;
            return null;
          }
          index.set(key2, keys.length);
          keys.push(key2);
          parent.push(head);
          pf.push(b);
          pt.push(t);
          if (solved(next)) { found = keys.length - 1; break; }
        }
      }
      for (const x of cur) occ[x] = 0;
    }
    if (found < 0) return null;
    // Rebuild the moves: walk to each push's square, then push.
    const path = [];
    for (let s = found; s > 0; s = parent[s]) path.push(s);
    path.reverse();
    let moves = '';
    let pl2 = pl;
    let cur = bs.slice();
    for (const s of path) {
      const from = pf[s];
      const to = pt[s];
      const d = to - from;
      for (const b of cur) occ[b] = 1;
      moves += walkTo(pl2, from - d);
      for (const b of cur) occ[b] = 0;
      moves += DIRS.find(([dx, dy]) => dy * w + dx === d)[3];
      pl2 = from;
      cur = cur.slice();
      cur[cur.indexOf(from)] = to;
      cur.sort((a, b) => a - b);
    }
    return { pushes: path.length, moves };

    // Shortest walk from `from` to `to` around walls and boxes (occ), lower
    // LURD letters, first direction first on ties.
    function walkTo(from, to) {
      if (from === to) return '';
      const prev = new Int32Array(N).fill(-1);
      const how = new Array(N);
      const q = [from];
      prev[from] = from;
      for (let qi = 0; qi < q.length; qi++) {
        const p = q[qi];
        if (p === to) break;
        for (const [dx, dy, letter] of DIRS) {
          const nq = p + dy * w + dx;
          if (wl[nq] || occ[nq] || prev[nq] !== -1) continue;
          prev[nq] = p;
          how[nq] = letter;
          q.push(nq);
        }
      }
      if (prev[to] === -1) throw new Error('walkTo: push square out of reach');
      let s = '';
      for (let p = to; p !== from; p = prev[p]) s = how[p] + s;
      return s;
    }
  }

  // Solve room by room: each room push-optimally in turn, the other rooms'
  // boxes standing as walls (on their goals once their room is done), the
  // player walking on from where the last room left it.
  const rooms = roomsOf();
  if (rooms === null) {
    const r = pushBFS(wall, goals, boxes, player, MAX) ?? pushBFS(wall, goals, boxes, player, MAX * 8);
    return r === null ? '' : r.moves;
  }
  let pl = player;
  let moves = '';
  for (const room of rooms) {
    const wl = wall.slice();
    for (const other of rooms) if (other !== room)
      for (const b of other.done ? other.goals : other.boxes) wl[b] = 1;
    const sub = pushBFS(wl, room.goals.slice().sort((a, b) => a - b), room.boxes.slice().sort((a, b) => a - b), pl, MAX)
      ?? pushBFS(wl, room.goals.slice().sort((a, b) => a - b), room.boxes.slice().sort((a, b) => a - b), pl, MAX * 8);
    if (sub === null) return '';
    moves += sub.moves;
    for (const ch of sub.moves.toLowerCase()) pl += ch === 'u' ? -w : ch === 'd' ? w : ch === 'l' ? -1 : 1;
    room.done = true;
  }
  return moves;
}

for (const id of readdirSync(I).sort()) {
  const moves = solve(readFileSync(join(I, id, 'level.txt'), 'utf8'));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'solution.txt'), `${moves}\n`);
}
