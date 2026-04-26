import { useState } from 'react'

export default function LandingPage({ subcommittees, passcodes, onLogin }) {
  const [selected, setSelected]   = useState(null)
  const [code, setCode]           = useState('')
  const [error, setError]         = useState('')
  const [showBoard, setShowBoard] = useState(false)

  const allEntries = [
    ...subcommittees,
    { id: 'board', label: 'Board — Full Overview', emoji: '👑', color: '#2C2C2C' }
  ]

  const handleSelect = (id) => {
    setSelected(id)
    setCode('')
    setError('')
    setShowBoard(id === 'board')
  }

  const handleSubmit = () => {
    const entry = passcodes[selected]
    if (!entry) return
    if (code.trim().toUpperCase() === entry.code.toUpperCase()) {
      onLogin(selected)
    } else {
      setError('Incorrect passcode. Please try again.')
      setCode('')
    }
  }

  const sc = selected ? allEntries.find(s => s.id === selected) : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F0F1A' }}>
      <div className="rainbow-bar" />

      {/* Hero */}
      <div style={{ padding: '56px 24px 40px', textAlign: 'center' }}>
        <div style={{
          fontSize: '13px', fontWeight: '600', letterSpacing: '0.18em',
          color: '#FFD700', textTransform: 'uppercase', marginBottom: '16px'
        }}>
          🌈 Shoals PrideFest 2026
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 7vw, 60px)', color: '#FFFFFF',
          lineHeight: 1.05, marginBottom: '14px'
        }}>
          Subcommittee<br />Project Tracker
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '16px', maxWidth: '420px', margin: '0 auto 48px' }}>
          Select your subcommittee and enter your passcode to access your workspace.
        </p>

        {/* Subcommittee Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
          maxWidth: '860px',
          margin: '0 auto 32px',
        }}>
          {allEntries.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className="fade-up"
              style={{
                animationDelay: `${i * 0.06}s`,
                padding: '18px 20px',
                background: selected === s.id ? s.color : 'rgba(255,255,255,0.06)',
                border: selected === s.id ? `2px solid ${s.color}` : '2px solid rgba(255,255,255,0.10)',
                borderRadius: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.2s',
                transform: selected === s.id ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: '24px' }}>{s.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', lineHeight: 1.3 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Passcode Entry */}
        {selected && (
          <div className="fade-up" style={{
            maxWidth: '360px', margin: '0 auto',
            background: 'rgba(255,255,255,0.07)',
            border: `2px solid ${sc?.color || '#444'}`,
            borderRadius: '18px',
            padding: '28px 24px',
          }}>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px', fontWeight: '500' }}>
              Passcode for
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFF', marginBottom: '20px' }}>
              {sc?.emoji} {sc?.label}
            </div>
            <input
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter passcode..."
              autoFocus
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '10px',
                border: error ? '2px solid #E40303' : '2px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: '#FFF',
                fontSize: '16px',
                letterSpacing: '0.15em',
                marginBottom: '12px',
                outline: 'none',
              }}
            />
            {error && (
              <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '12px' }}>{error}</div>
            )}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '13px',
                background: sc?.color || '#444',
                border: 'none',
                borderRadius: '10px',
                color: '#FFF',
                fontSize: '15px',
                fontWeight: '700',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.target.style.opacity = '0.85'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Enter Workspace →
            </button>
          </div>
        )}
      </div>

      <div className="rainbow-bar" style={{ marginTop: 'auto' }} />
    </div>
  )
}
