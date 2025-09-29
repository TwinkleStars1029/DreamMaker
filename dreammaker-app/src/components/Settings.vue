<template>
  <div class="settings space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">設定</h2>
    </div>

    <!-- AI 供應商設定 -->
    <section class="modern-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="form-title">AI 供應商設定</h3>
        <button type="button" @click="showAddProviderDialog = true" class="btn btn-primary">
          新增供應商
        </button>
      </div>

      <!-- 列表 -->
      <div class="space-y-4">
        <article v-for="config in providerConfigs" :key="config.id" class="modern-card provider-card">
          <!-- 左側：供應商資訊 -->
          <div class="provider-info">
            <div class="info-header">
              <span class="tag shrink-0" :class="getProviderColor(config.provider)">
                {{ getProviderLabel(config.provider) }}
              </span>
              <h4 class="history-title truncate">{{ config.name }}</h4>
              <span class="history-subtitle truncate sm:max-w-[40%]">{{ config.model }}</span>
              <span v-if="config.isActive" class="status-dot" title="啟用中"></span>
            </div>

            <p class="info-meta">
              API Key: <span class="mono">{{ maskApiKey(config.apiKey) }}</span>
              <span v-if="config.endpoint"> 端點: <span class="break-anywhere">{{ config.endpoint }}</span></span>
            </p>
          </div>

          <!-- 右側：操作按鈕 -->
          <div class="provider-actions">
            <button type="button" @click="editProvider(config)" class="action-btn action-btn-edit">編輯</button>
            <button type="button" @click="testProvider(config)" :disabled="isTesting" class="action-btn action-btn-edit">
              {{ isTesting ? '測試中...' : '測試' }}
            </button>
            <button type="button" @click="toggleProvider(config)" class="action-btn action-btn-delete">
              {{ config.isActive ? '停用' : '啟用' }}
            </button>
            <button type="button" @click="deleteProvider(config.id)" class="action-btn action-btn-delete">刪除</button>
          </div>
        </article>

        <div v-if="providerConfigs.length === 0" class="empty-state">
          <div class="empty-state-card">
            <div class="empty-state-icon"><div class="spinner-warm mx-auto"></div></div>
            <p class="empty-state-text">尚未設定任何 AI 供應商</p>
            <button type="button" class="btn btn-primary mt-3" @click="showAddProviderDialog = true">新增供應商</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 預設設定 -->
    <section class="modern-card">
      <h3 class="form-title mb-4">預設設定</h3>
      <div class="space-y-4">
        <div>
          <label class="form-label">預設供應商</label>
          <select v-model="defaultProvider" class="input w-full">
            <option value="">請選擇預設供應商</option>
            <option v-for="config in activeProviders" :key="config.id" :value="config.id">
              {{ config.name }} ({{ getProviderLabel(config.provider) }})
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">預設溫度</label>
          <input v-model.number="defaultTemperature" type="range" min="0" max="2" step="0.1" class="w-full" />
          <div class="flex justify-between text-xs" style="color:var(--subtext-color); margin-top:.25rem;">
            <span>0（保守）</span>
            <span>{{ defaultTemperature }}</span>
            <span>2（創意）</span>
          </div>
        </div>

        <div>
          <label class="form-label">最大 Token 數</label>
          <input
            v-model.number="defaultMaxTokens"
            type="number"
            min="100"
            max="4000"
            step="100"
            class="input w-full"
            placeholder="例如：1000"
          />
        </div>
      </div>
    </section>

    <!-- 資料管理 -->
    <section class="modern-card">
      <h3 class="form-title mb-4">資料管理</h3>
      <div class="flex flex-wrap gap-3 mb-3">
        <button type="button" @click="importData" class="btn btn-primary">匯入資料</button>
        <button type="button" @click="clearAllData" class="btn btn-outline">清除所有資料</button>
      </div>
      <!-- 匯出選項（可勾選內容） -->
      <div class="space-y-3 mt-4">
        <h4 class="form-title">匯出選項</h4>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input v-model="exportFormat" type="radio" value="json" />
            <span>JSON</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportFormat" type="radio" value="csv" />
            <span>CSV</span>
          </label>
        </div>
        <div class="text-sm" style="color:var(--subtext-color);">
          快速選擇：
          <button type="button" class="action-btn action-btn-edit" @click="setExportPreset('all')">全部</button>
          <button type="button" class="action-btn action-btn-edit" @click="setExportPreset('rolesModules')">角色+模組</button>
          <button type="button" class="action-btn action-btn-edit" @click="setExportPreset('settings')">僅設定</button>
          <button type="button" class="action-btn action-btn-delete" @click="setExportPreset('none')">全不選</button>
        </div>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeRoles" type="checkbox" />
            <span>角色</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeModules" type="checkbox" />
            <span>模組</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeConversations" type="checkbox" />
            <span>對話</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeSettings" type="checkbox" />
            <span>設定</span>
          </label>
        </div>
        <div>
          <button type="button" class="btn btn-secondary" :disabled="!canExport" @click="exportSelectedData">匯出資料</button>
        </div>
      </div>

      <div class="text-sm" style="color:var(--subtext-color);">
        <p>匯出：可自選內容與格式（JSON/CSV），統一用上方按鈕匯出。</p>
        <p>匯入：選擇 JSON 檔匯入資料（不會併入現有資料）。</p>
        <p>清除：刪除本地所有資料，請謹慎使用。</p>
      </div>
    </section>

    <!-- 新增/編輯供應商對話框 -->
    <!-- 新增/編輯供應商對話框 -->
    <div v-if="showAddProviderDialog || editingProvider" class="modal-backdrop">
      <div class="modern-card" style="max-width: 600px;">
        <h3 class="form-title mb-4">{{ editingProvider ? '編輯供應商' : '新增供應商' }}</h3>

        <div class="provider-form-grid">
          <!-- 第一行：名稱（全寬） -->
          <div class="form-row form-row-full">
            <label class="form-label-inline">供應商名稱 *</label>
            <input v-model="providerForm.name" type="text" class="input flex-1" placeholder="例如：我的 OpenAI 帳號" />
          </div>

          <!-- 第二行：平台 + 模型 -->
          <div class="form-row">
            <label class="form-label-inline">供應商平台 *</label>
            <select v-model="providerForm.provider" @change="onProviderChange" class="input flex-1">
              <option value="">請選擇供應商</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label-inline">模型 *</label>
            <select v-model="providerForm.model" class="input flex-1">
              <option value="">請選擇模型</option>
              <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>

          <!-- Azure 端點（條件顯示，全寬） -->
          <div v-if="providerForm.provider === 'azure'" class="form-row form-row-full">
            <label class="form-label-inline">端點 *</label>
            <input v-model="providerForm.endpoint" type="url" class="input flex-1" placeholder="https://your-resource.openai.azure.com" />
          </div>

          <!-- API Key（全寬） -->
          <div class="form-row form-row-full">
            <label class="form-label-inline">API Key *</label>
            <input v-model="providerForm.apiKey" type="password" class="input flex-1" placeholder="輸入 API Key" />
          </div>

          <!-- 第三行：溫度 + Token -->
          <div class="form-row">
            <label class="form-label-inline">溫度</label>
            <div class="flex-1">
              <input v-model.number="providerForm.params.temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
              <div class="text-center text-xs" style="color:var(--subtext-color); margin-top:.25rem;">
                {{ providerForm.params.temperature }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label-inline">最大 Token</label>
            <input
              v-model.number="providerForm.params.maxTokens"
              type="number"
              min="100"
              max="4000"
              step="100"
              class="input flex-1"
            />
          </div>

          <!-- 按鈕列（全寬） -->
          <div class="form-row-full" style="display: flex; gap: .75rem; margin-top: .5rem;">
            <button
              type="button"
              @click="editingProvider ? updateProvider() : addProvider()"
              :disabled="!canSaveProvider"
              class="btn btn-primary"
            >
              {{ editingProvider ? '更新' : '新增' }}
            </button>
            <button type="button" @click="cancelProvider" class="btn btn-ghost">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import { aiService } from '../services/aiService'
import type { ProviderConfig } from '../services/aiService'
import type { Role, Module, Conversation } from '../types'

const store = useAppStore()
const {
  roles, modules, conversations,
  createRole, createModule, createConversation,
  providerConfigs, createProviderConfig, updateProviderConfig, deleteProviderConfig
} = store

const showAddProviderDialog = ref(false)
const editingProvider = ref<ProviderConfig | null>(null)
const isTesting = ref(false)
const defaultProvider = ref('')
const defaultTemperature = ref(0.7)
const defaultMaxTokens = ref(1000)

const providerForm = reactive({
  name: '',
  provider: '',
  model: '',
  apiKey: '',
  endpoint: '',
  params: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
  }
})

const activeProviders = computed(() => providerConfigs.filter(c => c.isActive))
const availableModels = computed(() => (providerForm.provider ? aiService.getSupportedModels(providerForm.provider) : []))

const canSaveProvider = computed(() =>
  !!(providerForm.name.trim() &&
     providerForm.provider &&
     providerForm.model &&
     providerForm.apiKey.trim() &&
     (providerForm.provider !== 'azure' || providerForm.endpoint.trim()))
)

const getProviderLabel = (p: string) => ({ openai: 'OpenAI', gemini: 'Google Gemini', azure: 'Azure OpenAI' } as const)[p] || p
const getProviderColor = (p: string) => {
  switch (p) {
    case 'openai': return 'tag-success'
    case 'gemini': return 'tag-info'
    case 'azure':  return 'tag-primary'
    default:       return 'tag-primary'
  }
}

const maskApiKey = (key: string) => (key.length <= 8 ? '***' : key.substring(0, 4) + '***' + key.substring(key.length - 4))
const onProviderChange = () => { providerForm.model = ''; providerForm.endpoint = '' }

const addProvider = () => {
  if (!canSaveProvider.value) return
  const data = {
    name: providerForm.name,
    provider: providerForm.provider as 'openai' | 'gemini' | 'azure',
    model: providerForm.model,
    apiKey: providerForm.apiKey,
    endpoint: providerForm.endpoint || undefined,
    params: { ...providerForm.params },
    isActive: true,
  }
  createProviderConfig(data)
  resetProviderForm()
}

const editProvider = (config: ProviderConfig) => {
  editingProvider.value = config
  providerForm.name = config.name
  providerForm.provider = config.provider
  providerForm.model = config.model
  providerForm.apiKey = config.apiKey
  providerForm.endpoint = config.endpoint || ''
  providerForm.params = { ...config.params }
}

const updateProvider = () => {
  if (!editingProvider.value || !canSaveProvider.value) return
  updateProviderConfig(editingProvider.value.id, {
    name: providerForm.name,
    provider: providerForm.provider as 'openai' | 'gemini' | 'azure',
    model: providerForm.model,
    apiKey: providerForm.apiKey,
    endpoint: providerForm.endpoint || undefined,
    params: { ...providerForm.params },
  })
  resetProviderForm()
}

const deleteProvider = (id: string) => {
  if (window.confirm('確定要刪除這個供應商設定嗎？')) deleteProviderConfig(id)
}

const testProvider = async (config: ProviderConfig) => {
  isTesting.value = true
  try {
    const ok = await aiService.validateApiKey(config.provider, config.apiKey, config.model, config.endpoint)
    alert(ok ? 'API Key 驗證成功' : 'API Key 驗證失敗，請檢查設定')
  } catch (e:any) {
    alert(`測試失敗: ${e?.message || '未知錯誤'}`)
  } finally {
    isTesting.value = false
  }
}

const toggleProvider = (config: ProviderConfig) => {
  updateProviderConfig(config.id, { isActive: !config.isActive })
}

const cancelProvider = () => resetProviderForm()
const resetProviderForm = () => {
  providerForm.name = ''
  providerForm.provider = ''
  providerForm.model = ''
  providerForm.apiKey = ''
  providerForm.endpoint = ''
  providerForm.params = { temperature: 0.7, maxTokens: 1000, topP: 1 }
  showAddProviderDialog.value = false
  editingProvider.value = null
}

/** 匯入/清除 **/
const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e:any) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.data) throw new Error('無效的資料格式')

      let imported = 0

      if (Array.isArray(data.data.roles)) {
        for (const r of data.data.roles) { try { createRole(r); imported++ } catch (e) { console.error('匯入角色失敗:', e) } }
      }
      if (Array.isArray(data.data.modules)) {
        for (const m of data.data.modules) { try { createModule(m); imported++ } catch (e) { console.error('匯入模組失敗:', e) } }
      }
      if (Array.isArray(data.data.conversations)) {
        for (const c of data.data.conversations) { try { createConversation(c); imported++ } catch (e) { console.error('匯入對話失敗:', e) } }
      }

      if (data.data.settings) {
        if (data.data.settings.providerConfigs) {
          for (const cfg of data.data.settings.providerConfigs) {
            try { createProviderConfig(cfg) } catch (e) { console.error('匯入供應商設定失敗:', e) }
          }
        }
        if (data.data.settings.defaultSettings) {
          localStorage.setItem('dreammaker-settings', JSON.stringify(data.data.settings.defaultSettings))
        }
      }

      alert(`匯入完成！共匯入 ${imported} 筆資料`)
    } catch (err:any) {
      alert(`匯入失敗: ${err?.message || '未知錯誤'}`)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (window.confirm('確定要清除所有資料嗎？此動作無法復原！')) {
    roles.value = []
    modules.value = []
    conversations.value = []
    providerConfigs.value = []
    localStorage.removeItem('dreammaker-settings')
    localStorage.removeItem('dreammaker-data')
    alert('所有資料已清除')
  }
}

/** 匯出（可勾選內容） **/
const exportFormat = ref<'json' | 'csv'>('json')
const exportOptions = reactive({
  includeRoles: true,
  includeModules: true,
  includeConversations: false,
  includeSettings: false,
})

const setExportPreset = (preset: 'all' | 'rolesModules' | 'settings' | 'none') => {
  switch (preset) {
    case 'all':
      exportOptions.includeRoles = true
      exportOptions.includeModules = true
      exportOptions.includeConversations = true
      exportOptions.includeSettings = true
      break
    case 'rolesModules':
      exportOptions.includeRoles = true
      exportOptions.includeModules = true
      exportOptions.includeConversations = false
      exportOptions.includeSettings = false
      break
    case 'settings':
      exportOptions.includeRoles = false
      exportOptions.includeModules = false
      exportOptions.includeConversations = false
      exportOptions.includeSettings = true
      break
    default:
      exportOptions.includeRoles = false
      exportOptions.includeModules = false
      exportOptions.includeConversations = false
      exportOptions.includeSettings = false
  }
}

const canExport = computed(() =>
  exportOptions.includeRoles || exportOptions.includeModules ||
  exportOptions.includeConversations || exportOptions.includeSettings
)

const exportSelectedData = () => {
  if (!canExport.value) return
  const data: any = { version: '1.0.0', exportedAt: new Date().toISOString(), data: {} }
  if (exportOptions.includeRoles) data.data.roles = roles.value
  if (exportOptions.includeModules) data.data.modules = modules.value
  if (exportOptions.includeConversations) data.data.conversations = conversations.value
  if (exportOptions.includeSettings) {
    data.data.settings = {
      providerConfigs: providerConfigs.value,
      defaultSettings: JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
    }
  }
  if (exportFormat.value === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dreammaker-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    exportToCSV(data)
  }
}

// 供 CSV 匯出取得角色使用的模組（從 notes: "模組使用: id1,id2" 推導）
function getRoleModules(role: Role): Module[] {
  const note = (role as any).notes as string | undefined
  if (!note || !note.includes('模組使用:')) return []
  const ids = (note.split('模組使用: ')[1] || '').split(',').map(s => s.trim()).filter(Boolean)
  return ids.map(id => modules.value.find(m => m.id === id)).filter((m): m is Module => Boolean(m))
}

const exportToCSV = (data: any) => {
  const csvData: string[] = []
  if (data.data.roles) {
    csvData.push('=== 角色資料 ===')
    csvData.push('ID,名稱,描述,模組標題,模組ID,建立時間')
    data.data.roles.forEach((role: Role) => {
      const rms = getRoleModules(role)
      const moduleTitles = rms.map(m => (m.title || '').replace(/\"/g, '""')).join(',')
      const moduleIds = rms.map(m => m.id).join(',')
      csvData.push([role.id, `"${role.name}"`, `"${(role as any).description || ''}"`, `"${moduleTitles}"`, `"${moduleIds}"`, (role as any).createdAt || ''].join(','))
    })
    csvData.push('')
  }
  if (data.data.modules) {
    csvData.push('=== 模組資料 ===')
    csvData.push('ID,類型,標題,內容,語氣提示,建立時間')
    data.data.modules.forEach((module: Module) => {
      csvData.push([module.id, module.type, `"${module.title}"`, `"${module.content.replace(/\"/g, '""')}"`, `"${module.toneHints?.join(',') || ''}"`, module.createdAt].join(','))
    })
    csvData.push('')
  }
  if (data.data.conversations) {
    csvData.push('=== 對話資料 ===')
    csvData.push('對話ID,角色版本ID,標題,建立時間,訊息數量')
    data.data.conversations.forEach((conv: Conversation) => {
      csvData.push([conv.id, conv.roleVersionId, `"${conv.title || ''}"`, conv.createdAt, conv.messages?.length ?? 0].join(','))
    })
  }
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `dreammaker-export-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  const raw = localStorage.getItem('dreammaker-settings')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      defaultProvider.value = parsed.defaultProvider || ''
      defaultTemperature.value = parsed.defaultTemperature ?? 0.7
      defaultMaxTokens.value = parsed.defaultMaxTokens ?? 1000
    } catch (e) { console.error('載入設定失敗:', e) }
  }
})

const saveSettings = () => {
  const settings = {
    defaultProvider: defaultProvider.value,
    defaultTemperature: defaultTemperature.value,
    defaultMaxTokens: defaultMaxTokens.value,
  }
  localStorage.setItem('dreammaker-settings', JSON.stringify(settings))
}
watch([defaultProvider, defaultTemperature, defaultMaxTokens], saveSettings)
</script>

<style scoped>
.settings { padding: var(--spacing-lg); }

/* 列表標題/副標（沿用現有樣式） */
.history-title{ margin:0; color:var(--text-color); font-weight:600; }
.history-subtitle{ color:var(--subtext-color); font-size:.9rem; }

/* Modal */
.modal-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center; z-index: 50;
}
.modal-card{ max-width: 720px; width: 100%; }

/* 卡片 Grid：左資訊，右操作；手機為上下 */
.provider-card{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
}
@media (max-width: 640px){
  .provider-card{ grid-template-columns: 1fr; }
}

.provider-info{ min-width: 0; }
.info-header{ display: flex; align-items: center; flex-wrap: wrap; gap: .5rem .75rem; }

.provider-actions{ display: flex; flex-wrap: wrap; gap: .5rem; justify-content: flex-end; }
@media (max-width: 640px){ .provider-actions{ justify-content: flex-start; } }

.status-dot{ width: .5rem; height: .5rem; border-radius: 9999px; background: #22c55e; }

.info-meta{ color: var(--subtext-color); margin-top: .25rem; font-size: .875rem; line-height: 1.4; word-break: break-word; }
.break-anywhere{ word-break: break-all; overflow-wrap: anywhere; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.history-title{ margin-right: .25rem; max-width: 50%; }
.history-title.truncate, .history-subtitle.truncate{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* === 供應商表單（新增/編輯）網格排列 === */
.provider-form-grid{
  display: grid;
  grid-auto-rows: minmax(0, auto);
  gap: .75rem; /* 行距 */
}

/* 每一行：標題 + 輸入框（同一行） */
.provider-form-grid .form-row,
.provider-form-grid .form-row-full{
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr); /* 固定標籤寬 + 伸縮輸入框 */
  align-items: center;
  gap: .75rem;
}

/* 標籤樣式（同一行呈現） */
.provider-form-grid .form-label-inline{
  display: block;
  white-space: nowrap;
  color: var(--text-color);
  font-weight: 600;
}

/* 讓輸入框填滿該欄位 */
.provider-form-grid .input{
  width: 100%;
}

/* 響應式：小螢幕改為上下排列 */
@media (max-width: 640px){
  .provider-form-grid .form-row,
  .provider-form-grid .form-row-full{
    grid-template-columns: 1fr;
  }
  .provider-form-grid .form-label-inline{ margin-bottom: .25rem; }
}
</style>
