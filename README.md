# Sokoban Solver — room-decomposed push-optimal BFS

[![bounty](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/c/sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/cffilham-jpg/makefun-sokoban-solver-01-run-20261121/rank.svg)](https://make.fun/c/sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/cffilham-jpg/makefun-sokoban-solver-01-run-20261121/reward.svg)](https://make.fun/c/sokoban-solver-01-run-20261121)

`main.ts` solves each Sokoban level room by room with breadth-first search over pushes (push-optimal), pruning dead squares and frozen 2x2 blocks. Deterministic: no clock, no randomness, no network.
