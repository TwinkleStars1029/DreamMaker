<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold dreamy-text-white">✨ 角色建立</h2>
      <div class="flex space-x-3">
        <button
          v-if="!isCreatingRole"
          @click="startNewRole"
          class="dreamy-btn px-6 py-3 rounded-xl font-medium float-animation"
        >
          ✨ 新增角色
        </button>
        <button
          v-if="isCreatingRole"
          @click="saveRole"
          :disabled="!canSave"
          class="px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="canSave ? 'dreamy-btn' : 'bg-gray-400 text-white'"
        >
          💾 儲存角色
        </button>
        <button
          v-if="isCreatingRole"
          @click="previewRole"
          :disabled="!canPreview"
          class="px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="canPreview ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' : 'bg-gray-400 text-white'"
        >
          👁️ 預覽角色
        </button>
        <button
          v-if="isCreatingRole"
          @click="cancelCreateRole"
          class="px-6 py-3 rounded-xl font-medium bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
        >
          ❌ 取消
        </button>
      </div>
    </div>

    <!-- 已建立的角色列表 -->
    <div v-if="!isCreatingRole" class="space-y-6">
      <div v-if="roles.length > 0" class="dreamy-card p-6">
        <h3 class="text-xl font-semibold dreamy-text-white mb-6">🌟 已建立的角色</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="role in roles"
            :key="role.id"
            class="dreamy-card p-5 hover:scale-105 transition-all duration-300 cursor-pointer group"
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
            <div class="flex justify-end space-x-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                @click="editRole(role)"
                class="px-3 py-1.5 text-sm font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                ✏️ 編輯
              </button>
              <button
                @click="handleDeleteRole(role.id)"
                class="px-3 py-1.5 text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                🗑️ 刪除
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空狀態提示 -->
      <div v-else class="text-center py-16">
        <div class="dreamy-card p-12 max-w-md mx-auto">
          <div class="text-6xl mb-6 float-animation">✨</div>
          <h3 class="text-2xl font-bold dreamy-text-white mb-4">還沒有建立任何角色</h3>
          <p class="text-white/80 mb-6">點擊「新增角色」開始建立你的第一個 AI 角色</p>
          <button
            @click="startNewRole"
            class="dreamy-btn px-8 py-3 rounded-xl font-medium float-animation"
          >
            ✨ 開始建立
          </button>
        </div>
      </div>
    </div>

    <!-- 角色建立表單 -->
    <div v-if="isCreatingRole" class="space-y-6">
      <!-- 角色名稱輸入 -->
      <div class="dreamy-card p-6">
        <h3 class="text-xl font-semibold dreamy-text-white mb-6">🎭 角色基本資訊</h3>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium dreamy-text-white mb-2">
              ✨ 角色名稱 *
            </label>
            <input
              v-model="roleName"
              type="text"
              class="dreamy-input w-full px-4 py-3 rounded-xl"
              placeholder="例如：角色A、溫柔咖啡店老闆"
            />
          </div>
          <div>
            <label class="block text-sm font-medium dreamy-text-white mb-2">
              📝 角色描述
            </label>
            <textarea
              v-model="roleDescription"
              class="dreamy-input w-full px-4 py-3 rounded-xl resize-none"
              rows="3"
              placeholder="簡短描述這個角色的特點"
            />
          </div>
        </div>
      </div>

      <!-- 拼裝區域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左側：模組庫 -->
        <div class="space-y-6">
          <h3 class="text-xl font-semibold dreamy-text-white">🧩 選擇模組</h3>
          
          <!-- 模組類型分組 -->
          <div
            v-for="moduleType in moduleTypes"
            :key="moduleType.value"
            class="space-y-3"
          >
            <h4 class="text-lg font-medium dreamy-text-white flex items-center">
              <span class="mr-2">{{ getModuleTypeIcon(moduleType.value) }}</span>
              {{ moduleType.label }}
            </h4>
            <div class="space-y-3">
              <div
                v-for="module in getModulesByType(moduleType.value)"
                :key="module.id"
                @click="selectModule(module)"
                :class="[
                  'dreamy-card p-4 cursor-pointer transition-all duration-300 hover:scale-105',
                  selectedModules[moduleType.value]?.id === module.id
                    ? 'ring-2 ring-purple-400 bg-purple-500/20'
                    : 'hover:bg-white/10'
                ]"
              >
                <div class="flex items-start space-x-3">
                  <div
                    :class="[
                      'w-4 h-4 rounded-full mt-1 flex-shrink-0',
                      getModuleTypeColor(module.type)
                    ]"
                  />
                  <div class="flex-1 min-w-0">
                    <h5 class="text-sm font-semibold dreamy-text-white truncate">
                      {{ module.title }}
                    </h5>
                    <p class="text-xs text-white/70 line-clamp-2 mt-2">
                      {{ module.content }}
                    </p>
                    <div
                      v-if="module.toneHints && module.toneHints.length > 0"
                      class="flex flex-wrap gap-1 mt-3"
                    >
                      <span
                        v-for="(hint, index) in module.toneHints"
                        :key="index"
                        class="dreamy-tag text-xs"
                      >
                        {{ hint }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側：拼裝結果 -->
        <div class="space-y-6">
          <h3 class="text-xl font-semibold dreamy-text-white">🔮 角色預覽</h3>
          
          <!-- 拼裝配置 -->
          <div class="dreamy-card p-6">
            <h4 class="text-lg font-medium dreamy-text-white mb-4 flex items-center">
              <span class="mr-2">⚙️</span>
              當前配置
            </h4>
            <div class="space-y-4">
              <div v-if="selectedModules.basic" class="p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">👤 基本資訊</h5>
                <p class="text-sm text-white/80">{{ selectedModules.basic.content }}</p>
              </div>
              <div v-if="selectedModules.persona" class="p-4 bg-purple-500/10 rounded-xl border border-purple-400/30">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">💫 性格特徵</h5>
                <p class="text-sm text-white/80 mb-3">{{ selectedModules.persona.content }}</p>
                <div v-if="selectedModules.persona.toneHints && selectedModules.persona.toneHints.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(hint, index) in selectedModules.persona.toneHints"
                    :key="index"
                    class="dreamy-tag text-xs"
                  >
                    {{ hint }}
                  </span>
                </div>
              </div>
              <div v-if="selectedModules.background" class="p-4 bg-green-500/10 rounded-xl border border-green-400/30">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">📚 背景故事</h5>
                <p class="text-sm text-white/80">{{ selectedModules.background.content }}</p>
              </div>
              <div v-if="selectedModules.instruction" class="p-4 bg-orange-500/10 rounded-xl border border-orange-400/30">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">🎯 指令片段</h5>
                <p class="text-sm text-white/80">{{ selectedModules.instruction.content }}</p>
              </div>
            </div>
          </div>

          <!-- 拼裝預覽 -->
          <div v-if="canPreview" class="dreamy-card p-6">
            <h4 class="text-lg font-medium dreamy-text-white mb-4 flex items-center">
              <span class="mr-2">✨</span>
              角色預覽
            </h4>
            <div class="space-y-4">
              <div v-if="selectedModules.basic" class="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">👤 基本資訊</h5>
                <p class="text-sm text-white/90">{{ selectedModules.basic.content }}</p>
              </div>
              <div v-if="selectedModules.persona" class="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">💫 性格特徵</h5>
                <p class="text-sm text-white/90 mb-3">{{ selectedModules.persona.content }}</p>
                <div v-if="selectedModules.persona.toneHints && selectedModules.persona.toneHints.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(hint, index) in selectedModules.persona.toneHints"
                    :key="index"
                    class="dreamy-tag text-xs"
                  >
                    {{ hint }}
                  </span>
                </div>
              </div>
              <div v-if="selectedModules.background" class="p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">📚 背景故事</h5>
                <p class="text-sm text-white/90">{{ selectedModules.background.content }}</p>
              </div>
              <div v-if="selectedModules.instruction" class="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl">
                <h5 class="text-sm font-semibold dreamy-text-white mb-2">🎯 指令片段</h5>
                <p class="text-sm text-white/90">{{ selectedModules.instruction.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Module, Role } from '../types'

const store = useAppStore()
const { modules, roles, createRole, updateRole, deleteRole } = store

const isCreatingRole = ref(false)
const roleName = ref('')
const roleDescription = ref('')
const selectedModules = reactive<Record<string, Module | null>>({
  basic: null,
  persona: null,
  background: null,
  instruction: null,
})

const moduleTypes = [
  { value: 'basic', label: '基本資訊' },
  { value: 'persona', label: '性格特徵' },
  { value: 'background', label: '背景故事' },
  { value: 'instruction', label: '指令片段' },
]

const canSave = computed(() => {
  return roleName.value.trim() && Object.values(selectedModules).some(module => module !== null)
})

const canPreview = computed(() => {
  return Object.values(selectedModules).some(module => module !== null)
})

const getModulesByType = (type: string) => {
  return modules.filter(module => module.type === type)
}

const getModuleTypeColor = (type: string) => {
  const colors = {
    basic: 'bg-blue-500',
    persona: 'bg-purple-500',
    background: 'bg-green-500',
    instruction: 'bg-orange-500',
  }
  return colors[type as keyof typeof colors] || 'bg-gray-500'
}

const getModuleTypeIcon = (type: string) => {
  const icons = {
    basic: '👤',
    persona: '💫',
    background: '📚',
    instruction: '🎯',
  }
  return icons[type as keyof typeof icons] || '📝'
}

const startNewRole = () => {
  isCreatingRole.value = true
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(type => {
    selectedModules[type] = null
  })
}

const selectModule = (module: Module) => {
  selectedModules[module.type] = module
}

const previewRole = () => {
  // 預覽功能已在模板中實作
  console.log('預覽角色')
}

const saveRole = () => {
  if (!canSave.value) return

  const moduleIds = Object.values(selectedModules)
    .filter(module => module !== null)
    .map(module => module!.id)

  // 從選中的模組生成標籤
  const tags = Object.values(selectedModules)
    .filter(module => module !== null)
    .map(module => module!.type)

  createRole({
    name: roleName.value,
    description: roleDescription.value || '由模組拼裝而成的角色',
    tags,
    // 將模組 ID 儲存在 notes 中
    notes: `模組拼裝: ${moduleIds.join(',')}`,
  })

  // 重置表單
  isCreatingRole.value = false
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(type => {
    selectedModules[type] = null
  })
}

const editRole = (role: Role) => {
  // 載入角色到編輯模式
  isCreatingRole.value = true
  roleName.value = role.name
  roleDescription.value = role.description
  
  // 清空當前選擇
  Object.keys(selectedModules).forEach(type => {
    selectedModules[type] = null
  })

  // 如果有模組 ID 資訊，載入對應模組
  if (role.notes && role.notes.includes('模組拼裝:')) {
    const moduleIds = role.notes.split('模組拼裝: ')[1]?.split(',') || []
    moduleIds.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        selectedModules[module.type] = module
      }
    })
  }
}

const handleDeleteRole = (id: string) => {
  if (window.confirm('確定要刪除這個角色嗎？')) {
    deleteRole(id)
  }
}

const cancelCreateRole = () => {
  isCreatingRole.value = false
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(type => {
    selectedModules[type] = null
  })
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