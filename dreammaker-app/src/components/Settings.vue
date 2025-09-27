<template>
  <div class="settings space-y-6">
    <!-- ?? -->
    <div class="page-header">
      <h2 class="page-title">閮剖?</h2>
    </div>

    <!-- AI 靘??身摰?-->
    <section class="modern-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="form-title">AI 靘??身摰?/h3>
        <button
          type="button"
          @click="showAddProviderDialog = true"
          class="btn btn-primary"
        >
          ?啣?靘???
        </button>
      </div>

      <!-- ?” -->
      <div class="space-y-4">
        <article
          v-for="config in providerConfigs"
          :key="config.id"
          class="modern-card provider-card"
        >
          <!-- 撌血嚗???鞈? -->
          <div class="provider-info">
            <div class="info-header">
              <span class="tag shrink-0" :class="getProviderColor(config.provider)">
                {{ getProviderLabel(config.provider) }}
              </span>
              <h4 class="history-title truncate">{{ config.name }}</h4>
              <span class="history-subtitle truncate sm:max-w-[40%]">{{ config.model }}</span>
              <span
                v-if="config.isActive"
                class="status-dot"
                title="?桀?雿輻銝?
              ></span>
            </div>

            <p class="info-meta">
              API Key: <span class="mono">{{ maskApiKey(config.apiKey) }}</span>
              <span v-if="config.endpoint"> 嚚?蝡舫?: <span class="break-anywhere">{{ config.endpoint }}</span></span>
            </p>
          </div>

          <!-- ?喳嚗?雿???-->
          <div class="provider-actions">
            <button type="button" @click="editProvider(config)" class="action-btn action-btn-edit">蝺刻摩</button>
            <button
              type="button"
              @click="testProvider(config)"
              :disabled="isTesting"
              class="action-btn action-btn-edit"
            >
              {{ isTesting ? '皜祈岫銝?..' : '皜祈岫' }}
            </button>
            <button
              type="button"
              @click="toggleProvider(config)"
              class="action-btn action-btn-delete"
            >
              {{ config.isActive ? '?' : '?' }}
            </button>
            <button type="button" @click="deleteProvider(config.id)" class="action-btn action-btn-delete">?芷</button>
          </div>
        </article>


        <div v-if="providerConfigs.length === 0" class="empty-state">
          <div class="empty-state-card">
            <div class="empty-state-icon"><div class="spinner-warm mx-auto"></div></div>
            <p class="empty-state-text">???身摰遙雿?AI 靘???/p>
            <button type="button" class="btn btn-primary mt-3" @click="showAddProviderDialog = true">?啣?靘???/button>
          </div>
        </div>
      </div>
    </section>

    <!-- ?身閮剖? -->
    <section class="modern-card">
      <h3 class="form-title mb-4">資料管理</h3>
      <div class="space-y-4">
        <div>
          <label class="form-label">?身靘???/label>
          <select v-model="defaultProvider" class="input w-full">
            <option value="">?豢??身靘???/option>
            <option v-for="config in activeProviders" :key="config.id" :value="config.id">
              {{ config.name }}嚗{ getProviderLabel(config.provider) }}嚗?
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">?身皞怠漲</label>
          <input v-model.number="defaultTemperature" type="range" min="0" max="2" step="0.1" class="w-full" />
          <div class="flex justify-between text-xs" style="color:var(--subtext-color); margin-top:.25rem;">
            <span>0嚗?摰?</span>
            <span>{{ defaultTemperature }}</span>
            <span>2嚗??</span>
          </div>
        </div>

        <div>
          <label class="form-label">?憭?Token ??/label>
          <input
            v-model.number="defaultMaxTokens"
            type="number"
            min="100"
            max="4000"
            step="100"
            class="input w-full"
            placeholder="靘?嚗?000"
          />
        </div>
      </div>
    </section>

    <!-- 鞈?蝞∠? -->
    <section class="modern-card">
      <h3 class="form-title mb-4">資料管理</h3>
      <div class="flex flex-wrap gap-3 mb-3">
        <button type="button" @click="importData" class="btn btn-primary">匯入資料</button>
        <button type="button" @click="clearAllData" class="btn btn-outline">清除所有資料</button>
      </div>
      <!-- ?臬?賊?嚗?暸?批捆嚗?-->
      <div class="space-y-3 mt-4">
        <h4 class="form-title">?臬?賊?</h4>
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
            <span>閫</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeModules" type="checkbox" />
            <span>璅∠?</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeConversations" type="checkbox" />
            <span>撠店</span>
          </label>
          <label class="flex items-center gap-2">
            <input v-model="exportOptions.includeSettings" type="checkbox" />
            <span>閮剖?</span>
          </label>
        </div>
        <div>
          <button type="button" class="btn btn-secondary" :disabled="!canExport" @click="exportSelectedData">?臬鞈?</button>
        </div>
      </div>

      <div class="text-sm" style="color:var(--subtext-color);">
        <p>???臬嚗?????脯芋蝯?閰勗?閮剖??臬??JSON 瑼?</p>
        <p>???臬嚗? JSON 瑼??臬鞈?嚗??蔥?啁???葉嚗?/p>
        <p>??皜嚗?斗???啗???隢牲?蝙?剁?</p>
      </div>
    </section>

    <!-- ?啣?/蝺刻摩靘???閰望? -->
    <div v-if="showAddProviderDialog || editingProvider" class="modal-backdrop">
      <div class="modern-card">
        <h3 class="form-title mb-4">資料管理</h3>

        <div class="space-y-4">
          <div>
            <label class="form-label">靘???蝔?*</label>
            <input v-model="providerForm.name" type="text" class="input w-full" placeholder="靘?嚗???OpenAI 撣唾?" />
          </div>

          <div>
            <label class="form-label">靘?????*</label>
            <select v-model="providerForm.provider" @change="onProviderChange" class="input w-full">
              <option value="">?豢?靘???/option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>

          <div>
            <label class="form-label">璅∪? *</label>
            <select v-model="providerForm.model" class="input w-full">
              <option value="">?豢?璅∪?</option>
              <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
            </select>
          </div>

          <div v-if="providerForm.provider === 'azure'">
            <label class="form-label">蝡舫? *</label>
            <input v-model="providerForm.endpoint" type="url" class="input w-full" placeholder="https://your-resource.openai.azure.com" />
          </div>

          <div>
            <label class="form-label">API Key *</label>
            <input v-model="providerForm.apiKey" type="password" class="input w-full" placeholder="頛詨 API Key" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">皞怠漲</label>
              <input v-model.number="providerForm.params.temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
              <div class="text-center text-xs" style="color:var(--subtext-color); margin-top:.25rem;">
                {{ providerForm.params.temperature }}
              </div>
            </div>
            <div>
              <label class="form-label">?憭?Token</label>
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
              {{ editingProvider ? '?湔' : '?啣?' }}
            </button>
            <button type="button" @click="cancelProvider" class="btn btn-ghost">??</button>
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
  // ??芸?鈭?provider ??CRUD嚗ㄐ銝雿萄??箏隞?啁?鞈??撘?
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

// ?冽??? tag 蝟餌絞銝
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
  if (window.confirm('蝣箏?閬?日???閮剖???')) deleteProviderConfig(id)
}

const testProvider = async (config: ProviderConfig) => {
  isTesting.value = true
  try {
    const ok = await aiService.validateApiKey(config.provider, config.apiKey, config.model, config.endpoint)
    alert(ok ? 'API Key 撽???嚗? : 'API Key 撽?憭望?嚗?瑼Ｘ閮剖?')
  } catch (e:any) {
    alert(`皜祈岫憭望?: ${e?.message || '?芰?航炊'}`)
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

/** ?臬/?臬/皜 **/
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
      if (!data.data) throw new Error('?⊥????撘?)

      let imported = 0

      if (Array.isArray(data.data.roles)) {
        for (const r of data.data.roles) { try { createRole(r); imported++ } catch (e) { console.error('?臬閫憭望?:', e) } }
      }
      if (Array.isArray(data.data.modules)) {
        for (const m of data.data.modules) { try { createModule(m); imported++ } catch (e) { console.error('?臬璅∠?憭望?:', e) } }
      }
      if (Array.isArray(data.data.conversations)) {
        for (const c of data.data.conversations) { try { createConversation(c); imported++ } catch (e) { console.error('?臬撠店憭望?:', e) } }
      }

      if (data.data.settings) {
        if (data.data.settings.providerConfigs) {
          for (const cfg of data.data.settings.providerConfigs) {
            try { createProviderConfig(cfg) } catch (e) { console.error('?臬靘??身摰仃??', e) }
          }
        }
        if (data.data.settings.defaultSettings) {
          localStorage.setItem('dreammaker-settings', JSON.stringify(data.data.settings.defaultSettings))
        }
      }

      alert(`?臬摰?嚗?臬 ${imported} ???害)
    } catch (err:any) {
      alert(`?臬憭望?: ${err?.message || '?芰?航炊'}`)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (window.confirm('蝣箏?閬??斗?????嚗迨???⊥?敺拙?嚗?)) {
    roles.value = []
    modules.value = []
    conversations.value = []
    providerConfigs.value = []
    localStorage.removeItem('dreammaker-settings')
    localStorage.removeItem('dreammaker-data')
    alert('????歇皜')
  }
}

/** ????閮剖?靽? **/
// ?臬?賊?嚗?暸?批捆嚗?const exportFormat = ref<'json' | 'csv'>('json')
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
function getRoleModules(role: Role): Module[] {
  const note = (role as any).notes as string | undefined
  if (!note || !note.includes('璅∠?雿輻:')) return []
  const ids = (note.split('璅∠?雿輻: ')[1] || '').split(',').map(s => s.trim()).filter(Boolean)
  return ids.map(id => modules.value.find(m => m.id === id)).filter((m): m is Module => Boolean(m))
}
const exportToCSV = (data: any) => {
  const csvData: string[] = []
  if (data.data.roles) {
    csvData.push('=== 閫鞈? ===')
    csvData.push('ID,?迂,?膩,璅∠?璅?,璅∠?ID,撱箇???')
    data.data.roles.forEach((role: Role) => {
      const rms = getRoleModules(role)
      const moduleTitles = rms.map(m => (m.title || '').replace(/\\"/g, '""')).join(',')
      const moduleIds = rms.map(m => m.id).join(',')
      csvData.push([role.id, `"${role.name}"`, `"${(role as any).description || ''}"`, `"${moduleTitles}"`, `"${moduleIds}"`, (role as any).createdAt || ''].join(','))
    })
    csvData.push('')
  }
  if (data.data.modules) {
    csvData.push('=== 璅∠?鞈? ===')
    csvData.push('ID,憿?,璅?,?批捆,隤除?內,撱箇???')
    data.data.modules.forEach((module: Module) => {
      csvData.push([module.id, module.type, `"${module.title}"`, `"${module.content.replace(/\\"/g, '""')}"`, `"${module.toneHints?.join(',') || ''}"`, module.createdAt].join(','))
    })
    csvData.push('')
  }
  if (data.data.conversations) {
    csvData.push('=== 撠店鞈? ===')
    csvData.push('撠店ID,閫?ID,璅?,撱箇???,閮?賊?')
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
    } catch (e) { console.error('頛閮剖?憭望?:', e) }
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


/* ?”?扳?璅??嚗窒?典????湛? */
.history-title{ margin:0; color:var(--text-color); font-weight:600; }
.history-subtitle{ color:var(--subtext-color); font-size:.9rem; }



/* Modal */
.modal-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center; z-index: 50;
}
.modal-card{ max-width: 720px; width: 100%; }

/* ?∠?隞?Grid 雿?嚗椰鞈?嚗??嚗??Ｗ??寧銝??? */
.provider-card{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: start;
}
@media (max-width: 640px){
  .provider-card{
    grid-template-columns: 1fr;
  }
}

/* 撌血?批捆嚗?憿??迂??嚗?靽?瞍漁??頝?*/
.provider-info{
  min-width: 0; /* 霈?truncate ?? */
}
.info-header{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem .75rem;
}

/* ?喳??嚗?芸???嚗????∠??祝 */
.provider-actions{
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: flex-end;
}
@media (max-width: 640px){
  .provider-actions{
    justify-content: flex-start;
  }
}

/* 蝬?靽格迤嚗??inline style ??銵?憭望? */
.status-dot{
  width: .5rem; height: .5rem; border-radius: 9999px;
  background: #22c55e;
}

/* 甈∟?鞈????脰??瑁?銵 */
.info-meta{
  color: var(--subtext-color);
  margin-top: .25rem;
  font-size: .875rem;
  line-height: 1.4;
  word-break: break-word;
}
.break-anywhere{ word-break: break-all; overflow-wrap: anywhere; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* 霈?蝔梯????函征??頞單??芷??芣 */
.history-title{ margin-right: .25rem; max-width: 50%; }
.history-title.truncate, .history-subtitle.truncate{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

</style>




