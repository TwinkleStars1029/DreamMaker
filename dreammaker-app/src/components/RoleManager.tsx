import React, { useState } from 'react'
import useAppStore from '../store'

const RoleManager: React.FC = () => {
  const { roles, createRole, updateRole, deleteRole, setCurrentRole, currentRoleId } = useAppStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    tags: '',
  })

  const handleCreate = () => {
    if (!formData.name.trim()) return

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    
    createRole({
      name: formData.name,
      description: formData.description,
      avatarUrl: formData.avatarUrl || undefined,
      tags,
    })

    setFormData({ name: '', description: '', avatarUrl: '', tags: '' })
    setIsCreating(false)
  }

  const handleEdit = (role: typeof roles[0]) => {
    setEditingId(role.id)
    setFormData({
      name: role.name,
      description: role.description,
      avatarUrl: role.avatarUrl || '',
      tags: role.tags.join(', '),
    })
  }

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) return

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    
    updateRole(editingId, {
      name: formData.name,
      description: formData.description,
      avatarUrl: formData.avatarUrl || undefined,
      tags,
    })

    setFormData({ name: '', description: '', avatarUrl: '', tags: '' })
    setEditingId(null)
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', avatarUrl: '', tags: '' })
    setIsCreating(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">角色管理</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新增角色
        </button>
      </div>

      {/* 建立/編輯表單 */}
      {(isCreating || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '編輯角色' : '新增角色'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色名稱 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="輸入角色名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="描述角色的背景、性格等"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                頭像網址
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標籤
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="用逗號分隔多個標籤，例如：溫柔, 聰明, 神秘"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? '更新' : '建立'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 角色列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
              currentRoleId === role.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setCurrentRole(role.id)}
          >
            <div className="flex items-start space-x-4">
              {role.avatarUrl ? (
                <img
                  src={role.avatarUrl}
                  alt={role.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {role.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {role.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {role.description}
                </p>
                {role.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(role)
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                編輯
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('確定要刪除這個角色嗎？')) {
                    deleteRole(role.id)
                    if (currentRoleId === role.id) {
                      setCurrentRole(undefined)
                    }
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">還沒有任何角色，點擊「新增角色」開始建立吧！</p>
        </div>
      )}
    </div>
  )
}

export default RoleManager
