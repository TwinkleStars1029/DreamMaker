<template>
  <div class="role-builder space-y-6" @keydown="onGlobalKeydown">
    <!-- 頁首 + 流程步驟條 -->
    <div class="page-header">
      <h2 class="page-title">
        <span v-if="editingRoleId">編輯角色</span>
        <span v-else> 角色建立</span>
      </h2>
      <div class="flex gap-2 items-center">
        <button v-if="!isCreatingRole" @click="startNewRole" type="button" class="btn btn-accent floating">新增角色</button>
        <button v-else @click="cancelCreateRole" type="button" class="btn btn-outline">取消</button>
      </div>
    </div>

    <nav v-if="isCreatingRole" class="stepper" aria-label="建立角色流程">
      <ol class="stepper-list">
        <li :class="['step', currentStep===1?'active':currentStep>1?'done':'']">
          <span class="step-index">1</span><span class="step-label">角色基本資訊</span>
        </li>
        <li :class="['step', currentStep===2?'active':currentStep>2?'done':'']">
          <span class="step-index">2</span><span class="step-label">選擇模組</span>
        </li>
        <li :class="['step', currentStep===3?'active':currentStep>3?'done':'']">
          <span class="step-index">3</span><span class="step-label">角色預覽</span>
        </li>
      </ol>
    </nav>

    <!-- 步驟 1：基本資訊 -->
    <section v-if="isCreatingRole && currentStep===1" class="modern-card glass" :aria-live="Object.keys(errors).length ? 'polite' : undefined">
      <h3 class="form-title mb-6">🎭 角色基本資訊</h3>
      <div class="space-y-6">
        <div>
          <label class="form-label" for="role-name">角色名稱 *</label>
          <input
            id="role-name"
            ref="nameInput"
            v-model.trim="roleName"
            type="text"
            class="input w-full"
            placeholder="例如：角色A、溫柔咖啡店老闆"
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'err-name' : undefined"
            @keyup.enter="goNext()"
          />
          <small v-if="errors.name" id="err-name" role="alert" class="mt-1 block text-xs" style="color:#e05252">{{ errors.name }}</small>
        </div>
        <div>
          <label class="form-label" for="role-desc">角色描述</label>
          <textarea id="role-desc" v-model.trim="roleDescription" class="input textarea w-full" rows="3" placeholder="簡短描述這個角色的特點"></textarea>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" disabled>上一步</button>
        <button class="btn btn-primary" :disabled="!canNextFromStep1" @click="goNext">下一步 →</button>
      </div>
    </section>

    <!-- 步驟 2：選擇模組 -->
    <section v-if="isCreatingRole && currentStep===2" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 左：模組庫 -->
      <div class="space-y-6">
        <h3 class="form-title">選擇模組（至少選 1 項）</h3>
        <div v-for="moduleType in moduleTypes" :key="moduleType.value" class="space-y-3">
          <h4 class="section-title flex items-center">
            <span class="mr-2" aria-hidden="true">{{ getModuleTypeIcon(moduleType.value) }}</span>
            {{ moduleType.label }}
          </h4>
          <div class="space-y-3" role="listbox" :aria-label="moduleType.label">
            <article
              v-for="module in getModulesByType(moduleType.value)"
              :key="module.id"
              @click="selectModule(module)"
              @keyup.enter="selectModule(module)"
              @keyup.space.prevent="selectModule(module)"
              tabindex="0"
              role="option"
              :aria-selected="selectedModules[moduleType.value]?.id === module.id"
              :class="['item-card hoverable cursor-pointer', selectedModules[moduleType.value]?.id === module.id ? 'selected' : '']"
            >
              <div class="flex items-start gap-3">
                <div :class="['dot', getModuleTypeTone(module.type)]" aria-hidden="true"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="item-title">{{ module.title }}</h5>
                  <p class="item-desc line-clamp-2">{{ module.content }}</p>
                  <div v-if="module.toneHints?.length" class="flex flex-wrap gap-1 mt-2">
                    <span v-for="(hint, i) in module.toneHints" :key="i" class="tag tag-primary text-xs">{{ hint }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- 右：當前配置 -->
      <div class="space-y-6">
        <h3 class="form-title">當前配置</h3>
        <div class="modern-card">
          <div class="space-y-4">
            <div v-if="selectedModules.basic" class="config-block info">
              <h5 class="config-title">基本資訊</h5>
              <p class="config-text">{{ selectedModules.basic.content }}</p>
            </div>
            <div v-if="selectedModules.persona" class="config-block warn">
              <h5 class="config-title">性格特徵</h5>
              <p class="config-text mb-2">{{ selectedModules.persona.content }}</p>
              <div v-if="selectedModules.persona.toneHints?.length" class="flex flex-wrap gap-2">
                <span v-for="(hint, i) in selectedModules.persona.toneHints" :key="i" class="tag tag-primary text-xs">{{ hint }}</span>
              </div>
            </div>
            <div v-if="selectedModules.background" class="config-block success">
              <h5 class="config-title">背景故事</h5>
              <p class="config-text">{{ selectedModules.background.content }}</p>
            </div>
            <div v-if="selectedModules.instruction" class="config-block danger">
              <h5 class="config-title">指令片段</h5>
              <p class="config-text">{{ selectedModules.instruction.content }}</p>
            </div>
            <div v-if="selectedModules.event" class="config-block info">
              <h5 class="config-title">事件</h5>
              <p class="config-text">{{ selectedModules.event.content }}</p>
            </div>
          </div>
        </div>

        <div class="wizard-actions">
          <button class="btn btn-secondary" @click="goBack">← 上一步</button>
          <button class="btn btn-primary" :disabled="!canNextFromStep2" @click="goNext">下一步 →</button>
        </div>
      </div>
    </section>

    <!-- 步驟 3：預覽 + 儲存 -->
    <section v-if="isCreatingRole && currentStep===3" class="space-y-6">
      <div class="modern-card glass">
        <h3 class="form-title mb-4">角色預覽</h3>
        <div class="space-y-4">
          <div v-if="selectedModules.basic" class="preview-block info">
            <h5 class="preview-title">基本資訊</h5>
            <p class="preview-text">{{ selectedModules.basic.content }}</p>
          </div>
          <div v-if="selectedModules.persona" class="preview-block warn">
            <h5 class="preview-title">性格特徵</h5>
            <p class="preview-text mb-2">{{ selectedModules.persona.content }}</p>
            <div v-if="selectedModules.persona.toneHints?.length" class="flex flex-wrap gap-2">
              <span v-for="(hint, i) in selectedModules.persona.toneHints" :key="i" class="tag tag-primary text-xs">{{ hint }}</span>
            </div>
          </div>
          <div v-if="selectedModules.background" class="preview-block success">
            <h5 class="preview-title">背景故事</h5>
            <p class="preview-text">{{ selectedModules.background.content }}</p>
          </div>
          <div v-if="selectedModules.instruction" class="preview-block danger">
            <h5 class="preview-title">指令片段</h5>
            <p class="preview-text">{{ selectedModules.instruction.content }}</p>
          </div>
          <div v-if="selectedModules.event" class="preview-block info">
            <h5 class="preview-title">事件</h5>
            <p class="preview-text">{{ selectedModules.event.content }}</p>
          </div>
        </div>
      </div>

      <div class="wizard-actions">
        <button class="btn btn-secondary" @click="goBack">← 上一步</button>
        <button class="btn" :class="(submitting || !canSave) ? 'btn-ghost pointer-events-none opacity-60' : 'btn-primary'" :disabled="submitting || !canSave" @click="saveRole" aria-describedby="save-hint">
          <span v-if="submitting" class="spinner mr-2" aria-hidden="true"></span>
          💾 儲存角色
        </button>
        <span id="save-hint" class="sr-only">快捷鍵 Ctrl/⌘+S</span>
      </div>
    </section>

    <!-- 列表區（非建立流程時顯示） -->
    <section v-if="!isCreatingRole" class="space-y-6">
      <div v-if="rolesList.length > 0" class="modern-card">
        <h3 class="form-title mb-6">已建立的角色</h3>
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="role in rolesList" :key="role.id" class="modern-card role-card hoverable">
            <div class="flex items-start gap-4">
              <div class="avatar avatar-lg" :aria-label="`${role.name} 的頭像（預設）`"><span>{{ role.name?.charAt(0)?.toUpperCase() }}</span></div>
              <div class="flex-1 min-w-0">
                <h4 class="role-name">{{ role.name }}</h4>
                <p class="role-desc line-clamp-2">{{ role.description }}</p>
                <div
                  v-if="getRoleModules(role).length || role.tags?.length"
                  class="flex flex-wrap gap-2 mt-3"
                >
                  <template v-if="getRoleModules(role).length">
                    <span
                      v-for="m in getRoleModules(role)"
                      :key="m.id"
                      class="tag tag-primary"
                    >{{ m.title }}</span>
                  </template>
                  <template v-else>
                    <span v-for="tag in role.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end gap-2">
              <button type="button" @click="editRole(role)" class="action-btn action-btn-edit">編輯</button>
              <button type="button" @click="confirmDelete(role.id, role.name)" class="action-btn action-btn-delete">刪除</button>
            </div>
          </article>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon float-animation" style="font-size:3rem;" aria-hidden="true">✨</div>
          <h3 class="empty-state-text">還沒有建立任何角色</h3>
          <p class="empty-state-subtext">點擊「新增角色」開始建立你的第一個 AI 角色</p>
          <button type="button" @click="startNewRole" class="btn btn-primary shimmer-soft">開始建立</button>
        </div>
      </div>
    </section>

    <!-- 刪除確認對話框 -->
    <teleport to="body">
      <div v-if="confirm.visible" class="modal-backdrop" role="dialog" aria-modal="true" :aria-labelledby="'confirm-title'">
        <div class="modal">
          <h4 id="confirm-title" class="modal-title">刪除角色</h4>
          <p class="modal-text">確定要刪除「{{ confirm.name }}」嗎？此操作無法復原。</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="confirm.visible = false" :disabled="submitting">取消</button>
            <button class="btn btn-danger" @click="handleDeleteRole(confirm.id)" :disabled="submitting">
              <span v-if="submitting" class="spinner mr-2" aria-hidden="true"></span>
              確定刪除
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Toast -->
    <teleport to="body">
      <div class="toast" v-for="t in toasts" :key="t.id" :class="`toast-${t.type}`" role="status" aria-live="polite">{{ t.message }}</div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '../stores/useAppStore'
import type { Module, Role } from '../types'

/** 取用 Store：state 用 storeToRefs 保持響應；actions 用一般解構 */
const store = useAppStore()
const { modules, roles } = storeToRefs(store)
const { createRole, updateRole, deleteRole } = store

// ---------- 狀態 ----------
const isCreatingRole = ref(false)
const editingRoleId = ref<string | null>(null)
const currentStep = ref<1|2|3>(1)
const submitting = ref(false)

const roleName = ref('')
const roleDescription = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const selectedModules = reactive<Record<'basic'|'persona'|'background'|'instruction'|'event', Module | null>>({
  basic: null,
  persona: null,
  background: null,
  instruction: null,
  event: null,
})

const moduleTypes = [
  { value: 'basic', label: '基本資訊' },
  { value: 'persona', label: '性格特徵' },
  { value: 'background', label: '背景故事' },
  { value: 'instruction', label: '指令片段' },
  { value: 'event', label: '事件' },
] as const

// 用於列表區顯示的角色陣列（響應式）
const rolesList = computed(() => roles.value)

// ---------- 驗證 ----------
const errors = reactive<{ name?: string }>({})
const hasAnyModule = computed(() => Object.values(selectedModules).some(m => m !== null))
const canSave = computed(() => !!roleName.value.trim() && hasAnyModule.value)
const canNextFromStep1 = computed(() => !!roleName.value.trim())
const canNextFromStep2 = computed(() => hasAnyModule.value)

function validateStep1(){ errors.name = roleName.value.trim() ? undefined : '請輸入角色名稱'; return !errors.name }

// ---------- 工具 ----------
function getModulesByType(type: keyof typeof selectedModules) {
  return modules.value.filter(m => m.type === type)
}
// 取得角色所使用的模組（依 notes: "模組拼裝: id1,id2" 解析）
function getRoleModules(role: Role): Module[] {
  const note = (role as any).notes as string | undefined
  if (!note || !note.includes('模組拼裝:')) return []
  const ids = (note.split('模組拼裝: ')[1] || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return ids
    .map(id => modules.value.find(m => m.id === id))
    .filter((m): m is Module => Boolean(m))
}
function getModuleTypeTone(type: keyof typeof selectedModules | string) {
  switch (type) {
    case 'basic': return 'bg-info'
    case 'persona': return 'bg-warn'
    case 'background': return 'bg-success'
    case 'instruction': return 'bg-danger'
    case 'event': return 'bg-info'
    default: return 'bg-neutral'
  }
}
const getModuleTypeIcon = (type: keyof typeof selectedModules | string) => ({ basic: '👤', persona: '💫', background: '📚', instruction: '🎯' } as const)[type] || '📝'

function selectModule(module: Module) {
  selectedModules[module.type as keyof typeof selectedModules] = module
}
function focusName() { nextTick(() => nameInput.value?.focus()) }

// ---------- 快捷鍵 ----------
function onGlobalKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  if (!isCreatingRole.value) return
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); if(currentStep.value===3) saveRole(); else goNext() }
  if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); if(currentStep.value<3 && canNextFromStep1.value){ currentStep.value=3 } }
}

// ---------- 草稿（localStorage） ----------
const DRAFT_KEY = 'role-builder-draft'
watch([roleName, roleDescription, () => JSON.stringify(Object.values(selectedModules).map(m => m?.id))], () => {
  if (!isCreatingRole.value) return
  const draft = {
    roleName: roleName.value,
    roleDescription: roleDescription.value,
    selectedIds: Object.values(selectedModules).filter(Boolean).map(m => (m as Module).id),
    step: currentStep.value,
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
})

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  try {
    const d = JSON.parse(raw) as { roleName: string; roleDescription: string; selectedIds: string[]; step?: 1|2|3 }
    roleName.value = d.roleName || ''
    roleDescription.value = d.roleDescription || ''
    if (Array.isArray(d.selectedIds)) d.selectedIds.forEach(id => {
      const m = modules.value.find(x => x.id === id)
      if (m) selectModule(m)
    })
    currentStep.value = d.step || 1
  } catch {}
}

function clearDraft() { localStorage.removeItem(DRAFT_KEY) }

// 離開警示
function beforeUnload(e: BeforeUnloadEvent) { if (!isCreatingRole.value) return; e.preventDefault(); e.returnValue = '' }
onMounted(() => { window.addEventListener('beforeunload', beforeUnload) })
onBeforeUnmount(() => { window.removeEventListener('beforeunload', beforeUnload) })

// ---------- Toast ----------
const toasts = ref<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>>([])
function toast(message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 2200) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, type, message })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, timeout)
}

// ---------- 導覽控制 ----------
function goNext(){
  if(currentStep.value===1){ if(!validateStep1()) return; currentStep.value=2 }
  else if(currentStep.value===2){ if(!hasAnyModule.value) return; currentStep.value=3 }
}
function goBack(){ if(currentStep.value>1) currentStep.value-- }

// ---------- CRUD ----------
function startNewRole() {
  isCreatingRole.value = true
  editingRoleId.value = null
  currentStep.value = 1
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(k => (selectedModules[k as keyof typeof selectedModules] = null))
  loadDraft()
  focusName()
}

function editRole(role: Role) {
  isCreatingRole.value = true
  editingRoleId.value = role.id
  currentStep.value = 1
  roleName.value = role.name || ''
  roleDescription.value = role.description || ''
  Object.keys(selectedModules).forEach(k => (selectedModules[k as keyof typeof selectedModules] = null))
  if (role.notes?.includes('模組拼裝:')) {
    const moduleIds = role.notes.split('模組拼裝: ')[1]?.split(',') || []
    moduleIds.forEach(id => {
      const m = modules.value.find(x => x.id === id)
      if (m) selectModule(m)
    })
  }
  focusName()
}

async function saveRole() {
  if (!canSave.value) return
  submitting.value = true
  try {
    const moduleIds = Object.values(selectedModules).filter(Boolean).map(m => (m as Module).id)
    const tags = Object.values(selectedModules).filter(Boolean).map(m => (m as Module).type)
    const roleData = {
      name: roleName.value.trim(),
      description: roleDescription.value.trim() || '由模組拼裝而成的角色',
      tags,
      notes: `模組拼裝: ${moduleIds.join(',')}`
    }

    if (editingRoleId.value) {
      await Promise.resolve(updateRole(editingRoleId.value, roleData))
      toast('已更新角色', 'success')
    } else {
      await Promise.resolve(createRole(roleData))
      toast('已儲存角色', 'success')
    }

    clearDraft()
    cancelCreateRole()
  } catch (e) {
    console.error(e)
    toast('儲存失敗，稍後再試', 'error')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(id: string, name: string) { confirm.visible = true; confirm.id = id; confirm.name = name }

async function handleDeleteRole(id: string | null) {
  if (!id) return
  submitting.value = true
  try {
    await Promise.resolve(deleteRole(id))
    await nextTick() // 確保 DOM 依據更新後的 state 重新渲染
    toast('已刪除角色', 'success')
  } catch (e) {
    console.error(e)
    toast('刪除失敗，稍後再試', 'error')
  } finally {
    submitting.value = false
    confirm.visible = false
  }
}

function cancelCreateRole() {
  isCreatingRole.value = false
  editingRoleId.value = null
  roleName.value = ''
  roleDescription.value = ''
  currentStep.value = 1
  Object.keys(selectedModules).forEach(k => (selectedModules[k as keyof typeof selectedModules] = null))
}

// 刪除確認對話框狀態
const confirm = reactive<{ visible: boolean; id: string | null; name: string }>({ visible: false, id: null, name: '' })
</script>

<style scoped>
.role-builder { padding: var(--spacing-lg); }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

/* Stepper */
.stepper{ background:var(--surface-card); border:1px solid var(--border-light); border-radius:var(--radius-xl); box-shadow:var(--shadow-md); padding:.75rem 1rem; }
.stepper-list{ list-style:none; display:flex; gap:1rem; margin:0; padding:0; }
.step{ display:flex; align-items:center; gap:.5rem; color:var(--subtext-color); }
.step .step-index{ width:1.75rem; height:1.75rem; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--border-light); background:var(--surface-glass); font-weight:600; }
.step.active{ color:var(--text-color); }
.step.active .step-index{ border-color:var(--button-bg-color); box-shadow:0 0 0 3px rgba(242,170,132,.14); }
.step.done{ color:var(--text-color); }
.step.done .step-index{ background:var(--button-bg-color); color:#fff; border-color:transparent; }
.step-label{ font-weight:600; font-size:.95rem; }

/* Wizard actions */
.wizard-actions{ display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; }

/* 模組庫項目 */
.hoverable { cursor:pointer; }
.selected { border-color: var(--button-bg-color); box-shadow: 0 0 0 3px rgba(242,170,132,.12); background: var(--gradient-soft); }
.dot { width: .75rem; height: .75rem; border-radius: 50%; margin-top: .25rem; }
.bg-info { background: var(--info-color); }
.bg-warn { background: var(--warning-color); }
.bg-success { background: var(--success-color); }
.bg-danger { background: var(--danger-color); }
.bg-neutral { background: var(--border-medium); }
.item-title { margin:0; font-weight:600; color:var(--text-color); font-size:.95rem; }
.item-desc { color: var(--subtext-color); font-size:.85rem; }

/* 配置/預覽塊 */
.config-block, .preview-block { border-radius: var(--radius-lg); padding: var(--spacing-md); border: 1px solid var(--border-light); }
.config-block.info { background: var(--info-light); }
.config-block.warn { background: var(--warning-light); }
.config-block.success { background: var(--success-light); }
.config-block.danger { background: var(--danger-light); }
.preview-block.info { background: linear-gradient(135deg, var(--info-light), transparent); }
.preview-block.warn { background: linear-gradient(135deg, var(--warning-light), transparent); }
.preview-block.success { background: linear-gradient(135deg, var(--success-light), transparent); }
.preview-block.danger { background: linear-gradient(135deg, var(--danger-light), transparent); }
.config-title, .preview-title { margin:0 0 .5rem 0; font-size:.9rem; color: var(--text-color); }
.config-text, .preview-text { margin:0; color: var(--subtext-color); }

/* 列表卡片與空狀態 */
.role-name { margin:0; font-weight:600; color:var(--text-color); font-size:1rem; }
.role-desc { color: var(--subtext-color); font-size:.9rem; }
.line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.empty-state{ display:flex; justify-content:center; align-items:center; min-height: 360px; }
.empty-state-card{ background: var(--surface-card); backdrop-filter: blur(12px); border:1px solid var(--border-light); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 2.5rem; text-align:center; max-width:420px; width:100%; transition: all var(--transition-normal); }
.empty-state-card:hover{ transform: translateY(-4px); box-shadow: var(--shadow-xl); border-color: var(--border-accent); }
.empty-state-icon{ margin-bottom: var(--spacing-lg); }
.empty-state-text{ margin:0 0 .25rem 0; font-weight:600; color:var(--text-color); font-size:1.25rem; }
.empty-state-subtext{ color: var(--subtext-color); }

/* Modal & Toast */
.modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal{ background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-xl); padding:1.5rem; width:min(520px, 92vw); }
.modal-title{ font-size:1.125rem; font-weight:700; margin:0 0 .5rem 0; color:var(--text-color); }
.modal-text{ color:var(--subtext-color); margin:0 0 1rem 0; }
.modal-actions{ display:flex; justify-content:flex-end; gap:.75rem; }
.btn-danger{ background:#dc2626; color:#fff; border:1px solid #dc2626; }
.btn-danger:hover{ filter:brightness(.95); }
</style>
