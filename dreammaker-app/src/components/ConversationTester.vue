<template>
  <div class="conversation-tester space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">對話測試</h2>
      <div class="flex gap-2">
        <button
          type="button"
          @click="startNewConversation"
          class="btn btn-accent"
        >
          開始新對話
        </button>
        <button
          type="button"
          @click="saveConversation"
          :disabled="!canSave"
          class="btn btn-primary"
        >
          儲存對話
        </button>
      </div>
    </div>

    <!-- 角色選擇 -->
    <section class="modern-card glass">
      <h3 class="form-title mb-4">🎭 選擇對話角色</h3>

      <div v-if="roles.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="role in roles"
          :key="role.id"
          @click="selectRole(role)"
          :class="[
            'modern-card',
            'role-option',
            selectedRole?.id === role.id ? 'role-option--selected' : ''
          ]"
          role="button"
          tabindex="0"
          @keyup.enter="selectRole(role)"
        >
          <div class="flex items-start gap-4">
            <div class="avatar avatar-lg">
              <span>{{ role.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="role-option__title">{{ role.name }}</h4>
              <p class="role-option__desc">
                {{ role.description }}
              </p>
              <div v-if="role.tags?.length" class="flex flex-wrap gap-2 mt-3">
                <span v-for="tag in role.tags" :key="tag" class="tag tag-primary">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon float-animation" style="font-size: 3rem;">🎭</div>
          <h3 class="empty-state-text">還沒有建立任何角色</h3>
          <p class="empty-state-subtext">請先到「角色建立」頁面建立角色</p>
          <button
            type="button"
            @click="$emit('navigate', 'roles')"
            class="btn btn-primary shimmer-soft"
          >
            ✨ 前往角色建立
          </button>
        </div>
      </div>
    </section>

    <!-- 對話區域 -->
    <section v-if="selectedRole" class="modern-card rounded-2xl overflow-hidden">
      <!-- 對話標題 -->
      <div class="flex items-center justify-between" style="padding: var(--spacing-lg); border-bottom: 1px solid var(--border-light);">
        <div class="flex items-center gap-4">
          <div class="avatar avatar-lg avatar-accent">
            <span>{{ selectedRole.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <h3 class="form-title">{{ selectedRole.name }}</h3>
            <p class="text-sm" style="color: var(--subtext-color);">{{ selectedRole.description }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            @click="regenerateLastResponse"
            :disabled="!canRegenerate"
            class="btn btn-secondary"
          >
            🔄 重新生成
          </button>
          <button
            type="button"
            @click="clearConversation"
            class="btn btn-outline"
          >
            🗑️ 清空對話
          </button>
        </div>
      </div>

      <!-- 訊息列表 -->
      <div class="messages-pane">
        <div
          v-for="message in currentMessages"
          :key="message.id"
          :class="['message', message.role === 'user' ? 'message-user' : 'message-assistant']"
        >
          <div class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.content }}</div>
          <div class="text-xs mt-2" style="opacity:.7">{{ formatTime(message.createdAt) }}</div>
        </div>

        <!-- 載入中 -->
        <div v-if="isLoading" class="message message-assistant">
          <div class="flex items-center gap-3">
            <div class="spinner-warm"></div>
            <span class="text-sm" style="color: var(--subtext-color);">AI 正在思考中...</span>
          </div>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div style="padding: var(--spacing-lg); border-top: 1px solid var(--border-light);">
        <div class="flex gap-3">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            class="input textarea flex-1"
            rows="2"
            placeholder="💬 輸入你的訊息..."
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="sendMessage"
            :disabled="!canSend"
            class="btn"
            :class="canSend ? 'btn-primary' : 'btn-ghost'"
          >
            🚀 發送
          </button>
        </div>
      </div>
    </section>

    <!-- 對話歷史 -->
    <section v-if="conversations.length > 0" class="modern-card">
      <h3 class="form-title mb-3">對話歷史</h3>
      <div class="space-y-2">
        <article
          v-for="conversation in conversations"
          :key="conversation.id"
          @click="loadConversation(conversation)"
          :class="[
            'history-item',
            currentConversation?.id === conversation.id ? 'history-item--active' : ''
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="history-title">
                {{ conversation.title || '未命名對話' }}
              </h4>
              <p class="history-subtitle">
                {{ conversation.messages.length }} 條訊息
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                @click.stop="handleDeleteConversation(conversation.id)"
                class="action-btn action-btn-delete"
              >
                刪除
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 儲存對話對話框 -->
    <div
      v-if="showSaveDialog"
      class="modal-backdrop"
    >
      <div class="modern-card glass modal-card">
        <h3 class="form-title mb-4">儲存對話</h3>
        <div class="space-y-4">
          <div>
            <label class="form-label">對話標題</label>
            <input
              v-model="saveForm.title"
              type="text"
              class="input w-full"
              placeholder="輸入對話標題"
            />
          </div>
          <div class="flex gap-3">
            <button type="button" @click="confirmSave" class="btn btn-primary">儲存</button>
            <button type="button" @click="cancelSave" class="btn btn-ghost">取消</button>
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
const { roles, modules, conversations, createConversation, updateConversation,  deleteConversation: removeConversation } = store

const selectedRole = ref<Role | null>(null)
const currentConversation = ref<Conversation | null>(null)
const currentMessages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const showSaveDialog = ref(false)
const saveForm = reactive({ title: '' })

const canSave = computed(() => currentMessages.value.length > 0)
const canSend = computed(() => !!newMessage.value.trim() && !isLoading.value && !!selectedRole.value)
const canRegenerate = computed(() =>
  currentMessages.value.length > 0 &&
  currentMessages.value[currentMessages.value.length - 1]?.role === 'assistant'
)

const selectRole = (role: Role) => {
  selectedRole.value = role
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

  const userMessage: Omit<Message, 'id' | 'createdAt'> = { role: 'user', content: newMessage.value }
  currentMessages.value.push({ ...userMessage, id: crypto.randomUUID(), createdAt: new Date().toISOString() })

  const messageContent = newMessage.value
  newMessage.value = ''
  isLoading.value = true

  try {
    const promptParts = buildRolePrompt()

    const settings = JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
    const defaultProviderId = settings.defaultProvider

    let response
    if (defaultProviderId && store.providerConfigs.length > 0) {
      const providerConfig = store.providerConfigs.find(p => p.id === defaultProviderId)
      if (providerConfig && providerConfig.isActive) {
        response = await aiService.sendMessages({
          provider: providerConfig.provider,
          model: providerConfig.model,
          apiKey: providerConfig.endpoint ? `${providerConfig.endpoint}|${providerConfig.apiKey}` : providerConfig.apiKey,
          promptParts,
          messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
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
      response = await mockAiService.sendMessages({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        apiKey: 'mock-key',
        promptParts,
        messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
        params: { temperature: 0.7, maxTokens: 1000 }
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
    currentMessages.value.push({ ...aiResponse, id: crypto.randomUUID(), createdAt: new Date().toISOString() })

    if (currentConversation.value) {
      updateConversation(currentConversation.value.id, { messages: currentMessages.value })
    }
  } catch (error) {
    console.error('發送訊息失敗:', error)
    currentMessages.value.push({
      role: 'assistant',
      content: '抱歉，我現在無法回應。請稍後再試。',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
  } finally {
    isLoading.value = false
  }
}

const regenerateLastResponse = async () => {
  if (!canRegenerate.value) return

  currentMessages.value = currentMessages.value.filter((_, i) => i < currentMessages.value.length - 1)
  isLoading.value = true

  try {
    const promptParts = buildRolePrompt()

    const settings = JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
    const defaultProviderId = settings.defaultProvider

    let response
    if (defaultProviderId && store.providerConfigs.length > 0) {
      const providerConfig = store.providerConfigs.find(p => p.id === defaultProviderId)
      if (providerConfig && providerConfig.isActive) {
        response = await aiService.sendMessages({
          provider: providerConfig.provider,
          model: providerConfig.model,
          apiKey: providerConfig.endpoint ? `${providerConfig.endpoint}|${providerConfig.apiKey}` : providerConfig.apiKey,
          promptParts,
          messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
          params: {
            temperature: (settings.defaultTemperature || providerConfig.params.temperature || 0.7) + 0.1,
            maxTokens: settings.defaultMaxTokens || providerConfig.params.maxTokens || 1000,
            topP: providerConfig.params.topP || 1,
          }
        })
      } else {
        throw new Error('預設供應商不可用，使用模擬服務')
      }
    } else {
      response = await mockAiService.sendMessages({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        apiKey: 'mock-key',
        promptParts,
        messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
        params: { temperature: 0.8, maxTokens: 1000 }
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
    currentMessages.value.push({ ...aiResponse, id: crypto.randomUUID(), createdAt: new Date().toISOString() })

    if (currentConversation.value) {
      updateConversation(currentConversation.value.id, { messages: currentMessages.value })
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
    roleVersionId: 'current',
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

  if (selectedRole.value.notes && selectedRole.value.notes.includes('模組拼裝:')) {
    const moduleIds = selectedRole.value.notes.split('模組拼裝: ')[1]?.split(',') || []
    moduleIds.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        switch (module.type) {
          case 'basic':
            promptParts.push(`角色基本資訊：${module.content}`); break
          case 'persona': {
            let personaPrompt = `性格特徵：${module.content}`
            if (module.toneHints?.length) personaPrompt += `\n語氣特點：${module.toneHints.join('、')}`
            promptParts.push(personaPrompt); break
          }
          case 'background':
            promptParts.push(`背景故事：${module.content}`); break
          case 'instruction':
            promptParts.push(`行為指令：${module.content}`); break
        }
      }
    })
  }

  if (promptParts.length === 0) {
    promptParts.push(`你是 ${selectedRole.value.name}，${selectedRole.value.description}`)
  }
  return promptParts
}

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  if (roles.length > 0 && !selectedRole.value) selectRole(roles[0])
})
</script>

<style scoped>
.conversation-tester { padding: var(--spacing-lg); }

/* 頁首（沿用 tokens） */
.page-header{
  display:flex; align-items:center; justify-content:space-between;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}
.page-title{
  font-size: 1.5rem; font-weight: 700; margin: 0;
  color: var(--text-color);
  background: var(--gradient-warm);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* 角色選項卡片 */
.role-option{ cursor:pointer; transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.role-option:hover{ transform: translateY(-2px); }
.role-option--selected{
  border-color: var(--button-bg-color);
  box-shadow: 0 0 0 3px rgba(242,170,132,.15);
  background: var(--gradient-soft);
}
.role-option__title{
  margin:0; font-weight:600; color:var(--text-color); font-size:1rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.role-option__desc{
  color:var(--subtext-color); font-size:.875rem; line-height:1.4; margin:.25rem 0 0 0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}

/* 訊息區 */
.messages-pane{
  height: 24rem;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 對話歷史 */
.history-item{
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.history-item:hover{ border-color: var(--border-medium); background: var(--surface-elevated); }
.history-item--active{ border-color: var(--button-bg-color); box-shadow: 0 0 0 3px rgba(242,170,132,.12); }
.history-title{ margin:0; color:var(--text-color); font-weight:600; }
.history-subtitle{ margin:.25rem 0 0 0; color:var(--subtext-color); font-size:.875rem; }

/* Modal */
.modal-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center; z-index: 50;
}
.modal-card{ max-width: 520px; width: 100%; }

/* 輔助動畫 */
.float-animation{ animation: float 6s ease-in-out infinite; }
@keyframes float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-6px); } }
</style>
