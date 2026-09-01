/**
 * Test vectors: text, the address that a parser reads from it, and the text
 * that the formatter writes back.
 *
 * A port of this package to a different language uses these vectors to show
 * that it agrees with this package. The vectors are also the test data of this
 * package, therefore they cannot become old.
 *
 * ```ts
 * import { ADDRESS_VECTORS } from "@thai/address-utils/test-vectors";
 * ```
 *
 * @module
 */

import vectors from "./vectors.json" with { type: "json" };
import type { Address, WarningCode } from "./types.ts";

/** One test vector. */
export interface AddressVector {
  /** What this vector shows. */
  readonly name: string;
  /** The text to read. */
  readonly text: string;
  /** What `parseAddress` gives for that text. */
  readonly parse: {
    readonly address: Address;
    readonly warnings: readonly WarningCode[];
  };
  /** What `formatAddress` writes for that address. */
  readonly format: string;
}

/** Every test vector. */
export const ADDRESS_VECTORS: readonly AddressVector[] =
  vectors as readonly AddressVector[];
