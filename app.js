import { listTodos, getTodo, createTodo, updateTodo, deleteTodo } from './api.js';

window.addEventListener('error', e => console.error('[GlobalError]', e.error || e.message));
window.addEventListener('unhandledrejection', e => console.error('[PromiseRejection]', e.reason));
console.log('[BOOT] app.js cargado');

function init() {
  console.log('[INIT] DOM listo');

  const $ = (s) => document.querySelector(s);
  const tbody = $('#tblTodos tbody');
  const form = $('#todoForm');
  const formMsg = $('#formMsg');
  const listMsg = $('#listMsg');
  const btnReload = $('#btnReload');

  if (!tbody || !form || !btnReload) {
    console.error('[INIT] Faltan elementos del DOM (#tblTodos, #todoForm, #btnReload, etc.)');
    return;
  }

 function row(t){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${t.id ?? ''}</td>
    <td>${t.title ?? ''}</td>
    <td>${t.isCompleted ? '✔️' : '⏳'}</td>
    <td>
      <button data-act="edit">Editar</button>
      <button data-act="del">Eliminar</button>
    </td>`;
  tr.dataset.id = t.id ?? '';
  return tr;
}

  async function refresh(){
    listMsg.textContent = 'Cargando...';
    console.log('[REFRESH] llamando /todos…');
    try{
      const todos = await listTodos();
      console.log('[REFRESH] respuesta:', todos);
      tbody.innerHTML = '';
      todos.forEach(t => tbody.appendChild(row(t)));
      listMsg.textContent = `Se cargaron ${todos.length} tareas.`;
    }catch(e){
      console.error('[REFRESH] error:', e);
      listMsg.textContent = e.message;
    }
  }

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault(); formMsg.textContent = '';
    const id = $('#todoId').value.trim();
    const payload = {
      title: $('#title').value.trim(),
      description: $('#description').value.trim(),
      isCompleted: $('#completed').checked
    };
    try{
      if(id){
        await updateTodo(id, payload);
        formMsg.textContent = `Actualizado #${id}`;
      }else{
        const created = await createTodo(payload);
        const newId = created?.id ?? created?.todoId ?? created?.insertedId ?? created?.result?.id ?? created?.data?.id ?? null;
        formMsg.textContent = newId ? `Creado #${newId}` : 'Creado';
      }
      form.reset(); $('#todoId').value = '';
      await refresh();
    }catch(e){
      console.error('[CREATE/UPDATE] error:', e);
      formMsg.textContent = e.message;
    }
  });

  $('#btnReset').addEventListener('click', ()=>{ formMsg.textContent=''; $('#todoId').value=''; });

  tbody.addEventListener('click', async (ev)=>{
    const btn = ev.target.closest('button'); if(!btn) return;
    const id = ev.target.closest('tr')?.dataset.id; if(!id) return;

    if(btn.dataset.act === 'edit'){
      try{
        const t = await getTodo(id);
        $('#todoId').value = t.id ?? t.todoId ?? '';
        $('#title').value = t.title ?? '';
        $('#description').value = t.description ?? '';
        $('#completed').checked = !!t.isCompleted;
        form.scrollIntoView({ behavior: 'smooth' });
      }catch(e){ console.error(e); alert(e.message); }
    }
    if(btn.dataset.act === 'del'){
      if(!confirm(`¿Eliminar #${id}?`)) return;
      try{ await deleteTodo(id); await refresh(); }catch(e){ console.error(e); alert(e.message); }
    }
  });

  refresh(); // primera carga
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
