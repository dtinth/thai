Given a `Uint8Array` and a filename, the `@thai/carify` package, generates an IPFS Content Archive file (.car) along with its Content Identifier (CID)

## Usage

```ts
import { carify } from "@thai/carify";

const emptyFile = new Uint8Array();
const filename = "empty.txt";
const result = await carify(emptyFile, filename);

// `result.cid` is the Content Identifier (CID) of the generated .car file.
console.log(result.cid); // => bafybeid76eyswbhp3f7zrgvkelbpsyoqoa4qzprhraibj6y7cvi7oh2bzq

// `result.createCarStream()` returns an `AsyncIterable<Uint8Array>` that represents the .car file.
// You can iterate them directly like this:
for await (const chunk of result.createCarStream()) {
  // ...
}

// ...or convert them to ArrayBuffer like this:
const arrayBuffer = await new Response(result.createCarStream()).arrayBuffer();

// ...or convert them to Node.js ReadableStream like this:
import { Readable } from "stream";
const readableStream = Readable.from(result.createCarStream());
```
