<template>
  <div class="role-builder space-y-6">
    <!-- 頁首 -->
    <div class="page-header">
      <h2 class="page-title">✨ 角色建立</h2>
      <div class="flex gap-3">
        <button
          v-if="!isCreatingRole"
          @click="startNewRole"
          type="button"
          class="btn btn-accent floating"
        >
          ✨ 新增角色
        </button>

        <button
          v-if="isCreatingRole"
          @click="saveRole"
          :disabled="!canSave"
          type="button"
          class="btn"
          :class="canSave ? 'btn-primary' : 'btn-ghost pointer-events-none opacity-60'"
        >
          💾 儲存角色
        </button>

        <button
          v-if="isCreatingRole"
          @click="previewRole"
          :disabled="!canPreview"
          type="button"
          class="btn"
          :class="canPreview ? 'btn-secondary' : 'btn-ghost pointer-events-none opacity-60'"
        >
          👁️ 預覽角色
        </button>

        <button
          v-if="isCreatingRole"
          @click="cancelCreateRole"
          type="button"
          class="btn btn-outline"
        >
          ❌ 取消
        </button>
      </div>
    </div>

    <!-- 已建立的角色列表 -->
    <section v-if="!isCreatingRole" class="space-y-6">
      <div v-if="roles.length > 0" class="modern-card glass">
        <h3 class="form-title mb-6">🌟 已建立的角色</h3>
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="role in roles"
            :key="role.id"
            class="modern-card role-card hoverable"
          >
            <div class="flex items-start gap-4">
              <div class="avatar avatar-lg">
                <span>{{ role.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="role-name">{{ role.name }}</h4>
                <p class="role-desc line-clamp-2">{{ role.description }}</p>
                <div v-if="role.tags?.length" class="flex flex-wrap gap-2 mt-3">
                  <span v-for="tag in role.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
                </div>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button type="button" @click="editRole(role)" class="action-btn action-btn-edit">✏️ 編輯</button>
              <button type="button" @click="handleDeleteRole(role.id)" class="action-btn action-btn-delete">🗑️ 刪除</button>
            </div>
          </article>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <div class="empty-state-card">
          <div class="empty-state-icon float-animation" style="font-size:3rem;">✨</div>
          <h3 class="empty-state-text">還沒有建立任何角色</h3>
          <p class="empty-state-subtext">點擊「新增角色」開始建立你的第一個 AI 角色</p>
          <button type="button" @click="startNewRole" class="btn btn-primary shimmer-soft">
            ✨ 開始建立
          </button>
        </div>
      </div>
    </section>

    <!-- 角色建立表單 -->
    <section v-if="isCreatingRole" class="space-y-6">
      <!-- 基本資訊 -->
      <div class="modern-card glass">
        <h3 class="form-title mb-6">🎭 角色基本資訊</h3>
        <div class="space-y-6">
          <div>
            <label class="form-label">✨ 角色名稱 *</label>
            <input
              v-model="roleName"
              type="text"
              class="input w-full"
              placeholder="例如：角色A、溫柔咖啡店老闆"
              @keyup.enter="saveRole"
            />
          </div>
          <div>
            <label class="form-label">📝 角色描述</label>
            <textarea
              v-model="roleDescription"
              class="input textarea w-full"
              rows="3"
              placeholder="簡短描述這個角色的特點"
            />
          </div>
        </div>
      </div>

      <!-- 拼裝區域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左：模組庫 -->
        <div class="space-y-6">
          <h3 class="form-title">🧩 選擇模組</h3>

          <div
            v-for="moduleType in moduleTypes"
            :key="moduleType.value"
            class="space-y-3"
          >
            <h4 class="section-title flex items-center">
              <span class="mr-2">{{ getModuleTypeIcon(moduleType.value) }}</span>
              {{ moduleType.label }}
            </h4>

            <div class="space-y-3">
              <article
                v-for="module in getModulesByType(moduleType.value)"
                :key="module.id"
                @click="selectModule(module)"
                :class="[
                  'modern-card hoverable cursor-pointer',
                  selectedModules[moduleType.value]?.id === module.id ? 'selected' : ''
                ]"
              >
                <div class="flex items-start gap-3">
                  <div :class="['dot', getModuleTypeTone(module.type)]"></div>
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

        <!-- 右：拼裝結果 + 預覽 -->
        <div class="space-y-6">
          <h3 class="form-title">🔮 角色預覽</h3>

          <!-- 當前配置 -->
          <div class="modern-card">
            <h4 class="section-title mb-4">⚙️ 當前配置</h4>
            <div class="space-y-4">
              <div v-if="selectedModules.basic" class="config-block info">
                <h5 class="config-title">👤 基本資訊</h5>
                <p class="config-text">{{ selectedModules.basic.content }}</p>
              </div>
              <div v-if="selectedModules.persona" class="config-block warn">
                <h5 class="config-title">💫 性格特徵</h5>
                <p class="config-text mb-2">{{ selectedModules.persona.content }}</p>
                <div v-if="selectedModules.persona.toneHints?.length" class="flex flex-wrap gap-2">
                  <span v-for="(hint, i) in selectedModules.persona.toneHints" :key="i" class="tag tag-primary text-xs">{{ hint }}</span>
                </div>
              </div>
              <div v-if="selectedModules.background" class="config-block success">
                <h5 class="config-title">📚 背景故事</h5>
                <p class="config-text">{{ selectedModules.background.content }}</p>
              </div>
              <div v-if="selectedModules.instruction" class="config-block danger">
                <h5 class="config-title">🎯 指令片段</h5>
                <p class="config-text">{{ selectedModules.instruction.content }}</p>
              </div>
            </div>
          </div>

          <!-- 可視預覽（僅在可預覽時顯示） -->
          <div v-if="canPreview" class="modern-card glass">
            <h4 class="section-title mb-4">✨ 角色預覽</h4>
            <div class="space-y-4">
              <div v-if="selectedModules.basic" class="preview-block info">
                <h5 class="preview-title">👤 基本資訊</h5>
                <p class="preview-text">{{ selectedModules.basic.content }}</p>
              </div>
              <div v-if="selectedModules.persona" class="preview-block warn">
                <h5 class="preview-title">💫 性格特徵</h5>
                <p class="preview-text mb-2">{{ selectedModules.persona.content }}</p>
                <div v-if="selectedModules.persona.toneHints?.length" class="flex flex-wrap gap-2">
                  <span v-for="(hint, i) in selectedModules.persona.toneHints" :key="i" class="tag tag-primary text-xs">{{ hint }}</span>
                </div>
              </div>
              <div v-if="selectedModules.background" class="preview-block success">
                <h5 class="preview-title">📚 背景故事</h5>
                <p class="preview-text">{{ selectedModules.background.content }}</p>
              </div>
              <div v-if="selectedModules.instruction" class="preview-block danger">
                <h5 class="preview-title">🎯 指令片段</h5>
                <p class="preview-text">{{ selectedModules.instruction.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

const canSave = computed(() =>
  roleName.value.trim() && Object.values(selectedModules).some(m => m !== null)
)
const canPreview = computed(() =>
  Object.values(selectedModules).some(m => m !== null)
)

const getModulesByType = (type: string) => modules.filter(m => m.type === type)

function getModuleTypeTone(type: string) {
  switch (type) {
    case 'basic': return 'bg-info'
    case 'persona': return 'bg-warn'
    case 'background': return 'bg-success'
    case 'instruction': return 'bg-danger'
    default: return 'bg-neutral'
  }
}
const getModuleTypeIcon = (type: string) =>
  ({ basic: '👤', persona: '💫', background: '📚', instruction: '🎯' } as const)[type] || '📝'

function startNewRole() {
  isCreatingRole.value = true
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(k => (selectedModules[k] = null))
}
function selectModule(module: Module) { selectedModules[module.type] = module }
function previewRole() { /* 預覽已在模板呈現 */ }

function saveRole() {
  if (!canSave.value) return
  const moduleIds = Object.values(selectedModules).filter(Boolean).map(m => (m as Module).id)
  const tags = Object.values(selectedModules).filter(Boolean).map(m => (m as Module).type)

  createRole({
    name: roleName.value,
    description: roleDescription.value || '由模組拼裝而成的角色',
    tags,
    notes: `模組拼裝: ${moduleIds.join(',')}`,
  })
  cancelCreateRole()
}

function editRole(role: Role) {
  isCreatingRole.value = true
  roleName.value = role.name
  roleDescription.value = role.description
  Object.keys(selectedModules).forEach(k => (selectedModules[k] = null))

  if (role.notes?.includes('模組拼裝:')) {
    const moduleIds = role.notes.split('模組拼裝: ')[1]?.split(',') || []
    moduleIds.forEach(id => {
      const m = modules.find(x => x.id === id)
      if (m) selectedModules[m.type] = m
    })
  }
}
function handleDeleteRole(id: string) {
  if (window.confirm('確定要刪除這個角色嗎？')) deleteRole(id)
}
function cancelCreateRole() {
  isCreatingRole.value = false
  roleName.value = ''
  roleDescription.value = ''
  Object.keys(selectedModules).forEach(k => (selectedModules[k] = null))
}
</script>

<style scoped>
.role-builder { padding: var(--spacing-lg); }

/* 頁首 */
.page-header{
  display:flex; justify-content:space-between; align-items:center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}
.page-title{
  margin:0; font-size:1.75rem; font-weight:700;
  color: var(--text-color);
  background: var(--gradient-warm);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* 列表卡片補充 */
.role-card.hoverable { transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.role-card.hoverable:hover { transform: translateY(-3px); }

/* 文本樣式 */
.role-name { margin:0; font-weight:600; color:var(--text-color); font-size:1rem; }
.role-desc { color: var(--subtext-color); font-size:.9rem; }

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

/* 區塊標題 */
.form-title { font-weight:600; color: var(--text-color); }
.section-title { font-weight:600; color: var(--text-color); }

/* 配置/預覽塊 */
.config-block, .preview-block {
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
}
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

/* 行動樣式 */
.line-clamp-2 {
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}

/* 行為按鈕（與前頁一致） */
.action-btn{
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size:.875rem; font-weight:500; transition:all var(--transition-fast);
  border:none; cursor:pointer;
}
.action-btn-edit{ background: var(--gradient-primary); color: var(--text-color); }
.action-btn-edit:hover{ background: var(--gradient-soft); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.action-btn-delete{ background: transparent; color:#dc2626; border:1px solid #dc2626; }
.action-btn-delete:hover{ background:#dc2626; color:#fff; transform: translateY(-1px); box-shadow:0 4px 14px rgba(220,38,38,.25); }

/* 空狀態（沿用 tokens） */
.empty-state{ display:flex; justify-content:center; align-items:center; min-height: 360px; }
.empty-state-card{
  background: var(--surface-card); backdrop-filter: blur(12px);
  border:1px solid var(--border-light); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg); padding: 2.5rem; text-align:center; max-width:420px; width:100%;
  transition: all var(--transition-normal);
}
.empty-state-card:hover{ transform: translateY(-4px); box-shadow: var(--shadow-xl); border-color: var(--border-accent); }
.empty-state-icon{ margin-bottom: var(--spacing-lg); }
.empty-state-text{ margin:0 0 .25rem 0; font-weight:600; color: var(--text-color); font-size:1.25rem; }
.empty-state-subtext{ color: var(--subtext-color); }
</style>
