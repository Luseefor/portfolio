## The computation boundary

Vinculum uses an expression in the editor, geometry workers, and reopened scenes. Those paths need to agree on what the expression means. Parsing and symbolic work stay in TypeScript with mathjs; a bridge compiles supported expressions into a bounded numeric program for Rust/WASM.

The expression-family compilers check variables, syntax, and functions before evaluation. The Rust bridge rejects unsupported nodes instead of silently switching to a different numeric evaluator.

## Batch the numeric boundary

For implicit surfaces, TypeScript splits the sample grid into tiles and calls the WASM grid evaluator for each tile. This batches the boundary crossings. TypeScript still constructs geometry and runs several other sampling algorithms.

## Saved scenes and compatibility

Saved scenes contain mathematical definitions. Compiled programs, sampled geometry, and WASM pointers are runtime data. Keeping them out of the scene document lets numeric evaluation change without introducing another saved-scene format.

The compatibility tests compare supported real-valued expressions with mathjs and cover rejected syntax, domain holes, grid ordering, and memory growth. That contract is narrower than mathematical correctness for arbitrary expressions.
