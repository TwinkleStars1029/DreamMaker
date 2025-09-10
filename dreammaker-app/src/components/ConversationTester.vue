<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">對話測試</h2>
      <div class="flex space-x-2">
        <button
          @click="startNewConversation"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          開始新對話
        </button>
        <button
          @click="saveConversation"
          :disabled="!canSave"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          儲存對話
        </button>
      </div>
    </div>

    <!-- 角色選擇區域 -->
    <div class="dreamy-card p-6">
      <h3 class="text-xl font-semibold dreamy-text-white mb-6">🎭 選擇對話角色</h3>
      <div v-if="roles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="role in roles"
          :key="role.id"
          @click="selectRole(role)"
          :class="[
            'dreamy-card p-5 cursor-pointer transition-all duration-300 hover:scale-105 group',
            selectedRole?.id === role.id
              ? 'ring-2 ring-purple-400 bg-purple-500/20'
              : 'hover:bg-white/10'
          ]"
        >
          <div class="flex items-start space-x-4">
            <div class="dreamy-avatar w-12 h-12 rounded-full flex items-center justify-center text-lg">
              {{ role.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold dreamy-text-white truncate text-lg">{{ role.name }}</h4>
              <p class="text-sm text-white/80 line-clamp-2 mt-1">{{ role.description }}</p>
              <div v-if="role.tags && role.tags.length > 0" class="flex flex-wrap gap-2 mt-3">
                <span
                  v-for="tag in role.tags"
                  :key="tag"
                  class="dreamy-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12">
        <div class="dreamy-card p-8 max-w-md mx-auto">
          <div class="text-6xl mb-6 float-animation">🎭</div>
          <h3 class="text-2xl font-bold dreamy-text-white mb-4">還沒有建立任何角色</h3>
          <p class="text-white/80 mb-6">請先到「角色建立」頁面建立角色</p>
          <button
            @click="$emit('navigate', 'roles')"
            class="dreamy-btn px-8 py-3 rounded-xl font-medium float-animation"
          >
            ✨ 前往角色建立
          </button>
        </div>
      </div>
    </div>

    <!-- 對話區域 -->
    <div v-if="selectedRole" class="dreamy-card rounded-2xl overflow-hidden">
      <!-- 對話標題 -->
      <div class="p-6 border-b border-white/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="dreamy-avatar w-12 h-12 rounded-full flex items-center justify-center text-lg">
              {{ selectedRole.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-semibold dreamy-text-white text-xl">{{ selectedRole.name }}</h3>
              <p class="text-sm text-white/80">{{ selectedRole.description }}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="regenerateLastResponse"
              :disabled="!canRegenerate"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 重新生成
            </button>
            <button
              @click="clearConversation"
              class="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              🗑️ 清空對話
            </button>
          </div>
        </div>
      </div>

      <!-- 訊息列表 -->
      <div class="h-96 overflow-y-auto p-4 space-y-4">
        <div
          v-for="message in currentMessages"
          :key="message.id"
          :class="[
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            ]"
          >
            <div class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.content }}</div>
            <div class="text-xs mt-2 opacity-70">
              {{ formatTime(message.createdAt) }}
            </div>
          </div>
        </div>
        
        <!-- 載入中指示器 -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="dreamy-message assistant px-6 py-4 rounded-2xl shadow-lg">
            <div class="flex items-center space-x-3">
              <div class="dreamy-spinner w-6 h-6"></div>
              <span class="text-sm text-white/80">AI 正在思考中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div class="p-6 border-t border-white/20">
        <div class="flex space-x-3">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            class="dreamy-input flex-1 px-4 py-3 rounded-xl resize-none"
            rows="2"
            placeholder="💬 輸入你的訊息..."
            :disabled="isLoading"
          />
          <button
            @click="sendMessage"
            :disabled="!canSend"
            class="px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="canSend ? 'dreamy-btn' : 'bg-gray-400 text-white'"
          >
            🚀 發送
          </button>
        </div>
      </div>
    </div>

    <!-- 對話歷史 -->
    <div v-if="conversations.length > 0" class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">對話歷史</h3>
      <div class="space-y-2">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          @click="loadConversation(conversation)"
          :class="[
            'p-3 border rounded-lg cursor-pointer transition-colors',
            currentConversation?.id === conversation.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">
                {{ conversation.title || '未命名對話' }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ conversation.messages.length }} 條訊息
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click.stop="deleteConversation(conversation.id)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 儲存對話對話框 -->
    <div v-if="showSaveDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">儲存對話</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              對話標題
            </label>
            <input
              v-model="saveForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入對話標題"
            />
          </div>
          <div class="flex space-x-3">
            <button
              @click="confirmSave"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              儲存
            </button>
            <button
              @click="cancelSave"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import { aiService, mockAiService } from '../services/aiService'
import type { Role, Module, Conversation, Message } from '../types'

const store = useAppStore()
const { roles, modules, conversations, createConversation, updateConversation,  deleteConversation: removeConversation, addMessage } = store

const selectedRole = ref<Role | null>(null)
const currentConversation = ref<Conversation | null>(null)
const currentMessages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const showSaveDialog = ref(false)
const saveForm = reactive({
  title: '',
})

const canSave = computed(() => {
  return currentMessages.value.length > 0
})

const canSend = computed(() => {
  return newMessage.value.trim() && !isLoading.value && selectedRole.value
})

const canRegenerate = computed(() => {
  return currentMessages.value.length > 0 && 
         currentMessages.value[currentMessages.value.length - 1]?.role === 'assistant'
})

const selectRole = (role: Role) => {
  selectedRole.value = role
  // 清空當前對話
  currentConversation.value = null
  currentMessages.value = []
}

const startNewConversation = () => {
  if (!selectedRole.value) {
    alert('請先選擇一個角色')
    return
  }
  
  currentConversation.value = null
  currentMessages.value = []
  newMessage.value = ''
}

const sendMessage = async () => {
  if (!canSend.value) return

  const userMessage: Omit<Message, 'id' | 'createdAt'> = {
    role: 'user',
    content: newMessage.value,
  }

  // 添加用戶訊息
  currentMessages.value.push({
    ...userMessage,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  })

  const messageContent = newMessage.value
  newMessage.value = ''
  isLoading.value = true

  try {
    // 構建角色提示詞
    const promptParts = buildRolePrompt()
    
    // 獲取預設供應商設定
    const settings = JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
    const defaultProviderId = settings.defaultProvider
    
    let response
    if (defaultProviderId && store.providerConfigs.length > 0) {
      // 使用真實 AI 服務
      const providerConfig = store.providerConfigs.find(p => p.id === defaultProviderId)
      if (providerConfig && providerConfig.isActive) {
        response = await aiService.sendMessages({
          provider: providerConfig.provider,
          model: providerConfig.model,
          apiKey: providerConfig.endpoint ? `${providerConfig.endpoint}|${providerConfig.apiKey}` : providerConfig.apiKey,
          promptParts,
          messages: currentMessages.value.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          params: {
            temperature: settings.defaultTemperature || providerConfig.params.temperature || 0.7,
            maxTokens: settings.defaultMaxTokens || providerConfig.params.maxTokens || 1000,
            topP: providerConfig.params.topP || 1,
          }
        })
      } else {
        throw new Error('預設供應商不可用，使用模擬服務')
      }
    } else {
      // 使用模擬服務
      response = await mockAiService.sendMessages({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        apiKey: 'mock-key',
        promptParts,
        messages: currentMessages.value.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        params: {
          temperature: 0.7,
          maxTokens: 1000,
        }
      })
    }
    
    const aiResponse: Omit<Message, 'id' | 'createdAt'> = {
      role: 'assistant',
      content: response.content,
      providerMeta: {
        provider: response.provider,
        model: response.model,
        latencyMs: response.latencyMs,
        usage: response.usage,
      }
    }

    currentMessages.value.push({
      ...aiResponse,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })

    // 如果有當前對話，更新它
    if (currentConversation.value) {
      updateConversation(currentConversation.value.id, {
        messages: currentMessages.value,
      })
    }
  } catch (error) {
    console.error('發送訊息失敗:', error)
    // 添加錯誤訊息
    const errorMessage: Omit<Message, 'id' | 'createdAt'> = {
      role: 'assistant',
      content: '抱歉，我現在無法回應。請稍後再試。',
    }
    currentMessages.value.push({
      ...errorMessage,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  } finally {
    isLoading.value = false
  }
}

const regenerateLastResponse = async () => {
  if (!canRegenerate.value) return

  // 移除最後一個 AI 回應
  currentMessages.value = currentMessages.value.filter(
    (_, index) => index < currentMessages.value.length - 1
  )

  isLoading.value = true

  try {
    // 構建角色提示詞
    const promptParts = buildRolePrompt()
    
    // 獲取預設供應商設定
    const settings = JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
    const defaultProviderId = settings.defaultProvider
    
    let response
    if (defaultProviderId && store.providerConfigs.length > 0) {
      // 使用真實 AI 服務
      const providerConfig = store.providerConfigs.find(p => p.id === defaultProviderId)
      if (providerConfig && providerConfig.isActive) {
        response = await aiService.sendMessages({
          provider: providerConfig.provider,
          model: providerConfig.model,
          apiKey: providerConfig.endpoint ? `${providerConfig.endpoint}|${providerConfig.apiKey}` : providerConfig.apiKey,
          promptParts,
          messages: currentMessages.value.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          params: {
            temperature: (settings.defaultTemperature || providerConfig.params.temperature || 0.7) + 0.1, // 稍微提高溫度
            maxTokens: settings.defaultMaxTokens || providerConfig.params.maxTokens || 1000,
            topP: providerConfig.params.topP || 1,
          }
        })
      } else {
        throw new Error('預設供應商不可用，使用模擬服務')
      }
    } else {
      // 使用模擬服務
      response = await mockAiService.sendMessages({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        apiKey: 'mock-key',
        promptParts,
        messages: currentMessages.value.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        params: {
          temperature: 0.8, // 稍微提高溫度以獲得不同的回應
          maxTokens: 1000,
        }
      })
    }
    
    const aiResponse: Omit<Message, 'id' | 'createdAt'> = {
      role: 'assistant',
      content: response.content,
      providerMeta: {
        provider: response.provider,
        model: response.model,
        latencyMs: response.latencyMs,
        usage: response.usage,
      }
    }

    currentMessages.value.push({
      ...aiResponse,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })

    // 如果有當前對話，更新它
    if (currentConversation.value) {
      updateConversation(currentConversation.value.id, {
        messages: currentMessages.value,
      })
    }
  } catch (error) {
    console.error('重新生成失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const clearConversation = () => {
  if (window.confirm('確定要清空當前對話嗎？')) {
    currentMessages.value = []
    currentConversation.value = null
  }
}

const saveConversation = () => {
  if (!canSave.value) return
  showSaveDialog.value = true
}

const confirmSave = () => {
  if (!selectedRole.value) return

  const conversationData = {
    roleVersionId: 'current', // 使用當前拼裝配置
    title: saveForm.title || `與 ${selectedRole.value.name} 的對話`,
    messages: currentMessages.value,
  }

  const newConversation = createConversation(conversationData)
  currentConversation.value = newConversation

  saveForm.title = ''
  showSaveDialog.value = false
}

const cancelSave = () => {
  saveForm.title = ''
  showSaveDialog.value = false
}

const loadConversation = (conversation: Conversation) => {
  currentConversation.value = conversation
  currentMessages.value = [...conversation.messages]
}

const handleDeleteConversation = (id: string) => {
  if (window.confirm('確定要刪除這個對話嗎？')) {
    removeConversation(id)
    if (currentConversation.value?.id === id) {
      currentConversation.value = null
      currentMessages.value = []
    }
  }
}

const buildRolePrompt = (): string[] => {
  const promptParts: string[] = []
  
  if (!selectedRole.value) return promptParts
  
  // 從角色的 notes 中解析模組 ID
  if (selectedRole.value.notes && selectedRole.value.notes.includes('模組拼裝:')) {
    const moduleIds = selectedRole.value.notes.split('模組拼裝: ')[1]?.split(',') || []
    
    moduleIds.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        switch (module.type) {
          case 'basic':
            promptParts.push(`角色基本資訊：${module.content}`)
            break
          case 'persona':
            let personaPrompt = `性格特徵：${module.content}`
            if (module.toneHints && module.toneHints.length > 0) {
              personaPrompt += `\n語氣特點：${module.toneHints.join('、')}`
            }
            promptParts.push(personaPrompt)
            break
          case 'background':
            promptParts.push(`背景故事：${module.content}`)
            break
          case 'instruction':
            promptParts.push(`行為指令：${module.content}`)
            break
        }
      }
    })
  }
  
  // 如果沒有模組資訊，使用角色基本資訊
  if (promptParts.length === 0) {
    promptParts.push(`你是 ${selectedRole.value.name}，${selectedRole.value.description}`)
  }
  
  return promptParts
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  // 如果有角色，預設選擇第一個
  if (roles.length > 0 && !selectedRole.value) {
    selectRole(roles[0])
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
