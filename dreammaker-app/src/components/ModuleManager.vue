<template>
  <div class="module-manager space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">模組管理</h2>
      <div class="flex gap-2">
        <select v-model="selectedModuleType" class="input w-56">
          <option value="">選擇模組類型</option>
          <option value="basic">基本資訊</option>
          <option value="persona">性格特徵</option>
          <option value="background">背景故事</option>
          <option value="instruction">指令片段</option>
        </select>
        <button @click="isCreating = true" type="button" class="btn btn-primary floating pulse-soft">
          新增模組
        </button>
      </div>
    </div>

    <!-- 快速篩選 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="type in moduleTypes"
        :key="type.value || 'all'"
        type="button"
        @click="selectedModuleType = type.value"
        :class="[
          'btn','btn-sm',
          selectedModuleType === type.value ? 'btn-secondary' : 'btn-ghost'
        ]"
      >
        {{ type.label }}
      </button>

    </div>

    <!-- 建立/編輯表單 -->
    <section v-if="isCreating || editingId" class="modern-card">
      <div class="form-header">
        <h3 class="form-title">{{ editingId ? '編輯模組' : '新增模組' }}</h3>
      </div>

      <div class="form-content">
        <div class="form-row">
          <label class="form-label">模組類型 *</label>
          <select v-model="formData.type" class="input w-full">
            <option value="basic">基本資訊</option>
            <option value="persona">性格特徵</option>
            <option value="background">背景故事</option>
            <option value="instruction">指令片段</option>
          </select>
        </div>

        <div class="form-row">
          <label class="form-label">模組標題 *</label>
          <input
            v-model.trim="formData.title"
            type="text"
            class="input"
            placeholder="輸入模組標題"
            @keyup.enter="submit"
          />
        </div>

        <div class="form-row">
          <label class="form-label">模組內容 *</label>
          <textarea
            v-model.trim="formData.content"
            class="input textarea"
            rows="4"
            :placeholder="getPlaceholder(formData.type)"
          />
        </div>

        <div class="form-row" v-if="formData.type === 'persona'">
          <label class="form-label">語氣提示</label>
          <input
            v-model="formData.toneHints"
            type="text"
            class="input"
            placeholder="用逗號分隔，例如：溫柔, 抒情, 文學感"
          />
        </div>

        <div class="form-row">
          <label class="form-label">版本描述</label>
          <input
            v-model="formData.versionNote"
            type="text"
            class="input"
            placeholder="例如：溫柔版 v1、冷酷版 v2"
            @keyup.enter="submit"
          />
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-primary"
            @click="submit"
            :disabled="!formData.title.trim() || !formData.content.trim()"
          >
            {{ editingId ? '更新' : '建立' }}
          </button>
          <button type="button" class="btn btn-ghost" @click="handleCancel">取消</button>
        </div>
      </div>
    </section>

    <!-- 模組列表 -->
    <div class="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="module in filteredModules"
        :key="module.id"
        class="item-card"
      >
        <header class="mb-3 flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span class="tag" :class="typeTone(module.type)">{{ getModuleTypeLabel(module.type) }}</span>
            <h3 class="text-base font-semibold text-primary-900 role-name">
              {{ module.title }}
            </h3>
          </div>
          <div class="flex gap-2">
            <button type="button" class="action-btn action-btn-edit" @click="handleEdit(module)">編輯</button>
            <button type="button" class="action-btn action-btn-delete" @click="handleDelete(module.id)">刪除</button>
          </div>
        </header>

        <p class="text-sm text-body whitespace-pre-wrap role-description">
          {{ module.content }}
        </p>

        <div v-if="module.toneHints?.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="(hint, i) in module.toneHints" :key="i" class="tag tag-primary">{{ hint }}</span>
        </div>
      </article>
    </div>

    <!-- 空狀態 -->
    <div v-if="filteredModules.length === 0" class="empty-state">
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <div class="spinner-warm mx-auto"></div>
        </div>
        <p class="empty-state-text">
          {{ selectedModuleType ? `沒有 ${getModuleTypeLabel(selectedModuleType)} 模組` : '還沒有任何模組' }}
        </p>
        <p class="empty-state-subtext">點擊「新增模組」開始建立吧！</p>
        <button type="button" class="btn btn-primary shimmer-soft" @click="isCreating = true">新增模組</button>
      </div>
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
  return selectedModuleType.value
    ? modules.filter(m => m.type === selectedModuleType.value)
    : modules
})

const getModuleTypeLabel = (type: Module['type']) => ({
  basic: '基本資訊',
  persona: '性格特徵',
  background: '背景故事',
  instruction: '指令片段',
}[type])

// 把類型映射到不同色調（以 .tag 與設計變數呈現）
function typeTone(type: Module['type']) {
  switch (type) {
    case 'basic':       return 'tag-info'
    case 'persona':     return 'tag-warning'
    case 'background':  return 'tag-success'
    case 'instruction': return 'tag-danger'
    default:            return 'tag-primary'
  }
}

const getPlaceholder = (type: Module['type']) => ({
  basic: '描述角色的基本資訊，如外貌、年齡、職業等',
  persona: '描述角色的性格特徵，如個性、說話方式、行為模式等',
  background: '描述角色的背景故事，如經歷、世界觀、設定等',
  instruction: '輸入指令片段，如行為規則、對話語氣強化等',
}[type])

function submit() {
  if (!formData.title.trim() || !formData.content.trim()) return
  editingId.value ? handleUpdate() : handleCreate()
}

function handleCreate() {
  const toneHints = formData.toneHints
    ? formData.toneHints.split(/[,，]/g).map(s => s.trim()).filter(Boolean)
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

function handleEdit(module: Module) {
  editingId.value = module.id
  isCreating.value = true
  formData.type = module.type
  formData.title = module.title
  formData.content = module.content
  formData.toneHints = module.toneHints?.join(', ') || ''
  formData.versionNote = ''
}

function handleUpdate() {
  if (!editingId.value) return
  const toneHints = formData.toneHints
    ? formData.toneHints.split(/[,，]/g).map(s => s.trim()).filter(Boolean)
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

function handleDelete(id: string) {
  if (window.confirm('確定要刪除這個模組嗎？')) {
    deleteModule(id)
  }
}

function handleCancel() { resetForm() }

function resetForm() {
  formData.type = 'basic'
  formData.title = ''
  formData.content = ''
  formData.toneHints = ''
  formData.versionNote = ''
  isCreating.value = false
  editingId.value = null
}
</script>

<style scoped>
.module-manager { padding: var(--spacing-lg); }




/* 表單區域（沿用 modern-card 結構） */
.form-header{
  display:flex; align-items:center; justify-content:space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}
.form-title{ margin:0; font-weight:600; color: var(--text-color); }
.form-content{ padding: var(--spacing-xl); }
.form-row{ margin-bottom: var(--spacing-lg); }
.form-actions{
  display:flex; gap: var(--spacing-md);
  margin-top: var(--spacing-xl); padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* 文章卡片補充（.modern-card 已提供底色/陰影） */
.text-body { color: var(--subtext-color); }



/* 空狀態樣式覆用全站 tokens（與 Role 版一致） */
.empty-state{ display:flex; justify-content:center; align-items:center; min-height: 320px; }
.empty-state-card{
  background: var(--surface-card); backdrop-filter: blur(12px);
  border: 1px solid var(--border-light); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg); padding: 2.5rem; text-align:center; max-width: 400px; width: 100%;
  transition: all var(--transition-normal);
}
.empty-state-card:hover{ transform: translateY(-4px); box-shadow: var(--shadow-xl); border-color: var(--border-accent); }
.empty-state-icon{ margin-bottom: var(--spacing-lg); }
.empty-state-text{ font-size: 1.125rem; font-weight: 600; color: var(--text-color); margin: 0 0 var(--spacing-sm); }
.empty-state-subtext{ color: var(--subtext-color); margin-bottom: var(--spacing-xl); }

/* RWD */
@media (max-width: 768px){
  .page-header{ flex-direction: column; gap: var(--spacing-md); text-align:center; }
  .form-content{ padding: var(--spacing-lg); }
  .form-actions{ flex-direction: column; }
}
</style>
