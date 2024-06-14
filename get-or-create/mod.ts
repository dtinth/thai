/**
 * Gets the value associated with the specified key from the map.
 * If the key does not exist, creates a new value using the provided createValue function,
 * associates it with the key in the map, and returns the new value.
 *
 * @template K The type of the keys in the map.
 * @template V The type of the values in the map.
 * @param map The map to get or create a value from.
 * @param key The key to get or create a value for.
 * @param createValue The function to create a new value if the key does not exist.
 * @returns The value associated with the key, or the newly created value.
 */
export function getOrCreate<K, V>(
  map: MapLike<K, V>,
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

/**
 * A map-like object that can be used with the getOrCreate function.
 */
export interface MapLike<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
}
