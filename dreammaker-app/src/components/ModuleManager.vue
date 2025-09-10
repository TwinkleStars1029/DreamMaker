<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">模組管理</h2>
      <div class="flex space-x-2">
        <select
          v-model="selectedModuleType"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">選擇模組類型</option>
          <option value="basic">基本資訊</option>
          <option value="persona">性格特徵</option>
          <option value="background">背景故事</option>
          <option value="instruction">指令片段</option>
        </select>
        <button
          @click="isCreating = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新增模組
        </button>
      </div>
    </div>

    <!-- 模組類型篩選 -->
    <div class="flex space-x-2">
      <button
        v-for="type in moduleTypes"
        :key="type.value"
        @click="selectedModuleType = type.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          selectedModuleType === type.value
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- 建立/編輯表單 -->
    <div v-if="isCreating || editingId" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">
        {{ editingId ? '編輯模組' : '新增模組' }}
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            模組類型 *
          </label>
          <select
            v-model="formData.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="basic">基本資訊</option>
            <option value="persona">性格特徵</option>
            <option value="background">背景故事</option>
            <option value="instruction">指令片段</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            模組標題 *
          </label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="輸入模組標題"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            模組內容 *
          </label>
          <textarea
            v-model="formData.content"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            :placeholder="getPlaceholder(formData.type)"
          />
        </div>
        <div v-if="formData.type === 'persona'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            語氣提示
          </label>
          <input
            v-model="formData.toneHints"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="用逗號分隔，例如：溫柔, 抒情, 文學感"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            版本描述
          </label>
          <input
            v-model="formData.versionNote"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如：溫柔版 v1、冷酷版 v2"
          />
        </div>
        <div class="flex space-x-3">
          <button
            @click="editingId ? handleUpdate() : handleCreate()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ editingId ? '更新' : '建立' }}
          </button>
          <button
            @click="handleCancel"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 模組列表 -->
    <div class="space-y-4">
      <div
        v-for="module in filteredModules"
        :key="module.id"
        class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded',
                  getModuleTypeColor(module.type)
                ]"
              >
                {{ getModuleTypeLabel(module.type) }}
              </span>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ module.title }}
              </h3>
            </div>
            <p class="text-gray-600 text-sm mb-3 whitespace-pre-wrap">
              {{ module.content }}
            </p>
            <div v-if="module.toneHints && module.toneHints.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="(hint, index) in module.toneHints"
                :key="index"
                class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
              >
                {{ hint }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2 ml-4">
            <button
              @click="handleEdit(module)"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              編輯
            </button>
            <button
              @click="handleDelete(module.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredModules.length === 0" class="text-center py-12">
      <p class="text-gray-500">
        {{ selectedModuleType ? `沒有 ${getModuleTypeLabel(selectedModuleType)} 模組` : '還沒有任何模組' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Module } from '../types'

const store = useAppStore()
const { modules, createModule, updateModule, deleteModule } = store

const selectedModuleType = ref('')
const isCreating = ref(false)
const editingId = ref<string | null>(null)
const formData = reactive({
  type: 'basic' as Module['type'],
  title: '',
  content: '',
  toneHints: '',
  versionNote: '',
})

const moduleTypes = [
  { value: '', label: '全部' },
  { value: 'basic', label: '基本資訊' },
  { value: 'persona', label: '性格特徵' },
  { value: 'background', label: '背景故事' },
  { value: 'instruction', label: '指令片段' },
]

const filteredModules = computed(() => {
  if (!selectedModuleType.value) return modules
  return modules.filter(module => module.type === selectedModuleType.value)
})

const getModuleTypeLabel = (type: Module['type']) => {
  const labels = {
    basic: '基本資訊',
    persona: '性格特徵',
    background: '背景故事',
    instruction: '指令片段',
  }
  return labels[type]
}

const getModuleTypeColor = (type: Module['type']) => {
  const colors = {
    basic: 'bg-blue-100 text-blue-800',
    persona: 'bg-purple-100 text-purple-800',
    background: 'bg-green-100 text-green-800',
    instruction: 'bg-orange-100 text-orange-800',
  }
  return colors[type]
}

const getPlaceholder = (type: Module['type']) => {
  const placeholders = {
    basic: '描述角色的基本資訊，如外貌、年齡、職業等',
    persona: '描述角色的性格特徵，如個性、說話方式、行為模式等',
    background: '描述角色的背景故事，如經歷、世界觀、設定等',
    instruction: '輸入指令片段，如行為規則、對話語氣強化等',
  }
  return placeholders[type]
}

const handleCreate = () => {
  if (!formData.title.trim() || !formData.content.trim()) return

  const toneHints = formData.toneHints
    ? formData.toneHints.split(',').map(hint => hint.trim()).filter(Boolean)
    : undefined

  const title = formData.versionNote 
    ? `${formData.title} (${formData.versionNote})`
    : formData.title

  createModule({
    type: formData.type,
    title,
    content: formData.content,
    toneHints,
  })

  resetForm()
}

const handleEdit = (module: Module) => {
  editingId.value = module.id
  formData.type = module.type
  formData.title = module.title
  formData.content = module.content
  formData.toneHints = module.toneHints ? module.toneHints.join(', ') : ''
  formData.versionNote = ''
}

const handleUpdate = () => {
  if (!editingId.value || !formData.title.trim() || !formData.content.trim()) return

  const toneHints = formData.toneHints
    ? formData.toneHints.split(',').map(hint => hint.trim()).filter(Boolean)
    : undefined

  const title = formData.versionNote 
    ? `${formData.title} (${formData.versionNote})`
    : formData.title

  updateModule(editingId.value, {
    type: formData.type,
    title,
    content: formData.content,
    toneHints,
  })

  resetForm()
}

const handleDelete = (id: string) => {
  if (window.confirm('確定要刪除這個模組嗎？')) {
    deleteModule(id)
  }
}

const handleCancel = () => {
  resetForm()
}

const resetForm = () => {
  formData.type = 'basic'
  formData.title = ''
  formData.content = ''
  formData.toneHints = ''
  formData.versionNote = ''
  isCreating.value = false
  editingId.value = null
}
</script>
