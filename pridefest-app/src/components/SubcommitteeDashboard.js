import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

export default function SubcommitteeDashboard({ subcommittee, onLogout }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat]   = useState(false)
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 700)
  const dragTask  = useRef(null)
  const dragOver  = useRef(null)

  const sc = subcommittee

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadData()
  }, [sc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true)
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('subcommittee_id', sc.id)
      .order('created_at')

    if (!cats) { setLoading(false); return }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .in('category_id', cats.map(c => c.id))
      .order('sort_order', { ascending: true })

    const merged = cats.map(cat => ({
      ...cat,
      tasks: (tasks || []).filter(t => t.category_id === cat.id)
    }))

    setCategories(merged)
    setLoading(false)
  }

  function handleDragStart(catId, taskIndex) { dragTask.current = { catId, taskIndex } }
  function handleDragEnter(catId, taskIndex) { dragOver.current = { catId, taskIndex } }

  async function handleDragEnd() {
    if (!dragTask.current || !dragOver.current) return
    const { catId: fromCat, taskIndex: fromIdx } = dragTask.current
    const { catId: toCat,   taskIndex: toIdx   } = dragOver.current
    if (fromCat !== toCat || fromIdx === toIdx) { dragTask.current = null; dragOver.current = null; return }
    setCategories(prev => prev.map(cat => {
      if (cat.id !== fromCat) return cat
      const newTasks = [...cat.tasks]
      const [moved] = newTasks.splice(fromIdx, 1)
      newTasks.splice(toIdx, 0, moved)
      newTasks.forEach((t, i) => supabase.from('tasks').update({ sort_order: i }).eq('id', t.id))
      return { ...cat, tasks: newTasks }
    }))
    dragTask.current = null
    dragOver.current = null
  }

  async function addCategory() {
    if (!newCatName.trim()) return
    const { data, error } = await supabase.from('categories').insert({
      subcommittee_id: sc.id, name: newCatName.trim()
    }).select().single()
    if (!error && data) setCategories(prev => [...prev, { ...data, tasks: [] }])
    setNewCatName(''); setAddingCat(false)
  }

  async function deleteCategory(catId) {
    if (!window.confirm('Delete this entire category and all its tasks?')) return
    await supabase.from('tasks').delete().eq('category_id', catId)
    await supabase.from('categories').delete().eq('id', catId)
    setCategories(prev => prev.filter(c => c.id !== catId))
  }

  async function addTask(catId) {
    const cat = categories.find(c => c.id === catId)
    const { data, error } = await supabase.from('tasks').insert({
      category_id: catId, description: '', lead: '',
      status: 'Not Started', progress: '', sort_order: cat ? cat.tasks.length : 0
    }).select().single()
    if (!error && data) setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, tasks: [...c.tasks, data] } : c
    ))
  }

  async function updateTask(catId, taskId, field, value) {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t) } : c
    ))
    await supabase.from('tasks').update({ [field]: value }).eq('id', taskId)
  }

  async function deleteTask(catId, taskId) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c
    ))
  }

  const STATUS_OPTS = ['Not Started', 'In Progress', 'Done']
  const STATUS_STYLE = {
    'Not Started': { bg: '#F3F4F6', color: '#6B7280' },
    'In Progress': { bg: '#FEF3C7', color: '#D97706' },
    'Done':        { bg: '#D1FAE5', color: '#059669' },
  }

  const TaskCard = ({ task, catId, ti, totalTasks }) => {
    const ss = STATUS_STYLE[task.status] || STATUS_STYLE['Not Started']

    if (isMobile) {
      return (
        <div
          draggable
          onDragStart={() => handleDragStart(catId, ti)}
          onDragEnter={() => handleDragEnter(catId, ti)}
          onDragEnd={handleDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{
            padding: '14px 16px',
            borderBottom: ti < totalTasks - 1 ? '1px solid #F3F4F6' : 'none',
            background: ti % 2 === 1 ? '#FAFAFA' : '#FFF',
          }}
        >
          {/* Mobile top row: drag handle + status + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: '#C0C0C0', fontSize: '18px', cursor: 'grab', userSelect: 'none' }}>⠿</span>
            <select
              value={task.status}
              onChange={e => updateTask(catId, task.id, 'status', e.target.value)}
              style={{
                border: 'none', borderRadius: '8px', padding: '4px 8px',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                background: ss.bg, color: ss.color, outline: 'none',
              }}
            >
              {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={() => deleteTask(catId, task.id)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#D1D5DB', fontSize: '18px', padding: '0 4px',
              }}
              onMouseOver={e => e.target.style.color = '#EF4444'}
              onMouseOut={e => e.target.style.color = '#D1D5DB'}
            >✕</button>
          </div>

          {/* Task description */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Task</div>
            <textarea
              value={task.description}
              onChange={e => updateTask(catId, task.id, 'description', e.target.value)}
              placeholder="What needs to be done..."
              rows={2}
              style={{
                width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px',
                padding: '8px', fontSize: '14px', color: '#1F2937',
                resize: 'vertical', outline: 'none', lineHeight: '1.5',
                background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Lead */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Taking the Lead</div>
            <input
              value={task.lead}
              onChange={e => updateTask(catId, task.id, 'lead', e.target.value)}
              placeholder="Name..."
              style={{
                width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px',
                padding: '8px', fontSize: '14px', color: '#374151',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Progress */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Progress Notes</div>
            <textarea
              value={task.progress}
              onChange={e => updateTask(catId, task.id, 'progress', e.target.value)}
              placeholder="Updates, blockers..."
              rows={2}
              style={{
                width: '100%', border: '1px solid #E5E7EB', borderRadius: '8px',
                padding: '8px', fontSize: '13px', color: '#6B7280',
                resize: 'vertical', outline: 'none', fontStyle: 'italic',
                lineHeight: '1.5', background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )
    }

    // Desktop layout
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(catId, ti)}
        onDragEnter={() => handleDragEnter(catId, ti)}
        onDragEnd={handleDragEnd}
        onDragOver={e => e.preventDefault()}
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr 180px 130px 1fr 40px',
          padding: '12px 20px',
          borderBottom: ti < totalTasks - 1 ? '1px solid #F3F4F6' : 'none',
          background: ti % 2 === 1 ? '#FAFAFA' : '#FFF',
          alignItems: 'start',
        }}
      >
        <div style={{ color: '#C0C0C0', fontSize: '18px', paddingTop: '4px', cursor: 'grab', userSelect: 'none', textAlign: 'center' }} title="Drag to reorder">⠿</div>
        <textarea value={task.description} onChange={e => updateTask(catId, task.id, 'description', e.target.value)} placeholder="What needs to be done..." rows={2}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '14px', color: '#1F2937', resize: 'vertical', outline: 'none', paddingRight: '12px', lineHeight: '1.5', cursor: 'text' }} />
        <input value={task.lead} onChange={e => updateTask(catId, task.id, 'lead', e.target.value)} placeholder="Name..."
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '14px', color: '#374151', outline: 'none', paddingRight: '12px', cursor: 'text' }} />
        <select value={task.status} onChange={e => updateTask(catId, task.id, 'status', e.target.value)}
          style={{ border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', background: ss.bg, color: ss.color, outline: 'none', marginRight: '12px' }}>
          {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <textarea value={task.progress} onChange={e => updateTask(catId, task.id, 'progress', e.target.value)} placeholder="Progress notes, updates, blockers..." rows={2}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '13px', color: '#6B7280', resize: 'vertical', outline: 'none', fontStyle: 'italic', lineHeight: '1.5', cursor: 'text' }} />
        <button onClick={() => deleteTask(catId, task.id)}
          style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: '16px', padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
          onMouseOver={e => e.target.style.color = '#EF4444'} onMouseOut={e => e.target.style.color = '#D1D5DB'}>✕</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', display: 'flex', flexDirection: 'column' }}>
      <div className="rainbow-bar" />

      <div style={{ background: sc.color }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '6px' }}>
                🌈 Shoals PrideFest 2026
              </div>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', color: '#FFF', lineHeight: 1.1 }}>
                {sc.emoji} {sc.label}
              </h1>
            </div>
            <button onClick={onLogout} style={{
              padding: '9px 18px', background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: '10px', color: '#FFF', fontSize: '13px', fontWeight: '600',
            }}>← Switch Subcommittee</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '16px' }}>Loading your workspace...</div>
        ) : (
          <>
            {categories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', border: '2px dashed #D1D5DB', borderRadius: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{sc.emoji}</div>
                <h2 style={{ fontSize: '22px', color: '#374151', marginBottom: '8px' }}>No categories yet</h2>
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Add your first category below — like "Art Exhibit" or "Drag Show Decor"</p>
              </div>
            )}

            {categories.map((cat, ci) => (
              <div key={cat.id} className="fade-up" style={{
                animationDelay: `${ci * 0.05}s`, background: '#FFF', borderRadius: '18px',
                border: '1.5px solid #E5E7EB', marginBottom: '24px',
                overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}>
                <div style={{ background: sc.color, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', color: '#FFF', fontFamily: 'Playfair Display, serif' }}>{cat.name}</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{cat.tasks.length} task{cat.tasks.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => deleteCategory(cat.id)} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px' }}>✕ Remove</button>
                  </div>
                </div>

                {/* Desktop column headers only */}
                {!isMobile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 180px 130px 1fr 40px', background: '#F9FAFB', borderBottom: '1.5px solid #E5E7EB', padding: '10px 20px' }}>
                    {['', 'Task — What Needs to Be Done', 'Taking the Lead', 'Status', 'Progress Notes', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', paddingRight: i < 5 ? '12px' : '0' }}>{h}</div>
                    ))}
                  </div>
                )}

                {cat.tasks.length === 0 && (
                  <div style={{ padding: '20px', color: '#D1D5DB', fontSize: '14px', textAlign: 'center' }}>No tasks yet — add one below</div>
                )}

                {cat.tasks.map((task, ti) => (
                  <TaskCard key={task.id} task={task} catId={cat.id} ti={ti} totalTasks={cat.tasks.length} />
                ))}

                <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6' }}>
                  <button onClick={() => addTask(cat.id)} style={{
                    background: 'none', border: `1.5px dashed ${sc.color}`, color: sc.color,
                    borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: '600',
                    width: '100%', transition: 'background 0.15s',
                  }}
                    onMouseOver={e => e.target.style.background = `${sc.color}15`}
                    onMouseOut={e => e.target.style.background = 'none'}
                  >+ Add Task</button>
                </div>
              </div>
            ))}

            {addingCat ? (
              <div className="fade-in" style={{ background: '#FFF', borderRadius: '14px', padding: '20px', border: `2px solid ${sc.color}`, display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="Category name (e.g. Art Exhibit, Drag Show Decor...)"
                  style={{ flex: 1, minWidth: '200px', border: 'none', fontSize: '16px', outline: 'none', color: '#1F2937' }} />
                <button onClick={addCategory} style={{ background: sc.color, border: 'none', color: '#FFF', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: '700' }}>Add</button>
                <button onClick={() => { setAddingCat(false); setNewCatName('') }} style={{ background: 'none', border: '1.5px solid #E5E7EB', color: '#9CA3AF', borderRadius: '10px', padding: '10px 16px', fontSize: '14px' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingCat(true)} style={{
                width: '100%', padding: '16px', background: sc.color, border: 'none',
                borderRadius: '14px', color: '#FFF', fontSize: '16px', fontWeight: '700',
                fontFamily: 'Playfair Display, serif', boxShadow: `0 4px 20px ${sc.color}55`,
                transition: 'opacity 0.2s, transform 0.2s',
              }}
                onMouseOver={e => { e.target.style.opacity='0.88'; e.target.style.transform='translateY(-1px)' }}
                onMouseOut={e => { e.target.style.opacity='1'; e.target.style.transform='translateY(0)' }}
              >+ Add New Category</button>
            )}
          </>
        )}
      </div>

      <div className="rainbow-bar" style={{ marginTop: 'auto' }} />
    </div>
  )
}
