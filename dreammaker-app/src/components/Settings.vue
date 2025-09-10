<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">設定</h2>
    </div>

    <!-- AI 供應商設定 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">AI 供應商設定</h3>
      
      <!-- 新增供應商按鈕 -->
      <div class="mb-4">
        <button
          @click="showAddProviderDialog = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新增供應商
        </button>
      </div>

      <!-- 供應商列表 -->
      <div class="space-y-4">
        <div
          v-for="config in providerConfigs"
          :key="config.id"
          class="border rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    getProviderColor(config.provider)
                  ]"
                >
                  {{ getProviderLabel(config.provider) }}
                </span>
                <h4 class="font-medium text-gray-900">{{ config.name }}</h4>
                <span class="text-sm text-gray-500">{{ config.model }}</span>
                <span
                  v-if="config.isActive"
                  class="inline-block w-2 h-2 bg-green-500 rounded-full"
                  title="目前使用中"
                ></span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                API Key: {{ maskApiKey(config.apiKey) }}
                <span v-if="config.endpoint"> | 端點: {{ config.endpoint }}</span>
              </p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editProvider(config)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                編輯
              </button>
              <button
                @click="testProvider(config)"
                :disabled="isTesting"
                class="text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"
              >
                {{ isTesting ? '測試中...' : '測試' }}
              </button>
              <button
                @click="toggleProvider(config)"
                :class="[
                  'text-sm',
                  config.isActive
                    ? 'text-orange-600 hover:text-orange-800'
                    : 'text-green-600 hover:text-green-800'
                ]"
              >
                {{ config.isActive ? '停用' : '啟用' }}
              </button>
              <button
                @click="deleteProvider(config.id)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="providerConfigs.length === 0" class="text-center py-8">
        <p class="text-gray-500">還沒有設定任何 AI 供應商</p>
      </div>
    </div>

    <!-- 預設設定 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">預設設定</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            預設供應商
          </label>
          <select
            v-model="defaultProvider"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選擇預設供應商</option>
            <option
              v-for="config in activeProviders"
              :key="config.id"
              :value="config.id"
            >
              {{ config.name }} ({{ getProviderLabel(config.provider) }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            預設溫度
          </label>
          <input
            v-model.number="defaultTemperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (保守)</span>
            <span>{{ defaultTemperature }}</span>
            <span>2 (創意)</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            最大 Token 數
          </label>
          <input
            v-model.number="defaultMaxTokens"
            type="number"
            min="100"
            max="4000"
            step="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- 資料管理 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">資料管理</h3>
      <div class="space-y-4">
        <div class="flex space-x-3">
          <button
            @click="exportAllData"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            匯出所有資料
          </button>
          <button
            @click="importData"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            匯入資料
          </button>
          <button
            @click="clearAllData"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            清除所有資料
          </button>
        </div>
        <div class="text-sm text-gray-600">
          <p>• 匯出：將所有角色、模組、對話和設定匯出為 JSON 檔案</p>
          <p>• 匯入：從 JSON 檔案匯入資料（會合併到現有資料中）</p>
          <p>• 清除：刪除所有本地資料（請謹慎使用）</p>
        </div>
      </div>
    </div>

    <!-- 新增/編輯供應商對話框 -->
    <div v-if="showAddProviderDialog || editingProvider" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingProvider ? '編輯供應商' : '新增供應商' }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              供應商名稱 *
            </label>
            <input
              v-model="providerForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：我的 OpenAI 帳號"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              供應商類型 *
            </label>
            <select
              v-model="providerForm.provider"
              @change="onProviderChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選擇供應商</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="azure">Azure OpenAI</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              模型 *
            </label>
            <select
              v-model="providerForm.model"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選擇模型</option>
              <option
                v-for="model in availableModels"
                :key="model"
                :value="model"
              >
                {{ model }}
              </option>
            </select>
          </div>
          <div v-if="providerForm.provider === 'azure'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              端點 *
            </label>
            <input
              v-model="providerForm.endpoint"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-resource.openai.azure.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              v-model="providerForm.apiKey"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入 API Key"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                溫度
              </label>
              <input
                v-model.number="providerForm.params.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full"
              />
              <div class="text-center text-xs text-gray-500 mt-1">
                {{ providerForm.params.temperature }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                最大 Token
              </label>
              <input
                v-model.number="providerForm.params.maxTokens"
                type="number"
                min="100"
                max="4000"
                step="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="editingProvider ? updateProvider() : addProvider()"
              :disabled="!canSaveProvider"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ editingProvider ? '更新' : '新增' }}
            </button>
            <button
              @click="cancelProvider"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import { aiService } from '../services/aiService'
import type { ProviderConfig } from '../services/aiService'

const store = useAppStore()
const { providerConfigs, createProviderConfig, updateProviderConfig, deleteProviderConfig } = store

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

const activeProviders = computed(() => {
  return providerConfigs.filter(config => config.isActive)
})

const availableModels = computed(() => {
  if (!providerForm.provider) return []
  return aiService.getSupportedModels(providerForm.provider)
})

const canSaveProvider = computed(() => {
  return providerForm.name.trim() && 
         providerForm.provider && 
         providerForm.model && 
         providerForm.apiKey.trim() &&
         (providerForm.provider !== 'azure' || providerForm.endpoint.trim())
})

const getProviderLabel = (provider: string) => {
  const labels = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    azure: 'Azure OpenAI',
  }
  return labels[provider as keyof typeof labels] || provider
}

const getProviderColor = (provider: string) => {
  const colors = {
    openai: 'bg-green-100 text-green-800',
    gemini: 'bg-blue-100 text-blue-800',
    azure: 'bg-purple-100 text-purple-800',
  }
  return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const maskApiKey = (apiKey: string) => {
  if (apiKey.length <= 8) return '***'
  return apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4)
}

const onProviderChange = () => {
  providerForm.model = ''
  providerForm.endpoint = ''
}

const addProvider = async () => {
  if (!canSaveProvider.value) return

  const configData = {
    name: providerForm.name,
    provider: providerForm.provider as 'openai' | 'gemini' | 'azure',
    model: providerForm.model,
    apiKey: providerForm.apiKey,
    endpoint: providerForm.endpoint || undefined,
    params: { ...providerForm.params },
    isActive: true,
  }

  createProviderConfig(configData)
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

const updateProvider = async () => {
  if (!editingProvider.value || !canSaveProvider.value) return

  const updates = {
    name: providerForm.name,
    provider: providerForm.provider as 'openai' | 'gemini' | 'azure',
    model: providerForm.model,
    apiKey: providerForm.apiKey,
    endpoint: providerForm.endpoint || undefined,
    params: { ...providerForm.params },
  }

  updateProviderConfig(editingProvider.value.id, updates)
  resetProviderForm()
}

const deleteProvider = (id: string) => {
  if (window.confirm('確定要刪除這個供應商設定嗎？')) {
    deleteProviderConfig(id)
  }
}

const testProvider = async (config: ProviderConfig) => {
  isTesting.value = true
  try {
    const isValid = await aiService.validateApiKey(
      config.provider,
      config.apiKey,
      config.model,
      config.endpoint
    )
    
    if (isValid) {
      alert('API Key 驗證成功！')
    } else {
      alert('API Key 驗證失敗，請檢查設定')
    }
  } catch (error) {
    alert(`測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
  } finally {
    isTesting.value = false
  }
}

const toggleProvider = (config: ProviderConfig) => {
  updateProviderConfig(config.id, {
    isActive: !config.isActive
  })
}

const cancelProvider = () => {
  resetProviderForm()
}

const resetProviderForm = () => {
  providerForm.name = ''
  providerForm.provider = ''
  providerForm.model = ''
  providerForm.apiKey = ''
  providerForm.endpoint = ''
  providerForm.params = {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
  }
  showAddProviderDialog.value = false
  editingProvider.value = null
}

// 匯入/匯出功能
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
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.data) {
        throw new Error('無效的資料格式')
      }
      
      let importedCount = 0
      
      // 匯入角色
      if (data.data.roles && Array.isArray(data.data.roles)) {
        for (const role of data.data.roles) {
          try {
            createRole(role)
            importedCount++
          } catch (error) {
            console.error('匯入角色失敗:', error)
          }
        }
      }
      
      // 匯入模組
      if (data.data.modules && Array.isArray(data.data.modules)) {
        for (const module of data.data.modules) {
          try {
            createModule(module)
            importedCount++
          } catch (error) {
            console.error('匯入模組失敗:', error)
          }
        }
      }
      
      // 匯入對話
      if (data.data.conversations && Array.isArray(data.data.conversations)) {
        for (const conv of data.data.conversations) {
          try {
            createConversation(conv)
            importedCount++
          } catch (error) {
            console.error('匯入對話失敗:', error)
          }
        }
      }
      
      // 匯入設定
      if (data.data.settings) {
        if (data.data.settings.providerConfigs) {
          for (const config of data.data.settings.providerConfigs) {
            try {
              createProviderConfig(config)
            } catch (error) {
              console.error('匯入供應商設定失敗:', error)
            }
          }
        }
        if (data.data.settings.defaultSettings) {
          localStorage.setItem('dreammaker-settings', JSON.stringify(data.data.settings.defaultSettings))
        }
      }
      
      alert(`匯入完成！共匯入 ${importedCount} 個項目`)
    } catch (error) {
      alert(`匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (window.confirm('確定要清除所有資料嗎？此操作無法復原！')) {
    // 清除所有資料
    roles.value = []
    modules.value = []
    conversations.value = []
    providerConfigs.value = []
    localStorage.removeItem('dreammaker-settings')
    localStorage.removeItem('dreammaker-data')
    alert('所有資料已清除')
  }
}

onMounted(() => {
  // 載入預設設定
  const settings = localStorage.getItem('dreammaker-settings')
  if (settings) {
    try {
      const parsed = JSON.parse(settings)
      defaultProvider.value = parsed.defaultProvider || ''
      defaultTemperature.value = parsed.defaultTemperature || 0.7
      defaultMaxTokens.value = parsed.defaultMaxTokens || 1000
    } catch (error) {
      console.error('載入設定失敗:', error)
    }
  }
})

// 監聽設定變更並保存
const saveSettings = () => {
  const settings = {
    defaultProvider: defaultProvider.value,
    defaultTemperature: defaultTemperature.value,
    defaultMaxTokens: defaultMaxTokens.value,
  }
  localStorage.setItem('dreammaker-settings', JSON.stringify(settings))
}

// 監聽設定變更
watch([defaultProvider, defaultTemperature, defaultMaxTokens], saveSettings)
</script>
