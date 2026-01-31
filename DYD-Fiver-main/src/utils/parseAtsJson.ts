export function parseAtsJson(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('[parseAtsJson] Failed to parse string:', error);
      return null;
    }
  }

  if (typeof value === 'object') {
    return value;
  }

  return null;
}
