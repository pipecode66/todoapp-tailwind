const API_BASE = 'https://todoapitest.juansegaliz.com/todos';

async function read(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// Esto es solo un alias para evitar cambiar todo el código en dado caso que intente seguir llamando a HandleResponse en la consola
async function handleResponse(res) { return read(res); }

function asList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.items && Array.isArray(raw.items)) return raw.items;
  if (raw?.results && Array.isArray(raw.results)) return raw.results;
  if (raw?.todos && Array.isArray(raw.todos)) return raw.todos;
  return [];
}
function asItem(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return raw.data ?? raw.todo ?? raw.result ?? raw.item ?? raw;
}

// CRUD (Camarones, Ron, Unisimon, Deftones)
export async function listTodos() {
  const res = await fetch(API_BASE);
  return asList(await read(res));
}
export async function getTodo(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  return asItem(await read(res));
}
export async function createTodo(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return asItem(await read(res));
}
export async function updateTodo(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return asItem(await read(res));
}
export async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  await read(res);
  return null;
}
