/**
 * Utility to sanitize incoming payloads against NoSQL Injection.
 * Recursively removes any object keys that start with '$' or contain '.'
 */

export function sanitize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitizedObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Disallow keys starting with $ (MongoDB operators) or containing dots
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Skip this malicious key
      }
      sanitizedObj[key] = sanitize(obj[key]);
    }
  }

  return sanitizedObj;
}
