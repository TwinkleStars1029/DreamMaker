<template>
  <div class="settings space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">設定</h2>
    </div>

    <!-- AI 供應商設定 -->
    <section class="modern-card glass">
      <div class="flex items-center justify-between mb-4">
        <h3 class="form-title">AI 供應商設定</h3>
        <button
          type="button"
          @click="showAddProviderDialog = true"
          class="btn btn-primary"
        >
          新增供應商
        </button>
      </div>

      <!-- 列表 -->
      <div class="space-y-4">
        <article
          v-for="config in providerConfigs"
          :key="config.id"
          class="modern-card"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="tag" :class="getProviderColor(config.provider)">
                  {{ getProviderLabel(config.provider) }}
                </span>
                <h4 class="history-title">{{ config.name }}</h4>
                <span class="history-subtitle">{{ config.model }}</span>
                <span
                  v-if="config.isActive"
                  class="inline-block w-2 h-2 rounded-full"
                  style="background:#22c55e"
                  title="目前使用中"
                ></span>
              </div>
              <p class="text-sm" style="color:var(--subtext-color); margin-top:.25rem;">
                API Key: {{ maskApiKey(config.apiKey) }}
                <span v-if="config.endpoint"> ｜ 端點: {{ config.endpoint }}</span>
              </p>
            </div>

            <div class="flex gap-2">
              <button type="button" @click="editProvider(config)" class="action-btn action-btn-edit">編輯</button>
              <button
                type="button"
                @click="testProvider(config)"
                :disabled="isTesting"
                class="btn btn-secondary btn-sm"
              >
                {{ isTesting ? '測試中...' : '測試' }}
              </button>
              <button
                type="button"
                @click="toggleProvider(config)"
                class="btn btn-ghost btn-sm"
              >
                {{ config.isActive ? '停用' : '啟用' }}
              </button>
              <button type="button" @click="deleteProvider(config.id)" class="action-btn action-btn-delete">刪除</button>
            </div>
          </div>
        </article>

        <div v-if="providerConfigs.length === 0" class="empty-state">
          <div class="empty-state-card">
            <div class="empty-state-icon"><div class="spinner-warm mx-auto"></div></div>
            <p class="empty-state-text">還沒有設定任何 AI 供應商</p>
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
            <option value="">選擇預設供應商</option>
            <option v-for="config in activeProviders" :key="config.id" :value="config.id">
              {{ config.name }}（{{ getProviderLabel(config.provider) }}）
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
        <button type="button" @click="exportAllData" class="btn btn-secondary">匯出所有資料</button>
        <button type="button" @click="importData" class="btn btn-primary">匯入資料</button>
        <button type="button" @click="clearAllData" class="btn btn-outline">清除所有資料</button>
      </div>
      <div class="text-sm" style="color:var(--subtext-color);">
        <p>• 匯出：將所有角色、模組、對話和設定匯出為 JSON 檔案</p>
        <p>• 匯入：從 JSON 檔案匯入資料（會合併到現有資料中）</p>
        <p>• 清除：刪除所有本地資料（請謹慎使用）</p>
      </div>
    </section>

    <!-- 新增/編輯供應商對話框 -->
    <div v-if="showAddProviderDialog || editingProvider" class="modal-backdrop">
      <div class="modern-card glass modal-card">
        <h3 class="form-title mb-4">{{ editingProvider ? '編輯供應商' : '新增供應商' }}</h3>

        <div class="space-y-4">
          <div>
            <label class="form-label">供應商名稱 *</label>
            <input v-model="providerForm.name" type="text" class="input w-full" placeholder="例如：我的 OpenAI 帳號" />
          </div>

          <div>
            <label class="form-label">供應商類型 *</label>
            <select v-model="providerForm.provider" @change="onProviderChange" class="input w-full">
              <option value="">選擇供應商</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>

          <div>
            <label class="form-label">模型 *</label>
            <select v-model="providerForm.model" class="input w-full">
              <option value="">選擇模型</option>
              <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>

          <div v-if="providerForm.provider === 'azure'">
            <label class="form-label">端點 *</label>
            <input v-model="providerForm.endpoint" type="url" class="input w-full" placeholder="https://your-resource.openai.azure.com" />
          </div>

          <div>
            <label class="form-label">API Key *</label>
            <input v-model="providerForm.apiKey" type="password" class="input w-full" placeholder="輸入 API Key" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">溫度</label>
              <input v-model.number="providerForm.params.temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
              <div class="text-center text-xs" style="color:var(--subtext-color); margin-top:.25rem;">
                {{ providerForm.params.temperature }}
              </div>
            </div>
            <div>
              <label class="form-label">最大 Token</label>
              <input
                v-model.number="providerForm.params.maxTokens"
                type="number"
                min="100"
                max="4000"
                step="100"
                class="input w-full"
              />
            </div>
          </div>

          <div class="flex gap-3">
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

const store = useAppStore()
const {
  // 原本只取了 provider 的 CRUD，這裡一併取出其他用到的資料與函式
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
  providerForm.name.trim() &&
  providerForm.provider &&
  providerForm.model &&
  providerForm.apiKey.trim() &&
  (providerForm.provider !== 'azure' || providerForm.endpoint.trim())
)

const getProviderLabel = (p: string) =>
  ({ openai: 'OpenAI', gemini: 'Google Gemini', azure: 'Azure OpenAI' } as const)[p] || p

// 用我們的 tag 系統上色
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
    alert(ok ? 'API Key 驗證成功！' : 'API Key 驗證失敗，請檢查設定')
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

/** 匯入/匯出/清除 **/
const exportAllData = () => {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      roles: roles.value,
      modules: modules.value,
      conversations: conversations.value,
      settings: {
        providerConfigs: providerConfigs.value,
        defaultSettings: JSON.parse(localStorage.getItem('dreammaker-settings') || '{}')
      }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dreammaker-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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

      alert(`匯入完成！共匯入 ${imported} 個項目`)
    } catch (err:any) {
      alert(`匯入失敗: ${err?.message || '未知錯誤'}`)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (window.confirm('確定要清除所有資料嗎？此操作無法復原！')) {
    roles.value = []
    modules.value = []
    conversations.value = []
    providerConfigs.value = []
    localStorage.removeItem('dreammaker-settings')
    localStorage.removeItem('dreammaker-data')
    alert('所有資料已清除')
  }
}

/** 初始化與設定保存 **/
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

/* 頁首 */
.page-header{
  display:flex; align-items:center; justify-content:space-between;
  padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--border-light);
}
.page-title{
  margin:0; font-size:1.5rem; font-weight:700; color:var(--text-color);
  background: var(--gradient-warm);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* 列表內文樣式（沿用前頁一致） */
.history-title{ margin:0; color:var(--text-color); font-weight:600; }
.history-subtitle{ color:var(--subtext-color); font-size:.9rem; }

/* Action Buttons（延續你的統一樣式） */
.action-btn{
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size:.875rem; font-weight:500; transition: all var(--transition-fast);
  border:none; cursor:pointer;
}
.action-btn-edit{ background: var(--gradient-primary); color: var(--text-color); }
.action-btn-edit:hover{ background: var(--gradient-soft); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.action-btn-delete{ background: transparent; color:#dc2626; border:1px solid #dc2626; }
.action-btn-delete:hover{ background:#dc2626; color:#fff; transform: translateY(-1px); box-shadow:0 4px 14px rgba(220,38,38,.25); }

/* Modal */
.modal-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center; z-index: 50;
}
.modal-card{ max-width: 720px; width: 100%; }
</style>
