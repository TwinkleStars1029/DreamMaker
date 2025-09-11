<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">匯入/匯出</h2>
    </div>

    <!-- 匯出區域 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">匯出資料</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <h4 class="font-medium text-gray-700">匯出格式</h4>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="exportFormat"
                type="radio"
                value="json"
                class="mr-2"
              />
              <span>JSON 格式（完整資料）</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportFormat"
                type="radio"
                value="csv"
                class="mr-2"
              />
              <span>CSV 格式（表格資料）</span>
            </label>
          </div>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-medium text-gray-700">匯出內容</h4>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeRoles"
                type="checkbox"
                class="mr-2"
              />
              <span>角色資料</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeModules"
                type="checkbox"
                class="mr-2"
              />
              <span>模組資料</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeConversations"
                type="checkbox"
                class="mr-2"
              />
              <span>對話記錄</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeSettings"
                type="checkbox"
                class="mr-2"
              />
              <span>設定資料</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <button
          @click="exportData"
          :disabled="!canExport"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          匯出資料
        </button>
      </div>
    </div>

    <!-- 匯入區域 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">匯入資料</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            選擇檔案
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".json,.csv"
            @change="handleFileSelect"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div v-if="selectedFile" class="p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">
            已選擇檔案：{{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-500">
            大小：{{ formatFileSize(selectedFile.size) }}
          </p>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="importData"
            :disabled="!selectedFile || isImporting"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isImporting ? '匯入中...' : '匯入資料' }}
          </button>
          <button
            v-if="selectedFile"
            @click="clearFile"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            清除
          </button>
        </div>
      </div>
    </div>

    <!-- 匯入結果 -->
    <div v-if="importResult" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">匯入結果</h3>
      <div :class="[
        'p-4 rounded-lg',
        importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      ]">
        <div class="flex items-center">
          <svg
            v-if="importResult.success"
            class="w-5 h-5 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span :class="[
            'font-medium',
            importResult.success ? 'text-green-800' : 'text-red-800'
          ]">
            {{ importResult.success ? '匯入成功！' : '匯入失敗' }}
          </span>
        </div>
        <p class="mt-2 text-sm" :class="importResult.success ? 'text-green-700' : 'text-red-700'">
          {{ importResult.message }}
        </p>
        <div v-if="importResult.details" class="mt-3 text-sm">
          <h4 class="font-medium mb-2">詳細資訊：</h4>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="(detail, index) in importResult.details" :key="index">
              {{ detail }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 資料統計 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">資料統計</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ roles.length }}</div>
          <div class="text-sm text-gray-600">角色</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ modules.length }}</div>
          <div class="text-sm text-gray-600">模組</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ conversations.length }}</div>
          <div class="text-sm text-gray-600">對話</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ totalMessages }}</div>
          <div class="text-sm text-gray-600">訊息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Role, Module, Conversation, Message } from '../types'

const store = useAppStore()
const { roles, modules, conversations, createRole, createModule, createConversation, addMessage, providerConfigs } = store

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const exportFormat = ref<'json' | 'csv'>('json')
const isImporting = ref(false)
const importResult = ref<{
  success: boolean
  message: string
  details?: string[]
} | null>(null)

const exportOptions = reactive({
  includeRoles: true,
  includeModules: true,
  includeConversations: false,
  includeSettings: false,
})

const canExport = computed(() => {
  return exportOptions.includeRoles || exportOptions.includeModules || 
         exportOptions.includeConversations || exportOptions.includeSettings
})

const totalMessages = computed(() => {
  return conversations.reduce((total, conv) => total + conv.messages.length, 0)
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const exportData = () => {
  if (!canExport.value) return

  const data: any = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {}
  }

  if (exportOptions.includeRoles) {
    data.data.roles = roles.value
  }
  if (exportOptions.includeModules) {
    data.data.modules = modules.value
  }
  if (exportOptions.includeConversations) {
    data.data.conversations = conversations.value
  }
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
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    // CSV 匯出
    exportToCSV(data)
  }
}

const exportToCSV = (data: any) => {
  const csvData: string[] = []
  
  if (data.data.roles) {
    csvData.push('=== 角色資料 ===')
    csvData.push('ID,名稱,描述,標籤,建立時間')
    data.data.roles.forEach((role: Role) => {
      csvData.push([
        role.id,
        `"${role.name}"`,
        `"${role.description || ''}"`,
        `"${role.tags?.join(',') || ''}"`,
        role.createdAt
      ].join(','))
    })
    csvData.push('')
  }
  
  if (data.data.modules) {
    csvData.push('=== 模組資料 ===')
    csvData.push('ID,類型,標題,內容,語氣提示,建立時間')
    data.data.modules.forEach((module: Module) => {
      csvData.push([
        module.id,
        module.type,
        `"${module.title}"`,
        `"${module.content.replace(/"/g, '""')}"`,
        `"${module.toneHints?.join(',') || ''}"`,
        module.createdAt
      ].join(','))
    })
    csvData.push('')
  }
  
  if (data.data.conversations) {
    csvData.push('=== 對話資料 ===')
    csvData.push('對話ID,角色ID,標題,建立時間,訊息數量')
    data.data.conversations.forEach((conv: Conversation) => {
      csvData.push([
        conv.id,
        conv.roleId,
        `"${conv.title}"`,
        conv.createdAt,
        conv.messages.length
      ].join(','))
    })
  }
  
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dreammaker-export-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    importResult.value = null
  }
}

const clearFile = () => {
  selectedFile.value = null
  importResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const importData = async () => {
  if (!selectedFile.value) return
  
  isImporting.value = true
  importResult.value = null
  
  try {
    const text = await selectedFile.value.text()
    let data: any
    
    if (selectedFile.value.name.endsWith('.json')) {
      data = JSON.parse(text)
    } else if (selectedFile.value.name.endsWith('.csv')) {
      data = parseCSV(text)
    } else {
      throw new Error('不支援的檔案格式')
    }
    
    const details: string[] = []
    let successCount = 0
    
    // 驗證資料格式
    if (!data.data) {
      throw new Error('無效的資料格式')
    }
    
    // 匯入角色
    if (data.data.roles && Array.isArray(data.data.roles)) {
      for (const role of data.data.roles) {
        try {
          createRole(role)
          successCount++
        } catch (error) {
          details.push(`角色 "${role.name}" 匯入失敗: ${error}`)
        }
      }
      details.push(`成功匯入 ${successCount} 個角色`)
    }
    
    // 匯入模組
    if (data.data.modules && Array.isArray(data.data.modules)) {
      let moduleCount = 0
      for (const module of data.data.modules) {
        try {
          createModule(module)
          moduleCount++
        } catch (error) {
          details.push(`模組 "${module.title}" 匯入失敗: ${error}`)
        }
      }
      details.push(`成功匯入 ${moduleCount} 個模組`)
    }
    
    // 匯入對話
    if (data.data.conversations && Array.isArray(data.data.conversations)) {
      let convCount = 0
      for (const conv of data.data.conversations) {
        try {
          createConversation(conv)
          convCount++
        } catch (error) {
          details.push(`對話 "${conv.title}" 匯入失敗: ${error}`)
        }
      }
      details.push(`成功匯入 ${convCount} 個對話`)
    }
    
    // 匯入設定
    if (data.data.settings) {
      if (data.data.settings.providerConfigs) {
        // 匯入供應商設定
        for (const config of data.data.settings.providerConfigs) {
          try {
            store.createProviderConfig(config)
          } catch (error) {
            details.push(`供應商設定 "${config.name}" 匯入失敗: ${error}`)
          }
        }
      }
      if (data.data.settings.defaultSettings) {
        // 匯入預設設定
        localStorage.setItem('dreammaker-settings', JSON.stringify(data.data.settings.defaultSettings))
        details.push('成功匯入預設設定')
      }
    }
    
    importResult.value = {
      success: true,
      message: `匯入完成！共處理 ${successCount} 個項目`,
      details
    }
    
  } catch (error) {
    importResult.value = {
      success: false,
      message: `匯入失敗: ${error}`,
      details: []
    }
  } finally {
    isImporting.value = false
  }
}

const parseCSV = (csvText: string): any => {
  const lines = csvText.split('\n')
  const data: any = {
    data: {
      roles: [],
      modules: [],
      conversations: []
    }
  }
  
  let currentSection = ''
  let headers: string[] = []
  
  for (const line of lines) {
    if (line.trim() === '') continue
    
    if (line.startsWith('=== ')) {
      currentSection = line.replace(/=== | ===/g, '')
      continue
    }
    
    if (line.includes(',')) {
      const values = parseCSVLine(line)
      
      if (currentSection === '角色資料' && headers.length === 0) {
        headers = values
        continue
      } else if (currentSection === '模組資料' && headers.length === 0) {
        headers = values
        continue
      } else if (currentSection === '對話資料' && headers.length === 0) {
        headers = values
        continue
      }
      
      // 根據當前區段處理資料
      if (currentSection === '角色資料' && headers.length > 0) {
        const role = {
          id: values[0],
          name: values[1]?.replace(/"/g, '') || '',
          description: values[2]?.replace(/"/g, '') || '',
          tags: values[3]?.replace(/"/g, '').split(',').filter(Boolean) || [],
          createdAt: values[4] || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: ''
        }
        data.data.roles.push(role)
      }
    }
  }
  
  return data
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // 跳過下一個引號
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

