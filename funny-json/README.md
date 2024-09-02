A JSON stringifier that produces visually readable output with comma-first styling.

- Tab-based indentation make nested JSON structures visually take more horizontal space while compact in file size.
- Comma-first style is used so that when adding new items to the end of the objects or arrays, the last line does not need to be modified, resulting in cleaner diffs.
- This format is inspired by [npm's "funny" coding style](https://manpages.ubuntu.com/manpages/trusty/man7/npm-coding-style.7.html) and [format-json's diffy format](https://www.npmjs.com/package/format-json).
- Note: This package does not sort object keys. If you need to sorted keys for even cleaner diffs, consider using the [sort-keys](https://www.npmjs.com/package/sort-keys) package in combination with this.

## Usage

```javascript
import { stringify } from "@thai/funny-json";

const object = {
  name: "John Doe",
  age: 30,
  hobbies: ["reading", "cycling", "swimming"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    country: "USA",
  },
};

console.log(stringify(object));
```

Output:

<!-- prettier-ignore -->
```json
{	"name": "John Doe"
,	"age": 30
,	"hobbies":
	[	"reading"
	,	"cycling"
	,	"swimming"
	]
,	"address":
	{	"street": "123 Main St"
	,	"city": "Anytown"
	,	"country": "USA"
	}
}
```
