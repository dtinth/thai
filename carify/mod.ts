import { car } from "@helia/car";
import { unixfs } from "@helia/unixfs";
import { Helia } from "@helia/utils";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";

/**
 * Creates a CAR archive with a single file in it.
 *
 * @param buffer The content to be archived
 * @param name The name of the file
 */
export async function carify(
  buffer: Uint8Array,
  name: string
): Promise<CarifyResult> {
  const helia = new Helia({
    blockstore: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    blockBrokers: [],
  });
  const fs = unixfs(helia);
  const cid = await fs.cp(
    await fs.addBytes(buffer),
    await fs.addDirectory(),
    name
  );
  const c = car(helia);
  return {
    cid: cid.toString(),
    createCarStream: () => c.stream(cid),
  };
}

/**
 * The result of calling the `carify` function.
 */
export interface CarifyResult {
  /** The content identifier that can be used to retrieve the content from IPFS */
  cid: string;

  /** The content in the form of a CAR file */
  createCarStream: () => AsyncIterable<Uint8Array>;
}
