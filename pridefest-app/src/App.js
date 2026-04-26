import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import SubcommitteeDashboard from './components/SubcommitteeDashboard'
import BoardDashboard from './components/BoardDashboard'
import './App.css'

// Passcodes — change these before sharing!
export const PASSCODES = {
  'venue-design':      { code: 'VENUE826', label: 'Venue Design & Local Art' },
  'operations':        { code: 'OPS2026',  label: 'Operations, Safety & Logistics' },
  'outreach':          { code: 'OUT417',   label: 'Community Outreach / Partnerships / Fundraising' },
  'programming':       { code: 'PROG553',  label: 'Programming & Entertainment' },
  'branding-design':   { code: 'BRD991',   label: 'Branding & Marketing: DESIGN' },
  'branding-impl':     { code: 'BRI664',   label: 'Branding & Marketing: IMPLEMENTATION' },
  'board':             { code: 'BOARD2026',label: 'Board — Full Overview' },
}

export const SUBCOMMITTEES = [
  { id: 'venue-design',    label: 'Venue Design & Local Art',                          emoji: '🎨', color: '#C0392B' },
  { id: 'operations',      label: 'Operations, Safety & Logistics',                    emoji: '⚙️',  color: '#1A5276' },
  { id: 'outreach',        label: 'Community Outreach / Partnerships / Fundraising',   emoji: '🤝', color: '#1A7A4A' },
  { id: 'programming',     label: 'Programming & Entertainment',                       emoji: '🎤', color: '#6C3483' },
  { id: 'branding-design', label: 'Branding & Marketing: DESIGN',                     emoji: '✏️',  color: '#B7770D' },
  { id: 'branding-impl',   label: 'Branding & Marketing: IMPLEMENTATION',              emoji: '📣', color: '#117A65' },
]

export default function App() {
  const [view, setView]               = useState('landing') // 'landing' | 'subcommittee' | 'board'
  const [activeSubcommittee, setActive] = useState(null)

  // Persist session in localStorage so refresh doesn't log you out
  useEffect(() => {
    const saved = localStorage.getItem('pf_session')
    if (saved) {
      const { view: v, id } = JSON.parse(saved)
      setView(v)
      if (id) setActive(id)
    }
  }, [])

  const login = (subcommitteeId) => {
    if (subcommitteeId === 'board') {
      const session = { view: 'board', id: null }
      localStorage.setItem('pf_session', JSON.stringify(session))
      setView('board')
    } else {
      const session = { view: 'subcommittee', id: subcommitteeId }
      localStorage.setItem('pf_session', JSON.stringify(session))
      setActive(subcommitteeId)
      setView('subcommittee')
    }
  }

  const logout = () => {
    localStorage.removeItem('pf_session')
    setView('landing')
    setActive(null)
  }

  if (view === 'subcommittee' && activeSubcommittee) {
    const sc = SUBCOMMITTEES.find(s => s.id === activeSubcommittee)
    return <SubcommitteeDashboard subcommittee={sc} onLogout={logout} />
  }

  if (view === 'board') {
    return <BoardDashboard subcommittees={SUBCOMMITTEES} onLogout={logout} />
  }

  return <LandingPage subcommittees={SUBCOMMITTEES} passcodes={PASSCODES} onLogin={login} />
}
