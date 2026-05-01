import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const STATUS_STYLE = {
  'Not Started': { bg: '#F3F4F6', color: '#6B7280' },
  'In Progress': { bg: '#FEF3C7', color: '#D97706' },
  'Done':        { bg: '#D1FAE5', color: '#059669' },
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function BoardDashboard({ subcommittees, onLogout }) {
  const [data, setData]         = useState({})
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => { loadAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAll() {
    setLoading(true)
    const result = {}

    for (const sc of subcommittees) {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('subcommittee_id', sc.id)
        .order('created_at')

      if (!cats || cats.length === 0) { result[sc.id] = []; continue }

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('category_id', cats.map(c => c.id))
        .order('sort_order', { ascending: true })

      result[sc.id] = cats.map(cat => ({
        ...cat,
        tasks: (tasks || []).filter(t => t.category_id === cat.id)
      }))
    }

    setData(result)
    setLoading(false)
  }

  const toggleSC = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const totalTasks = (scId) => (data[scId] || []).reduce((s, c) => s + c.tasks.length, 0)
  const doneTasks  = (scId) => (data[scId] || []).reduce((s, c) => s + c.tasks.filter(t => t.status === 'Done').length, 0)
  const inProgress = (scId) => (data[scId] || []).reduce((s, c) => s + c.tasks.filter(t => t.status === 'In Progress').length, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', flexDirection: 'column' }}>
      <div className="rainbow-bar" />

      <div style={{ padding: '36px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.18em', color: '#FFD700', textTransform: 'uppercase', marginBottom: '10px' }}>
          🌈 Overview — Read Only
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 48px)', color: '#FFF', marginBottom: '8px' }}>
          Shoals PrideFest 2026
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '15px', marginBottom: '32px' }}>
          All subcommittee activity — view only
        </p>
        <button onClick={onLogout} style={{
          padding: '10px 22px', background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '10px',
          color: '#FFF', fontSize: '13px', fontWeight: '600',
        }}>← Back to Login</button>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading all subcommittees...</div>
        ) : (
          subcommittees.map((sc, i) => {
            const cats   = data[sc.id] || []
            const total  = totalTasks(sc.id)
            const done   = doneTasks(sc.id)
            const inProg = inProgress(sc.id)
            const isOpen = expanded[sc.id]

            return (
              <div key={sc.id} className="fade-up" style={{
                animationDelay: `${i * 0.07}s`,
                background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${sc.color}55`,
                borderRadius: '18px', marginBottom: '16px', overflow: 'hidden',
              }}>
                <div onClick={() => toggleSC(sc.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '20px 24px', cursor: 'pointer',
                  borderLeft: `5px solid ${sc.color}`,
                }}>
                  <span style={{ fontSize: '22px' }}>{sc.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFF' }}>{sc.label}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{total} tasks total</span>
                      {inProg > 0 && <span style={{ fontSize: '12px', color: '#D97706' }}>● {inProg} in progress</span>}
                      {done > 0  && <span style={{ fontSize: '12px', color: '#059669' }}>✓ {done} done</span>}
                      {cats.length === 0 && <span style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>No activity yet</span>}
                    </div>
                  </div>
                  <span style={{ color: '#9CA3AF', fontSize: '20px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>

                {isOpen && (
                  <div className="fade-in" style={{ borderTop: `1px solid ${sc.color}33` }}>
                    {cats.length === 0 ? (
                      <div style={{ padding: '24px', color: '#6B7280', fontSize: '14px', textAlign: 'center', fontStyle: 'italic' }}>
                        This subcommittee hasn't added any categories yet.
                      </div>
                    ) : cats.map(cat => (
                      <div key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ padding: '14px 24px 10px', fontSize: '13px', fontWeight: '700', color: sc.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {cat.name} <span style={{ color: '#6B7280', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>({cat.tasks.length} tasks)</span>
                        </div>
                        {cat.tasks.length === 0 ? (
                          <div style={{ padding: '0 24px 14px', color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>No tasks yet</div>
                        ) : cat.tasks.map((task, ti) => {
                          const ss = STATUS_STYLE[task.status] || STATUS_STYLE['Not Started']
                          const updated = timeAgo(task.updated_at)
                          return (
                            <div key={task.id} style={{
                              padding: '12px 24px',
                              background: ti % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                              {/* Top row: status + updated */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: ss.bg, color: ss.color }}>
                                  {task.status}
                                </span>
                                {updated && (
                                  <span style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>✎ {updated}</span>
                                )}
                                {task.lead && (
                                  <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: 'auto' }}>👤 {task.lead}</span>
                                )}
                              </div>
                              {/* Task description */}
                              <div style={{ fontSize: '14px', color: '#E5E7EB', lineHeight: 1.5, marginBottom: task.progress ? '6px' : '0' }}>
                                {task.description || <span style={{ color: '#4B5563', fontStyle: 'italic' }}>No description</span>}
                              </div>
                              {/* Progress notes */}
                              {task.progress && (
                                <div style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic', lineHeight: 1.5 }}>
                                  {task.progress}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {/* Column headers for first category */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="rainbow-bar" style={{ marginTop: 'auto' }} />
    </div>
  )
}
