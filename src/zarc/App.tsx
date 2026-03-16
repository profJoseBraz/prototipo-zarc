import { useState } from 'react'
import { ZarcDashboard } from './ZarcDashboard'
import { ZarcRequestDetail } from './ZarcRequestDetail'
import { ZarcWizard } from './ZarcWizard'
import { ZarcSend } from './ZarcSend'
import type { ZarcRequest, ZarcScreen } from './types'
import { mockRequests } from './mockData'

export function App() {
  const [screen, setScreen] = useState<ZarcScreen>('dashboard')
  const [requests, setRequests] = useState<ZarcRequest[]>(mockRequests)
  const [selectedId, setSelectedId] = useState<string | null>(mockRequests[0]?.id ?? null)

  const selected = requests.find((r) => r.id === selectedId) ?? null

  const goToDashboard = () => setScreen('dashboard')

  const handleOpenDetail = (id: string) => {
    setSelectedId(id)
    setScreen('detail')
  }

  const handleOpenWizard = (existingId?: string) => {
    if (existingId) {
      setSelectedId(existingId)
    } else {
      setSelectedId(null)
    }
    setScreen('wizard')
  }

  const handleOpenSend = (id: string) => {
    setSelectedId(id)
    setScreen('send')
  }

  const upsertRequest = (request: ZarcRequest) => {
    setRequests((prev) => {
      const exists = prev.some((r) => r.id === request.id)
      if (exists) {
        return prev.map((r) => (r.id === request.id ? request : r))
      }
      return [...prev, request]
    })
    setSelectedId(request.id)
  }

  return (
    <div className="layout-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">coamo</span>
          <span className="logo-sub">Assistente Técnico da Cooperativa</span>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-item active" type="button" onClick={goToDashboard}>
            Início
          </button>
          <button className="sidebar-item" type="button" onClick={goToDashboard}>
            GeoCoamo
          </button>
          <button className="sidebar-item" type="button" onClick={() => handleOpenWizard()}>
            Solicitações ZARC
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-collapse" type="button">
            Ocultar Menu
          </button>
        </div>
      </aside>

      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>Início</h1>
            <p className="app-subtitle">Consulta de solicitações ZARC e fluxo de integração.</p>
          </div>
          <div className="app-header-actions">
            <div className="user-pill">
              <span className="user-avatar">JO</span>
              <span className="user-name">Olá, José Braz</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          {screen === 'dashboard' && (
            <ZarcDashboard
              requests={requests}
              onOpenDetail={handleOpenDetail}
              onOpenWizard={handleOpenWizard}
            />
          )}

          {screen === 'detail' && selected && (
            <ZarcRequestDetail
              request={selected}
              onBack={goToDashboard}
              onEdit={() => handleOpenWizard(selected.id)}
              onOpenSend={handleOpenSend}
            />
          )}

          {screen === 'wizard' && (
            <ZarcWizard
              existing={selected}
              onCancel={goToDashboard}
              onSave={upsertRequest}
              onFinish={(saved) => {
                upsertRequest(saved)
                setScreen('send')
              }}
            />
          )}

          {screen === 'send' && selected && (
            <ZarcSend
              request={selected}
              onBack={goToDashboard}
              onBackToReview={() => setScreen('detail')}
            />
          )}
        </main>
      </div>
    </div>
  )
}

