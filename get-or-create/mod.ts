export function getOrCreate<K, V>(
  map: Pick<Map<K, V>, "get" | "set" | "has">,
  key: K,
  createValue: (key: K) => V
): V {
  if (map.has(key)) {
    return map.get(key)!;
  }
  const value = createValue(key);
  map.set(key, value);
  return value;
}
