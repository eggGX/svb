(function () {
  const STORAGE_KEY = 'shadowverseData';
  const ENV_JSON_PATH = 'environments/environments.json';

  function readData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
  }

  function normalizeEnvironments(list) {
    if (!Array.isArray(list)) return [];
    return list
      .filter(env => env && env.id && env.title)
      .map(env => ({
        id: String(env.id),
        title: String(env.title),
        image: env.image ? String(env.image) : '',
        source: env.source || 'file'
      }));
  }

  async function loadFileEnvironments() {
    try {
      const res = await fetch(ENV_JSON_PATH, { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      return normalizeEnvironments(json);
    } catch (e) {
      // file:// で直接開いた場合などはfetchできないことがあります。
      return [];
    }
  }

  async function ensureFileEnvironments() {
    const fileEnvironments = await loadFileEnvironments();
    const data = readData();
    const current = Array.isArray(data.environments) ? data.environments : [];
    const map = new Map();

    current.forEach(env => {
      if (env && env.id) map.set(String(env.id), env);
    });

    fileEnvironments.forEach(env => {
      const existing = map.get(env.id) || {};
      map.set(env.id, {
        ...existing,
        id: env.id,
        title: env.title,
        image: env.image,
        source: 'file'
      });
    });

    data.environments = Array.from(map.values());
    writeData(data);
    return data;
  }

  function hasUnassignedData(data) {
    const decks = Array.isArray(data.decks) ? data.decks : [];
    const bo1Decks = Array.isArray(data.bo1Decks) ? data.bo1Decks : [];
    return decks.some(deck => !deck.environmentId) || bo1Decks.some(bo1 => !bo1.environmentId);
  }

  window.EnvironmentLoader = {
    readData,
    writeData,
    ensureFileEnvironments,
    hasUnassignedData
  };
})();
