// AI 服務抽象層
export interface AiRequest {
  provider: string
  model: string
  apiKey: string
  promptParts: string[]
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
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

export interface AiProvider {
  sendMessages(request: AiRequest): Promise<AiResponse>
}

export interface ProviderConfig {
  id: string
  name: string
  provider: 'openai' | 'gemini' | 'azure'
  model: string
  apiKey: string
  endpoint?: string // Azure 需要
  params: {
    temperature?: number
    maxTokens?: number
    topP?: number
    [key: string]: any
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// OpenAI 適配器
export class OpenAiAdapter implements AiProvider {
  async sendMessages(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now()
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            ...request.promptParts.map(part => ({
              role: 'system',
              content: part
            })),
            ...request.messages
          ],
          temperature: request.params.temperature || 0.7,
          max_tokens: request.params.maxTokens || 1000,
          top_p: request.params.topP || 1,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API 錯誤: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`)
      }

      const data = await response.json()
      const latencyMs = Date.now() - startTime

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API 回應格式錯誤')
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        latencyMs,
        provider: 'openai',
        model: request.model,
      }
    } catch (error) {
      console.error('OpenAI API 錯誤:', error)
      throw new Error(`OpenAI 請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
}

// Gemini 適配器
export class GeminiAdapter implements AiProvider {
  async sendMessages(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now()
    
    try {
      // 構建 Gemini 格式的內容
      const systemPrompt = request.promptParts.join('\n\n')
      const conversationText = request.messages
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${conversationText}` : conversationText

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${request.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: request.params.temperature || 0.7,
            maxOutputTokens: request.params.maxTokens || 1000,
            topP: request.params.topP || 1,
            topK: request.params.topK || 40,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Gemini API 錯誤: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`)
      }

      const data = await response.json()
      const latencyMs = Date.now() - startTime

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Gemini API 回應格式錯誤')
      }

      const content = data.candidates[0].content.parts[0]?.text || ''

      return {
        content,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        } : undefined,
        latencyMs,
        provider: 'gemini',
        model: request.model,
      }
    } catch (error) {
      console.error('Gemini API 錯誤:', error)
      throw new Error(`Gemini 請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
}

// Azure OpenAI 適配器
export class AzureOpenAiAdapter implements AiProvider {
  async sendMessages(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now()
    
    try {
      // Azure OpenAI 需要端點和 API Key
      // 格式：endpoint|apiKey 或使用 request.endpoint
      let endpoint: string
      let apiKey: string
      
      if (request.apiKey.includes('|')) {
        [endpoint, apiKey] = request.apiKey.split('|')
      } else {
        // 如果沒有端點，嘗試從 request 中獲取
        endpoint = (request as any).endpoint || ''
        apiKey = request.apiKey
      }
      
      if (!endpoint) {
        throw new Error('Azure OpenAI 需要端點資訊')
      }
      
      // 確保端點格式正確
      if (!endpoint.startsWith('http')) {
        endpoint = `https://${endpoint}`
      }
      
      const response = await fetch(`${endpoint}/openai/deployments/${request.model}/chat/completions?api-version=2024-02-15-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            ...request.promptParts.map(part => ({
              role: 'system',
              content: part
            })),
            ...request.messages
          ],
          temperature: request.params.temperature || 0.7,
          max_tokens: request.params.maxTokens || 1000,
          top_p: request.params.topP || 1,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Azure OpenAI API 錯誤: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`)
      }

      const data = await response.json()
      const latencyMs = Date.now() - startTime

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Azure OpenAI API 回應格式錯誤')
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        latencyMs,
        provider: 'azure',
        model: request.model,
      }
    } catch (error) {
      console.error('Azure OpenAI API 錯誤:', error)
      throw new Error(`Azure OpenAI 請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
}

// AI 服務工廠
export class AiService {
  private providers: Map<string, AiProvider> = new Map()

  constructor() {
    this.providers.set('openai', new OpenAiAdapter())
    this.providers.set('gemini', new GeminiAdapter())
    this.providers.set('azure', new AzureOpenAiAdapter())
  }

  async sendMessages(request: AiRequest): Promise<AiResponse> {
    const provider = this.providers.get(request.provider)
    if (!provider) {
      throw new Error(`不支援的 AI 供應商: ${request.provider}`)
    }

    return await provider.sendMessages(request)
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  // 驗證 API Key 是否有效
  async validateApiKey(provider: string, apiKey: string, model: string, endpoint?: string): Promise<boolean> {
    try {
      const testRequest: AiRequest = {
        provider,
        model,
        apiKey: endpoint ? `${endpoint}|${apiKey}` : apiKey,
        promptParts: ['你是一個測試助手，請簡單回應「測試成功」'],
        messages: [{ role: 'user', content: '測試' }],
        params: { temperature: 0.1, maxTokens: 10 }
      }
      
      await this.sendMessages(testRequest)
      return true
    } catch (error) {
      console.error('API Key 驗證失敗:', error)
      return false
    }
  }

  // 獲取支援的模型列表
  getSupportedModels(provider: string): string[] {
    const models = {
      openai: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k'
      ],
      gemini: [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-2.5-pro'
      ],
      azure: [
        'gpt-4',
        'gpt-35-turbo',
        'gpt-35-turbo-16k'
      ]
    }
    
    return models[provider as keyof typeof models] || []
  }
}

// 單例實例
export const aiService = new AiService()

// 模擬 AI 服務（用於測試）
export class MockAiService {
  async sendMessages(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now()
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const latencyMs = Date.now() - startTime
    const lastMessage = request.messages[request.messages.length - 1]
    
    // 根據角色設定生成回應
    const roleInfo = request.promptParts.join('\n')
    const response = this.generateMockResponse(lastMessage.content, roleInfo, request.provider)
    
    return {
      content: response,
      usage: {
        promptTokens: Math.floor(Math.random() * 100) + 50,
        completionTokens: Math.floor(Math.random() * 200) + 100,
        totalTokens: Math.floor(Math.random() * 300) + 150,
      },
      latencyMs,
      provider: request.provider,
      model: request.model,
    }
  }

  private generateMockResponse(userMessage: string, roleInfo: string, provider: string): string {
    const responses = [
      `我理解你的意思。${userMessage} 這個話題很有趣，讓我從我的角度來回應...`,
      `謝謝你分享這個想法。關於「${userMessage}」，我想說...`,
      `這是一個很好的問題。讓我仔細思考一下「${userMessage}」...`,
      `我注意到你提到了「${userMessage}」。這讓我想起了...`,
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    const providerInfo = `（由 ${provider} 生成）`
    
    return `${randomResponse}\n\n${providerInfo}`
  }
}

export const mockAiService = new MockAiService()
