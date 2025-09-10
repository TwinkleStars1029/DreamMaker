import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, AppActions, Role, Module, RoleVersion, Conversation, Message, ProviderConfig, ExportData } from '../types'

const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // 初始狀態
      roles: [],
      modules: [],
      versions: [],
      conversations: [],
      providerConfigs: [],
      currentRoleId: undefined,
      currentVersionId: undefined,
      currentConversationId: undefined,
      isLoading: false,
      error: undefined,

      // 角色管理
      createRole: (roleData) => {
        const newRole: Role = {
          ...roleData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          roles: [...state.roles, newRole],
        }))
      },

      updateRole: (id, updates) => {
        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === id
              ? { ...role, ...updates, updatedAt: new Date().toISOString() }
              : role
          ),
        }))
      },

      deleteRole: (id) => {
        set((state) => ({
          roles: state.roles.filter((role) => role.id !== id),
          versions: state.versions.filter((version) => version.roleId !== id),
          conversations: state.conversations.filter((conv) => 
            state.versions.find((v) => v.id === conv.roleVersionId)?.roleId !== id
          ),
        }))
      },

      // 模組管理
      createModule: (moduleData) => {
        const newModule: Module = {
          ...moduleData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          modules: [...state.modules, newModule],
        }))
      },

      updateModule: (id, updates) => {
        set((state) => ({
          modules: state.modules.map((module) =>
            module.id === id
              ? { ...module, ...updates, updatedAt: new Date().toISOString() }
              : module
          ),
        }))
      },

      deleteModule: (id) => {
        set((state) => ({
          modules: state.modules.filter((module) => module.id !== id),
          versions: state.versions.map((version) => ({
            ...version,
            moduleIds: version.moduleIds.filter((moduleId) => moduleId !== id),
          })),
        }))
      },

      // 版本管理
      createVersion: (versionData) => {
        const newVersion: RoleVersion = {
          ...versionData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          versions: [...state.versions, newVersion],
        }))
      },

      updateVersion: (id, updates) => {
        set((state) => ({
          versions: state.versions.map((version) =>
            version.id === id
              ? { ...version, ...updates, updatedAt: new Date().toISOString() }
              : version
          ),
        }))
      },

      deleteVersion: (id) => {
        set((state) => ({
          versions: state.versions.filter((version) => version.id !== id),
          conversations: state.conversations.filter((conv) => conv.roleVersionId !== id),
        }))
      },

      // 對話管理
      createConversation: (conversationData) => {
        const newConversation: Conversation = {
          ...conversationData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          conversations: [...state.conversations, newConversation],
        }))
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === id
              ? { ...conversation, ...updates, updatedAt: new Date().toISOString() }
              : conversation
          ),
        }))
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conversation) => conversation.id !== id),
        }))
      },

      addMessage: (conversationId, messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: [...conversation.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                }
              : conversation
          ),
        }))
      },

      // 設定管理
      createProviderConfig: (configData) => {
        const newConfig: ProviderConfig = {
          ...configData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          providerConfigs: [...state.providerConfigs, newConfig],
        }))
      },

      updateProviderConfig: (id, updates) => {
        set((state) => ({
          providerConfigs: state.providerConfigs.map((config) =>
            config.id === id
              ? { ...config, ...updates, updatedAt: new Date().toISOString() }
              : config
          ),
        }))
      },

      deleteProviderConfig: (id) => {
        set((state) => ({
          providerConfigs: state.providerConfigs.filter((config) => config.id !== id),
        }))
      },

      // 狀態管理
      setCurrentRole: (id) => {
        set({ currentRoleId: id })
      },

      setCurrentVersion: (id) => {
        set({ currentVersionId: id })
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      // 匯入/匯出
      importData: (data) => {
        set({
          roles: data.roles || [],
          modules: data.modules || [],
          versions: data.versions || [],
          conversations: data.conversations || [],
          providerConfigs: data.providerConfigs || [],
        })
      },

      exportData: () => {
        const state = get()
        return {
          schemaVersion: '1.0.0',
          roles: state.roles,
          modules: state.modules,
          versions: state.versions,
          conversations: state.conversations,
          providerConfigs: state.providerConfigs,
          exportedAt: new Date().toISOString(),
        }
      },
    }),
    {
      name: 'dreammaker-storage',
      partialize: (state) => ({
        roles: state.roles,
        modules: state.modules,
        versions: state.versions,
        conversations: state.conversations,
        providerConfigs: state.providerConfigs,
        currentRoleId: state.currentRoleId,
        currentVersionId: state.currentVersionId,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)

export default useAppStore
