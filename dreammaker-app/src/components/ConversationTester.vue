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

    <!-- 角色選擇 + Prompt 預覽（新：下拉 + 可摺疊區） -->
    <section class="modern-card glass space-y-4">
      <h3 class="form-title">🎭 選擇對話角色</h3>

      <div v-if="roles.length > 0" class="flex items-center gap-3">
        <select
          class="input w-full md:max-w-md"
          :value="selectedRole?.id || ''"
          @change="onSelectRoleId(($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>請選擇角色</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>

        <button
          type="button"
          class="btn btn-outline"
          :disabled="!selectedRole"
          @click="startNewConversation"
          title="以目前角色開始新對話"
        >
          新對話
        </button>
      </div>

      <!-- AI 供應商選擇 -->
      <div v-if="selectedRole" class="flex items-center gap-3">
        <select
          class="input w-full md:max-w-md"
          :value="selectedProvider?.id || ''"
          @change="onSelectProviderId(($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>請選擇 AI 供應商</option>
          <option v-for="provider in activeProviders" :key="provider.id" :value="provider.id">
            {{ provider.name }} ({{ provider.provider }} - {{ provider.model }})
          </option>
          <option value="mock" :disabled="activeProviders.length > 0">🧪 模擬模式</option>
        </select>
        <div v-if="selectedProvider" class="text-xs text-gray-500">
          {{ selectedProvider.isActive ? '✅ 已啟用' : '❌ 未啟用' }}
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon float-animation" style="font-size: 3rem;">🎭</div>
          <h3 class="empty-state-text">還沒有建立任何角色</h3>
          <p class="empty-state-subtext">請先到「角色建立」頁面建立角色</p>
          <button
            type="button"
            @click="emit('navigate','roles')"
            class="btn btn-primary shimmer-soft"
          >
            ✨ 前往角色建立
          </button>
        </div>
      </div>

      <p v-if="selectedRole" class="text-sm" style="color: var(--subtext-color);">
        {{ selectedRole.description }}
      </p>

      <!-- Prompt 預覽（可摺疊） -->
      <div class="prompt-preview card-soft" v-if="selectedRole">
        <div class="prompt-preview__header">
          <div class="flex items-center gap-2">
            <span>送進模型的 Prompt（即時預覽）</span>
            <span class="prompt-meta">
              {{ promptCharCount }} 字 ≈ {{ approxTokens }} tokens
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-ghost"
              @click="copyPrompt"
              :disabled="!promptPreview"
              title="複製 Prompt 內容"
            >
              複製
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="isPromptOpen = !isPromptOpen"
              :aria-expanded="isPromptOpen"
            >
              {{ isPromptOpen ? '收合' : '展開' }}
            </button>
          </div>
        </div>

        <transition name="fade">
          <pre
            v-if="isPromptOpen"
            class="prompt-preview__content"
          >{{ promptPreview }}</pre>
        </transition>
      </div>
    </section>

    <!-- 對話區域 -->
    <section v-if="selectedRole" class="modern-card rounded-2xl overflow-hidden">
      <!-- 對話標題 -->
      <div class="conversation-header flex items-center justify-between" style="padding: var(--spacing-lg); border-bottom: 1px solid var(--border-light);">
        <div class="header-left flex items-center gap-4">
          <div class="avatar avatar-lg avatar-accent">
            <span>{{ selectedRole.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <h3 class="form-title">{{ selectedRole.name }}</h3>
            <p class="text-sm" style="color: var(--subtext-color);">{{ selectedRole.description }}</p>
            <div v-if="selectedProvider" class="text-xs mt-1" style="color: var(--subtext-color);">
              🤖 {{ selectedProvider.name }} ({{ selectedProvider.provider }} - {{ selectedProvider.model }})
            </div>
            <div v-else class="text-xs mt-1" style="color: var(--subtext-color);">
              🧪 模擬模式
            </div>
          </div>
        </div>
        <div class="header-actions flex gap-2">
          <button
            type="button"
            @click="regenerateLastResponse"
            :disabled="!canRegenerate"
            class="btn btn-secondary"
          >
            重新生成
          </button>
          <button
            type="button"
            @click="clearConversation"
            class="btn btn-outline"
          >
            清空對話
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
        <div class="input-row flex gap-3">
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
      <div class="modern-card">
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
import type { Role, Module, Conversation, Message, ProviderConfig } from '../types'

const emit = defineEmits<{(e:'navigate', to:'roles'|string):void}>()

const store = useAppStore()
const { roles, modules, conversations, createConversation, updateConversation,  deleteConversation: removeConversation } = store

const selectedRole = ref<Role | null>(null)
const selectedProvider = ref<ProviderConfig | null>(null)
const currentConversation = ref<Conversation | null>(null)
const currentMessages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const showSaveDialog = ref(false)
const saveForm = reactive({ title: '' })

// ===== 新增：Prompt 預覽相關 =====
const isPromptOpen = ref(false)
const promptPartsComputed = computed(() => buildRolePromptV2())
const promptPreview = computed(() => (promptPartsComputed.value || []).join('\n\n'))
const promptCharCount = computed(() => promptPreview.value.length)
// 粗估 tokens（保守）：字數 / 2
const approxTokens = computed(() => Math.max(1, Math.ceil(promptCharCount.value / 2)))

const copyPrompt = async () => {
  if (!promptPreview.value) return
  try {
    await navigator.clipboard.writeText(promptPreview.value)
    console.info('Prompt 已複製')
  } catch {
    alert('複製失敗，請手動選取文字複製')
  }
}

// ===== 新增：供應商相關計算屬性 =====
const activeProviders = computed(() => 
  store.providerConfigs.filter(provider => provider.isActive)
)

// ===== 原本的條件：略微調整 canSend，要求必須選到角色 =====
const canSave = computed(() => currentMessages.value.length > 0)
const canSend = computed(() => !!newMessage.value.trim() && !isLoading.value && !!selectedRole.value)
const canRegenerate = computed(() =>
  currentMessages.value.length > 0 &&
  currentMessages.value[currentMessages.value.length - 1]?.role === 'assistant'
)

// 下拉選單選取角色
const onSelectRoleId = (id: string) => {
  const role = roles.find(r => r.id === id) || null
  if (!role) return
  if (selectedRole.value?.id !== role.id) {
    selectedRole.value = role
    currentConversation.value = null
    currentMessages.value = []
    newMessage.value = ''
    // 你若希望每次切換角色時展開預覽，可解除下一行註解
    // isPromptOpen.value = true
  }
}

// 下拉選單選取供應商
const onSelectProviderId = (id: string) => {
  if (id === 'mock') {
    selectedProvider.value = null
    return
  }
  const provider = store.providerConfigs.find(p => p.id === id) || null
  selectedProvider.value = provider
}

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

    let response
    if (selectedProvider.value && selectedProvider.value.isActive) {
      response = await aiService.sendMessages({
        provider: selectedProvider.value.provider,
        model: selectedProvider.value.model,
        apiKey: selectedProvider.value.endpoint ? `${selectedProvider.value.endpoint}|${selectedProvider.value.apiKey}` : selectedProvider.value.apiKey,
        promptParts,
        messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
        params: {
          temperature: settings.defaultTemperature || selectedProvider.value.params.temperature || 0.7,
          maxTokens: settings.defaultMaxTokens || selectedProvider.value.params.maxTokens || 1000,
          topP: selectedProvider.value.params.topP || 1,
        }
      })
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

    let response
    if (selectedProvider.value && selectedProvider.value.isActive) {
      response = await aiService.sendMessages({
        provider: selectedProvider.value.provider,
        model: selectedProvider.value.model,
        apiKey: selectedProvider.value.endpoint ? `${selectedProvider.value.endpoint}|${selectedProvider.value.apiKey}` : selectedProvider.value.apiKey,
        promptParts,
        messages: currentMessages.value.map(msg => ({ role: msg.role, content: msg.content })),
        params: {
          temperature: (settings.defaultTemperature || selectedProvider.value.params.temperature || 0.7) + 0.1,
          maxTokens: settings.defaultMaxTokens || selectedProvider.value.params.maxTokens || 1000,
          topP: selectedProvider.value.params.topP || 1,
        }
      })
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

// v1：簡單按 notes 的「模組拼裝:」取模組，轉成字串片段
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
          case 'event':
            promptParts.push(`事件：${module.content}`); break
        }
      }
    })
  }

  if (promptParts.length === 0) {
    promptParts.push(`你是 ${selectedRole.value.name}，${selectedRole.value.description}`)
  }
  return promptParts
}

// v2：支援 notes 內的「模組拼裝:」與「模組拼裝模板:」，可用 [BASIC]/[PERSONA]/[TONE]/[BACKGROUND]/[EVENT]/[INSTRUCTION]
const buildRolePromptV2 = (): string[] => {
  const parts: string[] = []
  const role = selectedRole.value
  if (!role) return parts

  const notes = (role as any).notes as string | undefined

  const parseModuleIds = (): string[] => {
    if (!notes) return []
    const marker = '模組拼裝: '
    if (notes.includes(marker)) {
      const after = notes.split(marker)[1] || ''
      const line = after.split('\n')[0]?.split('\r')[0] || after
      return line.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  const selectedByType: Record<Module['type'], Module | undefined> = {
    basic: undefined, persona: undefined, background: undefined, instruction: undefined, event: undefined
  }
  const ids = parseModuleIds()
  ids.forEach(id => {
    const m = modules.find(mm => mm.id === id)
    if (m) selectedByType[m.type] = m
  })

  let template: string | undefined
  if (notes && notes.includes('模組拼裝模板:')) {
    template = notes.split('模組拼裝模板:')[1]?.replace(/^\s*/, '')
  }
  if (!template || !template.trim()) {
    const t = (role as any).assemblyTemplate as string | undefined
    if (typeof t === 'string' && t.trim()) template = t
  }

  if (template && template.trim()) {
    const basic = selectedByType.basic?.content || ''
    const persona = selectedByType.persona?.content || ''
    const tone = (selectedByType.persona?.toneHints || []).join('、')
    const background = selectedByType.background?.content || ''
    const event = selectedByType.event?.content || ''
    const instruction = selectedByType.instruction?.content || ''

    const rendered = template
      .replaceAll('[BASIC]', basic)
      .replaceAll('[PERSONA]', persona)
      .replaceAll('[TONE]', tone)
      .replaceAll('[BACKGROUND]', background)
      .replaceAll('[EVENT]', event)
      .replaceAll('[INSTRUCTION]', instruction)
      // 同時兼容中文標籤
      .replaceAll('[角色基本資訊]', basic)
      .replaceAll('[性格特徵]', persona)
      .replaceAll('[語氣特點]', tone)
      .replaceAll('[背景故事]', background)
      .replaceAll('[事件設定]', event)
      .replaceAll('[行為指令]', instruction)

    parts.push(rendered.trim())
  } else if (ids.length) {
    // 沒有模板就按模組順序輸出片段
    ids.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId)
      if (!module) return
      switch (module.type) {
        case 'basic':
          parts.push(`角色基本資訊：${module.content}`); break
        case 'persona': {
          let personaPrompt = `性格特徵：${module.content}`
          if (module.toneHints?.length) personaPrompt += `\n語氣特點：${module.toneHints.join('、')}`
          parts.push(personaPrompt); break
        }
        case 'background':
          parts.push(`背景故事：${module.content}`); break
        case 'instruction':
          parts.push(`行為指令：${module.content}`); break
        case 'event':
          parts.push(`事件設定：${module.content}`); break
      }
    })
  } else {
    parts.push(`你是「${role.name}」：${role.description}`)
  }
  return parts
}

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  if (roles.length > 0 && !selectedRole.value) selectRole(roles[0])

  // 若有啟用的供應商且尚未選擇，預設第一個
  if (activeProviders.value.length > 0 && !selectedProvider.value) {
    selectedProvider.value = activeProviders.value[0]
  }
})
</script>

<style scoped>
.conversation-tester { padding: var(--spacing-lg); }


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

/* ===== 新增：Prompt 預覽外觀 ===== */
.card-soft{
  background: var(--surface-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}
.prompt-preview{ overflow: hidden; }
.prompt-preview__header{
  display:flex; align-items:center; justify-content:space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  background: var(--surface-elevated);
}
.prompt-preview__content{
  margin:0;
  padding: var(--spacing-md);
  max-height: 18rem;
  overflow: auto;
  font-size: .875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--surface-card);
}
.prompt-meta{
  font-size: .75rem;
  color: var(--subtext-color);
  background: var(--surface-card);
  border: 1px dashed var(--border-light);
  border-radius: 999px;
  padding: .125rem .5rem;
}
/* 淡入淡出 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== Mobile RWD tweaks (<=640px) ===== */
@media (max-width: 640px) {
  .conversation-tester { padding: var(--spacing-md); }

  /* Header stacks, actions become 2 columns */
  .conversation-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
    padding: var(--spacing-md) !important;
  }
  .conversation-header .header-left { gap: var(--spacing-md); }
  .conversation-header .avatar { width: 2.5rem; height: 2.5rem; font-size: 1rem; }
  .conversation-header .header-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
  }
  .conversation-header .header-actions .btn { width: 100%; }

  /* Messages pane uses viewport height for better fit */
  .messages-pane { height: 45vh; padding: var(--spacing-sm) var(--spacing-md); }

  /* Prompt preview header stacks */
  .prompt-preview__header { flex-direction: column; align-items: flex-start; gap: var(--spacing-sm); }
  .prompt-preview__content { max-height: 12rem; }

  /* Input row stacks with full-width controls */
  .input-row { flex-direction: column; gap: var(--spacing-sm); }
  .input-row .input { width: 100%; }
  .input-row .btn { width: 100%; }
}
</style>
