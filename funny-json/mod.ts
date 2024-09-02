/**
 * Converts a JavaScript object to a JSON string with comma-first styling and using tabs for indentation.
 */
export function stringify(
  object: Parameters<typeof JSON.stringify>[0]
): string {
  let result = JSON.stringify(object, null, "\t");

  // Move the comma and opening braces to the next line
  result = result.replace(/([\[\{,])\n\t([\t]*)/g, "\n$2$1\t");

  // Put opening brace on the same line as the comma
  result = result.replace(/,\t\n[\t]*([\[\{])/g, ",\t$1");

  // Put opening brace on the same line as the array opening
  result = result.replace(/\[\t\n[\t]*([\[\{])/g, "[\t$1");

  // Put the opening brace on the same line as the first key.
  result = result.replace(/([\[\{])\n\s*/g, "$1\t");

  // Remove trailing colon at the end of a line
  result = result.replace(/:[ ]+\n/g, ":\n");

  return result;
}
