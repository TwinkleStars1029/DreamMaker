<template>
  <div class="module-manager space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">模組管理</h2>
      <div class="flex gap-2">
        <select v-model="selectedModuleType" class="input w-56">
          <option value="">選擇模組類型</option>
          <option value="basic">基本資訊</option>
          <option value="persona">角色人設</option>
          <option value="background">背景故事</option>
          <option value="instruction">指令集</option>
          <option value="event">事件</option>
        </select>
        <button @click="isCreating = true" type="button" class="btn btn-primary floating pulse-soft">
          新增模組
        </button>
      </div>
    </div>

    <!-- 快速分類 -->
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

    <!-- 新增/編輯表單 -->
    <section v-if="isCreating || editingId" class="modern-card">
      <div class="form-header">
        <h3 class="form-title">{{ editingId ? '編輯模組' : '新增模組' }}</h3>
      </div>

      <div class="form-content">
        <div class="form-row">
          <label class="form-label">模組類型 *</label>
          <select v-model="formData.type" class="input w-full">
            <option value="basic">基本資訊</option>
            <option value="persona">角色人設</option>
            <option value="background">背景故事</option>
            <option value="instruction">指令集</option>
            <option value="event">事件</option>
          </select>
        </div>

        <!-- 模板套用(會覆蓋) -->
        <div class="form-row">
          <label class="form-label">套用模板</label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :class="tplBtnClass('')"
              @click="handleTemplateSwitch('')"
            >無</button>
            <button
              v-if="availableTemplates[0]"
              type="button"
              :class="tplBtnClass(availableTemplates[0].id)"
              @click="handleTemplateSwitch(availableTemplates[0].id)"
            >{{ availableTemplates[0] ? availableTemplates[0].name : '模板一' }}</button>
            <button
              v-if="availableTemplates[1]"
              type="button"
              :class="tplBtnClass(availableTemplates[1].id)"
              @click="handleTemplateSwitch(availableTemplates[1].id)"
            >{{ availableTemplates[1] ? availableTemplates[1].name : '模板二' }}</button>
          </div>
          <small class="text-xs text-body">套用模板將會清空目前輸入內容</small>
        </div>

        <div class="form-row">
          <label class="form-label">模組標題 *</label>
          <input
            v-model.trim="formData.title"
            type="text"
            class="input w-full"
            placeholder="請輸入模組標題"
            @keyup.enter="submit"
          />
        </div>

        <div class="form-row">
          <label class="form-label">模組內容 *</label>
          <textarea
            v-model.trim="formData.content"
            class="input textarea w-full"
            rows="4"
            :placeholder="getPlaceholder(formData.type)"
          />
        </div>

        <div class="form-row" v-if="formData.type === 'persona'">
          <label class="form-label">語氣提示</label>
          <input
            v-model="formData.toneHints"
            type="text"
            class="input w-full"
            placeholder="輸入關鍵字，如：溫柔的、嚴肅的、活潑的"
          />
        </div>

        <div class="form-row">
          <label class="form-label">版本備註</label>
          <input
            v-model="formData.versionNote"
            type="text"
            class="input w-full"
            placeholder="選填，例如：從 v1 修改為 v2"
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
            {{ editingId ? '更新' : '新增' }}
          </button>
          <button type="button" class="btn btn-ghost" @click="handleCancel">取消</button>
        </div>
      </div>
    </section>

    <!-- 模組列表 -->
    <div class="grid auto-rows-auto gap-4 md:grid-cols-2 xl:grid-cols-3">
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

        <p
          :class="[
            'text-sm text-body role-description',
            isExpanded(module.id) ? 'whitespace-pre-wrap' : 'line-clamp-3'
          ]"
        >
          {{ module.content }}
        </p>
        <div class="mt-2">
          <button
            v-if="isLong(module.content)"
            type="button"
            class="btn btn-ghost btn-sm"
            @click="toggleExpand(module.id)"
          >
            {{ isExpanded(module.id) ? '收合' : '展開' }}
          </button>
        </div>

        <div v-if="module.toneHints?.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="(hint, i) in module.toneHints" :key="i" class="tag tag-primary">{{ hint }}</span>
        </div>
      </article>
    </div>

    <!-- 無資料 -->
    <div v-if="filteredModules.length === 0" class="empty-state">
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <div class="spinner-warm mx-auto"></div>
        </div>
        <p class="empty-state-text">
          {{ selectedModuleType ? `尚無 ${getModuleTypeLabel(selectedModuleType)} 模組` : '還沒有任何模組' }}
        </p>
        <p class="empty-state-subtext">立即建立新模組，或從匯入開始</p>
        <button type="button" class="btn btn-primary shimmer-soft" @click="isCreating = true">新增模組</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAppStore } from '../stores/useAppStore'
import type { Module } from '../types'
import moduleTemplates from '../templates'

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

// 模板套用相關

// 內容展開/收合狀態
const expandedMap = reactive<Record<string, boolean>>({})
const isExpanded = (id: string) => !!expandedMap[id]
const toggleExpand = (id: string) => { expandedMap[id] = !expandedMap[id] }
const isLong = (text: string) => (text?.length || 0) > 120 || /\n/.test(text)
const selectedTemplateId = ref('') // 目前範本
const availableTemplates = computed(() => moduleTemplates[formData.type] || [])
watch(() => formData.type, () => { selectedTemplateId.value = '' })

function tplBtnClass(id: string){
  const active = selectedTemplateId.value === id
  return ['btn', 'btn-sm', active ? 'btn-secondary' : 'btn-ghost'].join(' ')
}

function handleTemplateSwitch(targetId: string){
  if (selectedTemplateId.value === targetId) return
  const ok = window.confirm('套用後，將會覆蓋您目前輸入的內容，確定要繼續嗎?')
  if (!ok) return

  selectedTemplateId.value = targetId
  if (!targetId){
    // 無範本，清空表單
    formData.title = ''
    formData.content = ''
    formData.toneHints = ''
    return
  }
  const tpl = availableTemplates.value.find(t => t.id === targetId)
  if (!tpl) return
  formData.title = tpl.title
  formData.content = tpl.content
  formData.toneHints = tpl.toneHints?.join(', ') || ''
}

const moduleTypes = [
  { value: '', label: '全部' },
  { value: 'basic', label: '基本資訊' },
  { value: 'persona', label: '角色人設' },
  { value: 'background', label: '背景故事' },
  { value: 'instruction', label: '指令集' },
  { value: 'event', label: '事件' },
]

const filteredModules = computed(() => {
  return selectedModuleType.value
    ? modules.filter(m => m.type === selectedModuleType.value)
    : modules
})

const getModuleTypeLabel = (type: Module['type']) => ({
  basic: '基本資訊',
  persona: '角色人設',
  background: '背景故事',
  instruction: '指令集',
  event: '事件',
}[type])

// 每個 type 對應到一個 tag 顏色，讓 .tag 呈現不同顏色
function typeTone(type: Module['type']) {
  switch (type) {
    case 'basic':       return 'tag-info'
    case 'persona':     return 'tag-warning'
    case 'background':  return 'tag-success'
    case 'instruction': return 'tag-danger'
    case 'event':       return 'tag-info'
    default:            return 'tag-primary'
  }
}

const getPlaceholder = (type: Module['type']) => ({
  basic: '描述這個模組的用途、功能或內容，例如：核心設定、通用規則、世界觀。',
  persona: '描述這個角色的設定，例如：身分、性格、說話風格、背景故事等。',
  background: '描述故事的背景設定，例如：世界觀、勢力、地點、文化等。',
  instruction: '請輸入指令集，例如：在任何時候、都必須使用繁體中文來回覆。',
  event: '描述一個事件：觸發條件、過程、影響與限制',
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
  if (window.confirm('確定要永久刪除這個模組嗎?')) {
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
.module-manager {
  text-align: left;
}




/* 表單卡片，沿用 modern-card 樣式 */
.form-header{
  display:flex; align-items:center; justify-content:space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}
.form-title{ margin:0; font-weight:600; color: var(--text-color); }
.form-content{ padding: var(--spacing-xl); }
.form-row{ margin-bottom: var(--spacing-lg); }
.form-label{ display:block; margin-bottom: .5rem; }
/* 讓此區塊的 input 寬度為父層的 100% */
.form-content .input{ width: 100%; }
.form-actions{
  display:flex; gap: var(--spacing-md);
  margin-top: var(--spacing-xl); padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* 其他卡片內樣式，modern-card 已有基本樣式 */
.text-body { color: var(--subtext-color); }

/* 三行截斷（可切換展開）*/
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}



/* 無資料的提示卡片樣式，與 Role 頁面共用 */
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
