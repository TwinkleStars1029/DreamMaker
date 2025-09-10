import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, Module, RoleVersion, Conversation, Message, ProviderConfig, ExportData } from '../types'

export const useAppStore = defineStore('app', () => {
  // 狀態
  const roles = ref<Role[]>([])
  const modules = ref<Module[]>([])
  const versions = ref<RoleVersion[]>([])
  const conversations = ref<Conversation[]>([])
  const providerConfigs = ref<ProviderConfig[]>([])
  const currentRoleId = ref<string | undefined>(undefined)
  const currentVersionId = ref<string | undefined>(undefined)
  const currentConversationId = ref<string | undefined>(undefined)
  const isLoading = ref(false)
  const error = ref<string | undefined>(undefined)

  // 計算屬性
  const currentRole = computed(() => 
    roles.value.find(role => role.id === currentRoleId.value)
  )

  const currentVersion = computed(() => 
    versions.value.find(version => version.id === currentVersionId.value)
  )

  const currentConversation = computed(() => 
    conversations.value.find(conv => conv.id === currentConversationId.value)
  )

  // 角色管理
  const createRole = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRole: Role = {
      ...roleData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    roles.value.push(newRole)
    saveToLocalStorage()
  }

  const updateRole = (id: string, updates: Partial<Role>) => {
    const index = roles.value.findIndex(role => role.id === id)
    if (index !== -1) {
      roles.value[index] = {
        ...roles.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      saveToLocalStorage()
    }
  }

  const deleteRole = (id: string) => {
    roles.value = roles.value.filter(role => role.id !== id)
    versions.value = versions.value.filter(version => version.roleId !== id)
    conversations.value = conversations.value.filter(conv => 
      versions.value.find(v => v.id === conv.roleVersionId)?.roleId !== id
    )
    if (currentRoleId.value === id) {
      currentRoleId.value = undefined
    }
    saveToLocalStorage()
  }

  // 模組管理
  const createModule = (moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newModule: Module = {
      ...moduleData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    modules.value.push(newModule)
    saveToLocalStorage()
  }

  const updateModule = (id: string, updates: Partial<Module>) => {
    const index = modules.value.findIndex(module => module.id === id)
    if (index !== -1) {
      modules.value[index] = {
        ...modules.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      saveToLocalStorage()
    }
  }

  const deleteModule = (id: string) => {
    modules.value = modules.value.filter(module => module.id !== id)
    versions.value = versions.value.map(version => ({
      ...version,
      moduleIds: version.moduleIds.filter(moduleId => moduleId !== id),
    }))
    saveToLocalStorage()
  }

  // 版本管理
  const createVersion = (versionData: Omit<RoleVersion, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVersion: RoleVersion = {
      ...versionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    versions.value.push(newVersion)
    saveToLocalStorage()
  }

  const updateVersion = (id: string, updates: Partial<RoleVersion>) => {
    const index = versions.value.findIndex(version => version.id === id)
    if (index !== -1) {
      versions.value[index] = {
        ...versions.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      saveToLocalStorage()
    }
  }

  const deleteVersion = (id: string) => {
    versions.value = versions.value.filter(version => version.id !== id)
    conversations.value = conversations.value.filter(conv => conv.roleVersionId !== id)
    if (currentVersionId.value === id) {
      currentVersionId.value = undefined
    }
    saveToLocalStorage()
  }

  // 對話管理
  const createConversation = (conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConversation: Conversation = {
      ...conversationData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    conversations.value.push(newConversation)
    saveToLocalStorage()
  }

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    const index = conversations.value.findIndex(conversation => conversation.id === id)
    if (index !== -1) {
      conversations.value[index] = {
        ...conversations.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      saveToLocalStorage()
    }
  }

  const deleteConversation = (id: string) => {
    conversations.value = conversations.value.filter(conversation => conversation.id !== id)
    if (currentConversationId.value === id) {
      currentConversationId.value = undefined
    }
    saveToLocalStorage()
  }

  const addMessage = (conversationId: string, messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  // 設定管理
  const createProviderConfig = (configData: Omit<ProviderConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConfig: ProviderConfig = {
      ...configData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    providerConfigs.value.push(newConfig)
    saveToLocalStorage()
  }

  const updateProviderConfig = (id: string, updates: Partial<ProviderConfig>) => {
    const index = providerConfigs.value.findIndex(config => config.id === id)
    if (index !== -1) {
      providerConfigs.value[index] = {
        ...providerConfigs.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      saveToLocalStorage()
    }
  }

  const deleteProviderConfig = (id: string) => {
    providerConfigs.value = providerConfigs.value.filter(config => config.id !== id)
    saveToLocalStorage()
  }

  // 狀態管理
  const setCurrentRole = (id?: string) => {
    currentRoleId.value = id
  }

  const setCurrentVersion = (id?: string) => {
    currentVersionId.value = id
  }

  const setCurrentConversation = (id?: string) => {
    currentConversationId.value = id
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err?: string) => {
    error.value = err
  }

  // 匯入/匯出
  const importData = (data: ExportData) => {
    roles.value = data.roles || []
    modules.value = data.modules || []
    versions.value = data.versions || []
    conversations.value = data.conversations || []
    providerConfigs.value = data.providerConfigs || []
    saveToLocalStorage()
  }

  const exportData = (): ExportData => {
    return {
      schemaVersion: '1.0.0',
      roles: roles.value,
      modules: modules.value,
      versions: versions.value,
      conversations: conversations.value,
      providerConfigs: providerConfigs.value,
      exportedAt: new Date().toISOString(),
    }
  }

  // 本地儲存
  const saveToLocalStorage = () => {
    const data = {
      roles: roles.value,
      modules: modules.value,
      versions: versions.value,
      conversations: conversations.value,
      providerConfigs: providerConfigs.value,
      currentRoleId: currentRoleId.value,
      currentVersionId: currentVersionId.value,
      currentConversationId: currentConversationId.value,
    }
    localStorage.setItem('dreammaker-storage', JSON.stringify(data))
  }

  const loadFromLocalStorage = () => {
    const data = localStorage.getItem('dreammaker-storage')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        roles.value = parsed.roles || []
        modules.value = parsed.modules || []
        versions.value = parsed.versions || []
        conversations.value = parsed.conversations || []
        providerConfigs.value = parsed.providerConfigs || []
        currentRoleId.value = parsed.currentRoleId
        currentVersionId.value = parsed.currentVersionId
        currentConversationId.value = parsed.currentConversationId
      } catch (error) {
        console.error('Failed to load data from localStorage:', error)
      }
    }
  }

  // 初始化時載入資料
  loadFromLocalStorage()

  return {
    // 狀態
    roles,
    modules,
    versions,
    conversations,
    providerConfigs,
    currentRoleId,
    currentVersionId,
    currentConversationId,
    isLoading,
    error,
    // 計算屬性
    currentRole,
    currentVersion,
    currentConversation,
    // 角色管理
    createRole,
    updateRole,
    deleteRole,
    // 模組管理
    createModule,
    updateModule,
    deleteModule,
    // 版本管理
    createVersion,
    updateVersion,
    deleteVersion,
    // 對話管理
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    // 設定管理
    createProviderConfig,
    updateProviderConfig,
    deleteProviderConfig,
    // 狀態管理
    setCurrentRole,
    setCurrentVersion,
    setCurrentConversation,
    setLoading,
    setError,
    // 匯入/匯出
    importData,
    exportData,
  }
})
