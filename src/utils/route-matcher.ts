const root = new Map();

export function clear() {
  root.clear();
}

export function register(route: string) {
  const parts = route.split('/');
  let node = root;
  for (const part of parts) {
    if (part === '') {
      continue;
    }

    let value = node.get(part);
    if (!value) {
      value = new Map();
      node.set(part, value);
    }

    node = value;
  }
}

export function match(route: string) {
  const data: {[key: string]: string} = {};

  // Special-case the root.
  if (route === '/') {
    return { path: '/' };
  }

  let node = root;
  const parts = route.split('/');
  const path = [];
  for (const part of parts) {
    if (part === '') {
      continue;
    }

    const value = node.get(part);
    if (value) {
      node = value;
      data[part] = part;
      path.push(part);
    } else {
      // No absolute match - check for wildcards.
      for (const key of node.keys()) {
        if (key.startsWith(':')) {
          data[key.substr(1)] = part;
          path.push(key);
          node = node.get(key);
          break;
        }
      }
    }
  }

  // No matches whatsoever.
  if (Object.keys(data).length === 0) {
    return null;
  }

  return {
    data,
    path: `/${path.join('/')}/`,
  };
}
