import React, { useState } from 'react'
import RoleManager from './components/RoleManager'

function App() {
  const [currentPage, setCurrentPage] = useState('roles')

  const pages = {
    roles: { label: '角色管理', component: <RoleManager /> },
    assembler: { label: '拼裝工具', component: <div className="text-center py-12"><p className="text-gray-500">拼裝工具開發中...</p></div> },
    tester: { label: '對話測試', component: <div className="text-center py-12"><p className="text-gray-500">對話測試開發中...</p></div> },
    settings: { label: '設定', component: <div className="text-center py-12"><p className="text-gray-500">設定頁面開發中...</p></div> },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">DreamMaker</h1>
            <nav className="flex space-x-4">
              {Object.entries(pages).map(([key, page]) => (
                <button
                  key={key}
                  onClick={() => setCurrentPage(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {pages[currentPage].component}
        </div>
      </main>
    </div>
  )
}

export default App
