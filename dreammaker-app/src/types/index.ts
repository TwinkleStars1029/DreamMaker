// 基本資料模型
export interface Role {
  id: string
  name: string
  description: string
  avatarUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  type: 'persona' | 'background' | 'instruction'
  title: string
  content: string
  toneHints?: string[]
  createdAt: string
  updatedAt: string
}

export interface RoleVersion {
  id: string
  roleId: string
  moduleIds: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  providerMeta?: {
    provider: string
    model: string
    latencyMs: number
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }
  createdAt: string
}

export interface Conversation {
  id: string
  roleVersionId: string
  title?: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface ProviderConfig {
  id: string
  provider: 'openai' | 'gemini' | 'azure'
  model: string
  apiKeyRef: string
  params: {
    temperature?: number
    topP?: number
    maxTokens?: number
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

export interface CompareRun {
  id: string
  inputMessages: Message[]
  runs: Array<{
    providerConfigId: string
    response: Message
    latencyMs: number
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }>
  createdAt: string
}

export interface SheetMapping {
  roleSheetId: string
  moduleSheetId: string
  versionSheetId: string
  lastSyncAt: string
}

// 匯入/匯出格式
export interface ExportData {
  schemaVersion: string
  roles: Role[]
  modules: Module[]
  versions: RoleVersion[]
  conversations?: Conversation[]
  providerConfigs?: ProviderConfig[]
  exportedAt: string
}

// AI 供應商抽象介面
export interface AiProvider {
  sendMessages(request: AiRequest): Promise<AiResponse>
}

export interface AiRequest {
  provider: string
  model: string
  apiKey: string
  promptParts: string[]
  messages: Message[]
  params: Record<string, any>
}

export interface AiResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latencyMs: number
  provider: string
  model: string
}