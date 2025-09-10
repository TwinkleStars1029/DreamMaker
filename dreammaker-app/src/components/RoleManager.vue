<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">角色管理</h2>
      <button
        @click="isCreating = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        新增角色
      </button>
    </div>

    <!-- 建立/編輯表單 -->
    <div v-if="isCreating || editingId" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">
        {{ editingId ? '編輯角色' : '新增角色' }}
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            角色名稱 *
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="輸入角色名稱"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            角色描述
          </label>
          <textarea
            v-model="formData.description"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="描述角色的背景、性格等"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            頭像網址
          </label>
          <input
            v-model="formData.avatarUrl"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            標籤
          </label>
          <input
            v-model="formData.tags"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="用逗號分隔多個標籤，例如：溫柔, 聰明, 神秘"
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

    <!-- 角色列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        :class="[
          'bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer',
          currentRoleId === role.id ? 'ring-2 ring-blue-500' : ''
        ]"
        @click="setCurrentRole(role.id)"
      >
        <div class="flex items-start space-x-4">
          <img
            v-if="role.avatarUrl"
            :src="role.avatarUrl"
            :alt="role.name"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div
            v-else
            class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <span class="text-gray-600 font-semibold">
              {{ role.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 truncate">
              {{ role.name }}
            </h3>
            <p class="text-gray-600 text-sm mt-1 line-clamp-2">
              {{ role.description }}
            </p>
            <div v-if="role.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="(tag, index) in role.tags"
                :key="index"
                class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click.stop="handleEdit(role)"
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            編輯
          </button>
          <button
            @click.stop="handleDelete(role.id)"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            刪除
          </button>
        </div>
      </div>
    </div>

    <div v-if="roles.length === 0" class="text-center py-12">
      <p class="text-gray-500">還沒有任何角色，點擊「新增角色」開始建立吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Role } from '../types'

const store = useAppStore()
const { roles, currentRoleId, createRole, updateRole, deleteRole, setCurrentRole } = store

const isCreating = ref(false)
const editingId = ref<string | null>(null)
const formData = reactive({
  name: '',
  description: '',
  avatarUrl: '',
  tags: '',
})

const handleCreate = () => {
  if (!formData.name.trim()) return

  const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
  
  createRole({
    name: formData.name,
    description: formData.description,
    avatarUrl: formData.avatarUrl || undefined,
    tags,
  })

  resetForm()
}

const handleEdit = (role: Role) => {
  editingId.value = role.id
  formData.name = role.name
  formData.description = role.description
  formData.avatarUrl = role.avatarUrl || ''
  formData.tags = role.tags.join(', ')
}

const handleUpdate = () => {
  if (!editingId.value || !formData.name.trim()) return

  const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
  
  updateRole(editingId.value, {
    name: formData.name,
    description: formData.description,
    avatarUrl: formData.avatarUrl || undefined,
    tags,
  })

  resetForm()
}

const handleDelete = (id: string) => {
  if (window.confirm('確定要刪除這個角色嗎？')) {
    deleteRole(id)
    if (currentRoleId === id) {
      setCurrentRole(undefined)
    }
  }
}

const handleCancel = () => {
  resetForm()
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.avatarUrl = ''
  formData.tags = ''
  isCreating.value = false
  editingId.value = null
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
