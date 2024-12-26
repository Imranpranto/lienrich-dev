export function serializeData<T extends Record<string, any>>(data: T[]): T[] {
  return data.map(item => {
    const serialized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(item)) {
      // Skip React fiber nodes and DOM elements
      if (
        key.startsWith('__react') || 
        key.startsWith('_reactFragment') ||
        value instanceof Element ||
        value instanceof Node
      ) {
        continue;
      }
      
      // Handle nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        serialized[key] = serializeData([value])[0];
      } else {
        serialized[key] = value;
      }
    }
    
    return serialized as T;
  });
}