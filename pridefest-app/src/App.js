import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import SubcommitteeDashboard from './components/SubcommitteeDashboard'
import BoardDashboard from './components/BoardDashboard'
import './App.css'

// Passcodes — change these before sharing!
export const PASSCODES = {
  'venue-design': { code: 'VENUE826',  label: 'Venue Design & Local Art' },
  'operations':   { code: 'OPS2026',   label: 'Operations, Safety & Logistics' },
  'outreach':     { code: 'OUT417',    label: 'Community Outreach / Partnerships / Fundraising' },
  'programming':  { code: 'PROG553',   label: 'Programming & Entertainment' },
  'branding':     { code: 'BRD991',    label: 'Branding & Marketing' },
  'board':        { code: 'BOARD2026', label: 'Board — Full Overview' },
}

export const SUBCOMMITTEES = [
  { id: 'venue-design', label: 'Venue Design & Local Art',                        emoji: '🎨', color: '#C0392B' },
  { id: 'operations',   label: 'Operations, Safety & Logistics',                  emoji: '⚙️',  color: '#1A5276' },
  { id: 'outreach',     label: 'Community Outreach / Partnerships / Fundraising', emoji: '🤝', color: '#1A7A4A' },
  { id: 'programming',  label: 'Programming & Entertainment',                     emoji: '🎤', color: '#6C3483' },
  { id: 'branding',     label: 'Branding & Marketing',                            emoji: '📣', color: '#B7770D' },
]

export default function App() {
  const [view, setView]                 = useState('landing')
  const [activeSubcommittee, setActive] = useState(null)

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
      localStorage.setItem('pf_session', JSON.stringify({ view: 'board', id: null }))
      setView('board')
    } else {
      localStorage.setItem('pf_session', JSON.stringify({ view: 'subcommittee', id: subcommitteeId }))
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
