<template>
  <div class="role-assembler">
    <!-- 頁面標題與新增按鈕 -->
    <header class="page-header">
      <h1 class="page-title">角色管理</h1>
      <button
        type="button"
        @click="startCreate"
        class="btn btn-primary floating pulse-soft"
        :disabled="submitting"
        aria-label="新增角色"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        新增角色
      </button>
    </header>

    <!-- 建立/編輯表單 -->
    <section 
      v-if="isCreating || editingId" 
      class="modern-card glass form-card"
      role="form"
      :aria-label="editingId ? '編輯角色' : '新增角色'"
    >
      <div class="form-header">
        <h2 class="form-title">{{ editingId ? '編輯角色' : '新增角色' }}</h2>
        <div class="form-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      </div>

      <form class="form-content" @submit.prevent="submit" novalidate>
        <div class="form-group">
          <label for="role-name" class="form-label">角色名稱 *</label>
          <input
            id="role-name"
            v-model.trim="formData.name"
            type="text"
            class="input"
            :class="{ 'input-error': errors.name }"
            placeholder="輸入角色名稱"
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'name-error' : undefined"
            maxlength="50"
            required
            @blur="validateName"
            @input="clearError('name')"
          />
          <div v-if="errors.name" id="name-error" class="error-message" role="alert">
            {{ errors.name }}
          </div>
        </div>

        <div class="form-group">
          <label for="role-description" class="form-label">角色描述</label>
          <textarea
            id="role-description"
            v-model.trim="formData.description"
            class="input textarea"
            :class="{ 'input-error': errors.description }"
            rows="3"
            placeholder="描述角色的背景、性格等"
            maxlength="500"
            :aria-describedby="errors.description ? 'description-error' : undefined"
            @blur="validateDescription"
            @input="clearError('description')"
          />
          <div v-if="errors.description" id="description-error" class="error-message" role="alert">
            {{ errors.description }}
          </div>
          <div class="character-count">{{ formData.description.length }}/500</div>
        </div>

        <div class="form-group">
          <label for="role-avatar" class="form-label">頭像網址</label>
          <input
            id="role-avatar"
            v-model.trim="formData.avatarUrl"
            type="url"
            class="input"
            :class="{ 'input-error': errors.avatarUrl }"
            placeholder="https://example.com/avatar.jpg"
            :aria-describedby="errors.avatarUrl ? 'avatar-error' : undefined"
            @blur="validateAvatarUrl"
            @input="clearError('avatarUrl')"
          />
          <div v-if="errors.avatarUrl" id="avatar-error" class="error-message" role="alert">
            {{ errors.avatarUrl }}
          </div>
          <!-- 頭像預覽 -->
          <div v-if="formData.avatarUrl && !errors.avatarUrl" class="avatar-preview">
            <img 
              :src="formData.avatarUrl" 
              alt="頭像預覽" 
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="role-tags" class="form-label">標籤</label>
          <input
            id="role-tags"
            v-model="formData.tags"
            type="text"
            class="input"
            placeholder="用逗號分隔：溫柔, 聰明, 神秘（支援全形，會自動去重）"
            @blur="validateTags"
          />
          <div v-if="parsedTags.length > 0" class="tags-preview">
            <span v-for="tag in parsedTags" :key="tag" class="tag tag-primary">
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting || !isFormValid"
            :aria-describedby="submitting ? 'submit-status' : undefined"
          >
            <span v-if="submitting" class="spinner mr-2" aria-hidden="true"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ editingId ? '更新' : '建立' }}
          </button>

          <button 
            type="button" 
            @click="handleCancel" 
            class="btn btn-ghost"
            :disabled="submitting"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            取消
          </button>
        </div>
        
        <div v-if="submitting" id="submit-status" class="sr-only" aria-live="polite">
          正在{{ editingId ? '更新' : '建立' }}角色...
        </div>
      </form>
    </section>

    <!-- 搜尋和篩選 -->
    <div v-if="roles.length > 0" class="search-section">
      <div class="search-group">
        <label for="search-input" class="sr-only">搜尋角色</label>
        <div class="search-input-wrapper">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            id="search-input"
            v-model="searchQuery"
            type="text"
            class="input search-input"
            placeholder="搜尋角色名稱或描述..."
          />
          <button 
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="search-clear"
            aria-label="清除搜尋"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <main class="roles-content">
      <div 
        v-if="filteredRoles.length > 0" 
        class="roles-grid"
        role="grid"
        :aria-label="`共 ${filteredRoles.length} 個角色`"
      >
        <article
          v-for="(role, index) in filteredRoles"
          :key="role.id"
          :class="['modern-card role-card', currentRoleId === role.id ? 'role-card-selected' : '']"
          role="gridcell"
          :aria-posinset="index + 1"
          :aria-setsize="filteredRoles.length"
          :aria-selected="currentRoleId === role.id"
          :tabindex="currentRoleId === role.id ? 0 : -1"
          @click="setCurrentRole(role.id)"
          @keydown="handleRoleCardKeydown($event, role.id)"
        >
          <div class="role-card-content">
            <div class="role-avatar-section">
              <div class="role-avatar-container">
                <img
                  v-if="role.avatarUrl"
                  :src="role.avatarUrl"
                  :alt="`${role.name} 的頭像`"
                  class="role-avatar-image"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="handleAvatarError"
                />
                <div v-else class="role-avatar-placeholder" :aria-label="`${role.name} 的頭像（預設）`">
                  <span class="role-avatar-text">{{ getAvatarText(role.name) }}</span>
                </div>
              </div>

              <div class="role-info">
                <h3 class="role-name">{{ role.name }}</h3>
                <p v-if="role.description" class="role-description">{{ role.description }}</p>
              </div>
            </div>

            <div v-if="role.tags && role.tags.length > 0" class="role-tags">
              <span v-for="tag in role.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
            </div>
          </div>

          <div class="role-actions">
            <button 
              type="button" 
              @click.stop="handleEdit(role)" 
              class="action-btn action-btn-edit" 
              :aria-label="`編輯 ${role.name}`"
              :disabled="submitting"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              編輯
            </button>

            <button
              type="button"
              @click.stop="confirmDelete(role)"
              class="action-btn action-btn-delete"
              :aria-label="`刪除 ${role.name}`"
              :disabled="submitting"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              刪除
            </button>
          </div>
        </article>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="roles.length === 0" class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon" aria-hidden="true">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p class="empty-state-text">還沒有任何角色</p>
          <p class="empty-state-subtext">點擊「新增角色」開始建立吧！</p>
          <button type="button" @click="startCreate" class="btn btn-primary shimmer-soft">
            開始建立
          </button>
        </div>
      </div>

      <!-- 搜尋無結果 -->
      <div v-else class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon" aria-hidden="true">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <p class="empty-state-text">找不到符合條件的角色</p>
          <p class="empty-state-subtext">試試調整搜尋條件或建立新角色</p>
          <div class="empty-state-actions">
            <button type="button" @click="searchQuery = ''" class="btn btn-ghost">
              清除搜尋
            </button>
            <button type="button" @click="startCreate" class="btn btn-primary">
              建立角色
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 刪除確認對話框 -->
    <div v-if="deleteConfirm.show" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-dialog" role="dialog" aria-modal="true" :aria-labelledby="deleteConfirm.role ? `delete-title-${deleteConfirm.role.id}` : undefined">
        <div class="modal-header">
          <h3 :id="deleteConfirm.role ? `delete-title-${deleteConfirm.role.id}` : undefined" class="modal-title">
            刪除角色確認
          </h3>
        </div>
        <div class="modal-body">
          <p>確定要刪除角色「<strong>{{ deleteConfirm.role?.name }}</strong>」嗎？</p>
          <p class="modal-warning">此操作無法復原。</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="executeDelete" class="btn btn-danger" :disabled="submitting">
            <span v-if="submitting" class="spinner mr-2" aria-hidden="true"></span>
            確定刪除
          </button>
          <button type="button" @click="cancelDelete" class="btn btn-ghost" :disabled="submitting">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]" role="alert" aria-live="polite">
      <div class="toast-content">
        <svg v-if="toast.type === 'success'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else-if="toast.type === 'error'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
      <button type="button" @click="hideToast" class="toast-close" aria-label="關閉通知">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Role } from '../types'

const store = useAppStore()
const { roles, currentRoleId, createRole, updateRole, deleteRole, setCurrentRole } = store

// 狀態管理
const isCreating = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const searchQuery = ref('')

// 表單數據和驗證
const formData = reactive({
  name: '',
  description: '',
  avatarUrl: '',
  tags: '',
})

const errors = reactive<{
  name?: string
  description?: string
  avatarUrl?: string
}>({})

// 刪除確認對話框
const deleteConfirm = reactive<{
  show: boolean
  role: Role | null
}>({
  show: false,
  role: null,
})

// Toast 通知
const toast = reactive<{
  show: boolean
  type: 'success' | 'error' | 'info'
  message: string
}>({
  show: false,
  type: 'success',
  message: '',
})

// 計算屬性
const parsedTags = computed(() => parseTags(formData.tags))

const isFormValid = computed(() => {
  return formData.name.trim() && 
         !errors.name && 
         !errors.description && 
         !errors.avatarUrl
})

const filteredRoles = computed(() => {
  if (!searchQuery.value.trim()) {
    return roles
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return roles.filter(role => 
    role.name?.toLowerCase().includes(query) ||
    role.description?.toLowerCase().includes(query) ||
    role.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

// 工具函數
function parseTags(input: string): string[] {
  if (!input.trim()) return []
  
  return Array.from(
    new Set(
      input
        .split(/[,，]/g)
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 10) // 限制標籤數量
    )
  )
}

function getAvatarText(name?: string): string {
  return name?.charAt(0)?.toUpperCase() || '?'
}

// 驗證函數
function validateName() {
  const name = formData.name.trim()
  if (!name) {
    errors.name = '請輸入角色名稱'
  } else if (name.length < 2) {
    errors.name = '角色名稱至少需要2個字符'
  } else if (name.length > 50) {
    errors.name = '角色名稱不能超過50個字符'
  } else {
    // 檢查是否重複（編輯時排除自己）
    const isDuplicate = roles.some(role => 
      role.name === name && role.id !== editingId.value
    )
    if (isDuplicate) {
      errors.name = '角色名稱已存在'
    }
  }
}

function validateDescription() {
  const desc = formData.description.trim()
  if (desc.length > 500) {
    errors.description = '角色描述不能超過500個字符'
  }
}

function validateAvatarUrl() {
  const url = formData.avatarUrl.trim()
  if (url && !isValidUrl(url)) {
    errors.avatarUrl = '請輸入有效的網址'
  }
}

function validateTags() {
  const tags = parsedTags.value
  if (tags.length > 10) {
    showToast('標籤數量不能超過10個', 'error')
    // 截斷到前10個
    formData.tags = tags.slice(0, 10).join(', ')
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function clearError(field: keyof typeof errors) {
  if (errors[field]) {
    errors[field] = undefined
  }
}

// 圖片處理
function handleImageError() {
  errors.avatarUrl = '圖片載入失敗，請檢查網址'
}

function handleImageLoad() {
  if (errors.avatarUrl === '圖片載入失敗，請檢查網址') {
    errors.avatarUrl = undefined
  }
}

function handleAvatarError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 表單操作
function startCreate() {
  isCreating.value = true
  editingId.value = null
  resetErrors()
}

async function submit() {
  // 驗證所有字段
  validateName()
  validateDescription()
  validateAvatarUrl()
  
  if (!isFormValid.value) {
    showToast('請修正表單錯誤', 'error')
    return
  }

  if (editingId.value) {
    await handleUpdate()
  } else {
    await handleCreate()
  }
}

async function handleCreate() {
  if (!formData.name.trim()) return
  
  submitting.value = true
  try {
    const tags = parsedTags.value
    createRole({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      avatarUrl: formData.avatarUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })
    
    showToast('角色建立成功', 'success')
    resetForm()
  } catch (error) {
    showToast('建立角色時發生錯誤', 'error')
    console.error('Create role error:', error)
  } finally {
    submitting.value = false
  }
}

function handleEdit(role: Role) {
  editingId.value = role.id
  isCreating.value = false  // 修復：編輯時不應該設為 true
  formData.name = role.name ?? ''
  formData.description = role.description ?? ''
  formData.avatarUrl = role.avatarUrl ?? ''
  formData.tags = (role.tags ?? []).join(', ')
  resetErrors()
  
  // 滾動到表單
  nextTick(() => {
    const formElement = document.querySelector('.form-card')
    formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

async function handleUpdate() {
  if (!editingId.value || !formData.name.trim()) return
  
  submitting.value = true
  try {
    const tags = parsedTags.value
    updateRole(editingId.value, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      avatarUrl: formData.avatarUrl.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })
    
    showToast('角色更新成功', 'success')
    resetForm()
  } catch (error) {
    showToast('更新角色時發生錯誤', 'error')
    console.error('Update role error:', error)
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  resetForm()
}

function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.avatarUrl = ''
  formData.tags = ''
  isCreating.value = false
  editingId.value = null
  resetErrors()
}

function resetErrors() {
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof typeof errors]
  })
}

// 刪除操作
function confirmDelete(role: Role) {
  deleteConfirm.show = true
  deleteConfirm.role = role
}

async function executeDelete() {
  if (!deleteConfirm.role) return
  
  submitting.value = true
  try {
    const roleId = deleteConfirm.role.id
    const roleName = deleteConfirm.role.name
    
    // 先更新當前選中的角色
    if (currentRoleId === roleId) {
      const remainingRoles = roles.filter(r => r.id !== roleId)
      if (remainingRoles.length > 0) {
        setCurrentRole(remainingRoles[0].id)
      } else {
        // 安全地清除選中狀態
        setCurrentRole('')
      }
    }
    
    // 然後刪除角色
    deleteRole(roleId)
    
    // 強制觸發響應式更新
    await nextTick()
    
    showToast(`已刪除角色「${roleName}」`, 'success')
    cancelDelete()
  } catch (error) {
    showToast('刪除角色時發生錯誤', 'error')
    console.error('Delete role error:', error)
  } finally {
    submitting.value = false
  }
}

function cancelDelete() {
  deleteConfirm.show = false
  deleteConfirm.role = null
}

// 鍵盤導航
function handleRoleCardKeydown(event: KeyboardEvent, roleId: string) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      setCurrentRole(roleId)
      break
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      focusNextRole(roleId)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      focusPreviousRole(roleId)
      break
  }
}

function focusNextRole(currentId: string) {
  const currentIndex = filteredRoles.value.findIndex(role => role.id === currentId)
  const nextIndex = (currentIndex + 1) % filteredRoles.value.length
  const nextRole = filteredRoles.value[nextIndex]
  if (nextRole) {
    setCurrentRole(nextRole.id)
    focusRoleCard(nextRole.id)
  }
}

function focusPreviousRole(currentId: string) {
  const currentIndex = filteredRoles.value.findIndex(role => role.id === currentId)
  const prevIndex = currentIndex === 0 ? filteredRoles.value.length - 1 : currentIndex - 1
  const prevRole = filteredRoles.value[prevIndex]
  if (prevRole) {
    setCurrentRole(prevRole.id)
    focusRoleCard(prevRole.id)
  }
}

function focusRoleCard(roleId: string) {
  nextTick(() => {
    const cards = document.querySelectorAll('.role-card')
    const roleIndex = filteredRoles.value.findIndex(r => r.id === roleId)
    const targetCard = cards[roleIndex] as HTMLElement
    if (targetCard) {
      targetCard.focus()
    }
  })
}

// Toast 通知
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.message = message
  toast.type = type
  toast.show = true
  
  // 自動隱藏
  setTimeout(() => {
    hideToast()
  }, 3000)
}

function hideToast() {
  toast.show = false
}

// 監聽搜尋變化時重置焦點
watch(searchQuery, () => {
  if (filteredRoles.value.length > 0 && currentRoleId) {
    const isCurrentRoleVisible = filteredRoles.value.some(role => role.id === currentRoleId)
    if (!isCurrentRoleVisible) {
      setCurrentRole(filteredRoles.value[0].id)
    }
  }
})

// 組件掛載時的焦點管理
watch(() => isCreating.value, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const nameInput = document.getElementById('role-name')
      nameInput?.focus()
    })
  }
})
</script>

<style scoped>
/* 基礎變數繼承原有設計 */
.role-assembler { 
  padding: var(--spacing-lg); 
  max-width: 1200px; 
  margin: 0 auto; 
}

/* 頁面標題 */
.page-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: var(--spacing-xl); 
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.page-title {
  font-size: 2rem; 
  font-weight: 700; 
  margin: 0;
  color: var(--text-color);
  background: var(--gradient-warm); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  background-clip: text;
}

/* 表單樣式 */
.form-card { 
  overflow: hidden; 
  animation: fadeIn 0.5s ease-out; 
  margin-bottom: var(--spacing-xl);
}

.form-header {
  background: var(--gradient-soft); 
  padding: var(--spacing-lg);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}

.form-title { 
  font-size: 1.25rem; 
  font-weight: 600; 
  margin: 0; 
  color: var(--text-color); 
}

.form-icon { 
  color: var(--button-bg-color); 
  opacity: 0.85; 
}

.form-content { 
  padding: var(--spacing-xl); 
}

.form-group { 
  margin-bottom: var(--spacing-lg); 
}

.form-label { 
  display: block; 
  font-size: 0.875rem; 
  font-weight: 500; 
  margin-bottom: var(--spacing-sm); 
  color: var(--text-color); 
}

.input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--surface-input);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--button-bg-color);
  box-shadow: 0 0 0 3px rgba(242, 170, 132, 0.15);
}

.input-error {
  border-color: #e05252;
  box-shadow: 0 0 0 3px rgba(224, 82, 82, 0.15);
}

.textarea { 
  resize: vertical; 
  min-height: 80px; 
  font-family: inherit;
}

.error-message {
  color: #e05252;
  font-size: 0.75rem;
  margin-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.character-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--subtext-color);
  margin-top: var(--spacing-xs);
}

.avatar-preview {
  margin-top: var(--spacing-sm);
}

.avatar-preview img {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
}

.tags-preview {
  margin-top: var(--spacing-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.form-actions {
  display: flex; 
  gap: var(--spacing-md); 
  margin-top: var(--spacing-xl); 
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* 搜尋區域 */
.search-section {
  margin-bottom: var(--spacing-lg);
}

.search-group {
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  width: 1rem;
  height: 1rem;
  color: var(--subtext-color);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.search-clear {
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--subtext-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.search-clear:hover {
  color: var(--text-color);
  background: var(--surface-hover);
}

/* 角色列表 */
.roles-content {
  min-height: 400px;
}

.roles-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg); 
  margin-bottom: var(--spacing-xl);
}

.role-card { 
  cursor: pointer; 
  position: relative; 
  overflow: hidden; 
  animation: slideUp 0.6s ease-out both;
  transition: all var(--transition-fast);
}

.role-card::before {
  content: ''; 
  position: absolute; 
  inset: 0; 
  left: -100%; 
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.6s;
}

.role-card:hover::before { 
  left: 100%; 
}

.role-card:hover { 
  transform: translateY(-4px); 
  box-shadow: var(--shadow-lg); 
  border-color: var(--border-accent); 
}

.role-card:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(242, 170, 132, 0.25);
}

.role-card-selected { 
  border-color: var(--button-bg-color); 
  box-shadow: 0 0 0 3px rgba(242,170,132,0.15); 
  background: var(--gradient-soft); 
}

.role-card-content { 
  padding: var(--spacing-lg); 
}

.role-avatar-section { 
  display: flex; 
  align-items: flex-start; 
  gap: var(--spacing-md); 
  margin-bottom: var(--spacing-md); 
}

.role-avatar-container { 
  flex-shrink: 0; 
}

.role-avatar-image {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover; 
  border: 2px solid var(--border-light); 
  transition: all var(--transition-fast);
}

.role-avatar-image:hover { 
  transform: scale(1.05); 
  border-color: var(--button-bg-color); 
}

.role-avatar-placeholder {
  width: 3rem;
  height: 3rem;
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: var(--gradient-button); 
  transition: all var(--transition-fast);
}

.role-avatar-placeholder:hover { 
  transform: scale(1.05); 
  box-shadow: var(--shadow-md); 
}

.role-avatar-text { 
  color: var(--button-text-color); 
  font-weight: 600; 
  font-size: 1.125rem; 
}

.role-info { 
  flex: 1; 
  min-width: 0; 
}

.role-name { 
  font-size: 1.125rem; 
  font-weight: 600; 
  margin: 0 0 var(--spacing-xs) 0; 
  color: var(--text-color); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.role-description {
  color: var(--subtext-color); 
  font-size: 0.875rem; 
  line-height: 1.4; 
  margin: 0;
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden;
}

.role-tags { 
  display: flex; 
  flex-wrap: wrap; 
  gap: var(--spacing-xs); 
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--gradient-primary);
  color: var(--text-color);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
}

.tag-primary {
  background: var(--gradient-button);
  color: var(--button-text-color);
}

.role-actions {
  display: flex; 
  justify-content: flex-end; 
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--surface-glass); 
  border-top: 1px solid var(--border-light);
}

.action-btn {
  display: inline-flex; 
  align-items: center; 
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none; 
  border-radius: var(--radius-md);
  font-size: 0.875rem; 
  font-weight: 500; 
  cursor: pointer; 
  transition: all var(--transition-fast);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-edit { 
  background: var(--gradient-primary); 
  color: var(--text-color); 
}

.action-btn-edit:hover:not(:disabled) { 
  background: var(--gradient-soft); 
  transform: translateY(-1px); 
  box-shadow: var(--shadow-sm); 
}

.action-btn-delete { 
  background: transparent; 
  color: #dc2626; 
  border: 1px solid #dc2626; 
}

.action-btn-delete:hover:not(:disabled) { 
  background: #dc2626; 
  color: white; 
  transform: translateY(-1px); 
  box-shadow: 0 4px 14px 0 rgba(220,38,38,0.25); 
}

/* 空狀態 */
.empty-state { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 400px; 
  padding: var(--spacing-xl); 
}

.empty-state-card {
  background: var(--surface-card); 
  backdrop-filter: blur(15px); 
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl); 
  box-shadow: var(--shadow-lg); 
  padding: 3rem; 
  text-align: center; 
  max-width: 400px; 
  width: 100%;
  transition: all var(--transition-normal);
}

.empty-state-card:hover { 
  transform: translateY(-4px); 
  box-shadow: var(--shadow-xl); 
  border-color: var(--border-accent); 
}

.empty-state-icon { 
  color: var(--subtext-color); 
  margin-bottom: var(--spacing-lg); 
  opacity: 0.6; 
}

.empty-state-text { 
  font-size: 1.25rem; 
  font-weight: 600; 
  color: var(--text-color); 
  margin: 0 0 var(--spacing-sm) 0; 
}

.empty-state-subtext { 
  color: var(--subtext-color); 
  margin: 0 0 var(--spacing-xl) 0; 
  font-size: 0.9375rem; 
}

.empty-state-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gradient-button);
  color: var(--button-text-color);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-ghost {
  background: transparent;
  color: var(--subtext-color);
  border: 1px solid var(--border-light);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text-color);
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px 0 rgba(220,38,38,0.25);
}

.floating {
  box-shadow: var(--shadow-lg);
}

.pulse-soft {
  animation: pulse-soft 2s infinite;
}

.shimmer-soft {
  background: linear-gradient(45deg, var(--gradient-button), var(--gradient-soft));
  background-size: 200% 200%;
  animation: shimmer 2s infinite;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-dialog {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-warning {
  color: var(--subtext-color);
  font-size: 0.875rem;
  margin-top: var(--spacing-sm);
}

.modal-actions {
  padding: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  border-top: 1px solid var(--border-light);
}

/* Toast */
.toast {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  z-index: 1001;
  animation: toastSlideIn 0.3s ease-out;
  max-width: 400px;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-info {
  border-left: 4px solid var(--button-bg-color);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.toast-close {
  background: none;
  border: none;
  color: var(--subtext-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.toast-close:hover {
  color: var(--text-color);
  background: var(--surface-hover);
}

/* 輔助樣式 */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 動畫 */
@keyframes slideUp { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}

@keyframes fadeIn { 
  from { opacity: 0; transform: scale(0.95); } 
  to { opacity: 1; transform: scale(1); } 
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .role-assembler { 
    padding: var(--spacing-md); 
  }
  
  .page-header { 
    flex-direction: column; 
    gap: var(--spacing-md); 
    text-align: center; 
  }
  
  .page-title { 
    font-size: 1.75rem; 
  }
  
  .form-content { 
    padding: var(--spacing-lg); 
  }
  
  .form-actions { 
    flex-direction: column; 
  }
  
  .roles-grid { 
    grid-template-columns: 1fr; 
    gap: var(--spacing-md); 
  }
  
  .role-avatar-section { 
    flex-direction: column; 
    align-items: center; 
    text-align: center; 
  }
  
  .role-actions { 
    justify-content: center; 
  }
  
  .empty-state-card { 
    padding: 2rem; 
  }

  .modal-dialog {
    width: 95%;
  }

  .toast {
    left: var(--spacing-md);
    right: var(--spacing-md);
    max-width: none;
  }

  .empty-state-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title { 
    font-size: 1.5rem; 
  }
  
  .role-card-content { 
    padding: var(--spacing-md); 
  }
  
  .empty-state-card { 
    padding: 1.5rem; 
  }

  .search-section {
    margin-left: calc(-1 * var(--spacing-md));
    margin-right: calc(-1 * var(--spacing-md));
    padding: 0 var(--spacing-md);
  }

  .search-group {
    max-width: none;
  }
}

/* 高對比度支持 */
@media (prefers-contrast: high) {
  .role-card {
    border-width: 2px;
  }
  
  .btn {
    border-width: 2px;
  }
  
  .input {
    border-width: 2px;
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>