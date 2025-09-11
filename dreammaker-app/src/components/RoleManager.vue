<template>
  <div class="role-assembler">
    <!-- 頁面標題與新增按鈕 -->
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
      <button
        type="button"
        @click="startCreate"
        class="btn btn-primary floating pulse-soft"
        aria-label="新增角色"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        新增角色
      </button>
    </div>

    <!-- 建立/編輯表單 -->
    <section v-if="isCreating || editingId" class="modern-card glass form-card">
      <div class="form-header">
        <h3 class="form-title">{{ editingId ? '編輯角色' : '新增角色' }}</h3>
        <div class="form-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      </div>

      <div class="form-content">
        <div class="form-group">
          <label class="form-label">角色名稱 *</label>
          <input
            v-model.trim="formData.name"
            type="text"
            class="input"
            placeholder="輸入角色名稱"
            :aria-invalid="!!errors.name"
            @keyup.enter="submit"
          />
          <small v-if="errors.name" class="mt-1 block text-xs" style="color:#e05252">{{ errors.name }}</small>
        </div>

        <div class="form-group">
          <label class="form-label">角色描述</label>
          <textarea
            v-model.trim="formData.description"
            class="input textarea"
            rows="3"
            placeholder="描述角色的背景、性格等"
          />
        </div>

        <div class="form-group">
          <label class="form-label">頭像網址</label>
          <input
            v-model.trim="formData.avatarUrl"
            type="url"
            class="input"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div class="form-group">
          <label class="form-label">標籤</label>
          <input
            v-model="formData.tags"
            type="text"
            class="input"
            placeholder="用逗號分隔：溫柔, 聰明, 神秘（支援全形，會自動去重）"
            @keyup.enter="submit"
          />
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="submit"
            class="btn btn-primary"
            :disabled="submitting || !formData.name.trim()"
          >
            <span v-if="submitting" class="spinner mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ editingId ? '更新' : '建立' }}
          </button>

          <button type="button" @click="handleCancel" class="btn btn-ghost">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            取消
          </button>
        </div>
      </div>
    </section>

    <!-- 角色列表 -->
    <div class="roles-grid">
      <article
        v-for="role in roles"
        :key="role.id"
        :class="['modern-card role-card', currentRoleId === role.id ? 'role-card-selected' : '']"
        @click="setCurrentRole(role.id)"
        :aria-pressed="currentRoleId === role.id"
        role="button"
        tabindex="0"
        @keyup.enter="setCurrentRole(role.id)"
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
              />
              <div v-else class="role-avatar-placeholder" :aria-label="`${role.name} 的頭像（預設）`">
                <span class="role-avatar-text">{{ role.name?.charAt(0)?.toUpperCase() }}</span>
              </div>
            </div>

            <div class="role-info">
              <h3 class="role-name">{{ role.name }}</h3>
              <p class="role-description">{{ role.description }}</p>
            </div>
          </div>

          <div v-if="(role.tags?.length || 0) > 0" class="role-tags">
            <span v-for="(tag, i) in role.tags" :key="i" class="tag tag-primary">{{ tag }}</span>
          </div>
        </div>

        <div class="role-actions">
          <button type="button" @click.stop="handleEdit(role)" class="action-btn action-btn-edit" aria-label="編輯角色">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            編輯
          </button>

          <button
            type="button"
            @click.stop="handleDelete(role.id)"
            class="action-btn action-btn-delete"
            aria-label="刪除角色"
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
    <div v-if="roles.length === 0" class="empty-state">
      <div class="empty-state-card">
        <div class="empty-state-icon">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <p class="empty-state-text">還沒有任何角色</p>
        <p class="empty-state-subtext">點擊「新增角色」開始建立吧！</p>
        <button type="button" @click="startCreate" class="btn btn-primary shimmer-soft">開始建立</button>
      </div>
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
const submitting = ref(false)
const errors = reactive<{ name?: string }>({})

const formData = reactive({
  name: '',
  description: '',
  avatarUrl: '',
  tags: '', // 以 , 或 ， 分隔
})

function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[,，]/g)
        .map(t => t.trim())
        .filter(Boolean)
    )
  )
}

function startCreate() {
  isCreating.value = true
  editingId.value = null
  errors.name = undefined
}

function submit() {
  errors.name = formData.name.trim() ? undefined : '請輸入角色名稱'
  if (errors.name) return

  if (editingId.value) handleUpdate()
  else handleCreate()
}

function handleCreate() {
  if (!formData.name.trim()) return
  submitting.value = true
  try {
    const tags = parseTags(formData.tags)
    createRole({
      name: formData.name.trim(),
      description: formData.description.trim(),
      avatarUrl: formData.avatarUrl.trim() || undefined,
      tags,
    })
    resetForm()
  } finally {
    submitting.value = false
  }
}

function handleEdit(role: Role) {
  editingId.value = role.id
  isCreating.value = true
  formData.name = role.name ?? ''
  formData.description = role.description ?? ''
  formData.avatarUrl = role.avatarUrl ?? ''
  formData.tags = (role.tags ?? []).join(', ')
  errors.name = undefined
}

function handleUpdate() {
  if (!editingId.value || !formData.name.trim()) return
  submitting.value = true
  try {
    const tags = parseTags(formData.tags)
    updateRole(editingId.value, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      avatarUrl: formData.avatarUrl.trim() || undefined,
      tags,
    })
    resetForm()
  } finally {
    submitting.value = false
  }
}

function handleDelete(id: string) {
  if (window.confirm('確定要刪除這個角色嗎？')) {
    deleteRole(id)
    if (currentRoleId === id) {
      setCurrentRole(undefined as unknown as string) // 保持和 store 介面一致
    }
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
  errors.name = undefined
}
</script>

<style scoped>
/* 容器 */
.role-assembler { padding: var(--spacing-lg); max-width: 1200px; margin: 0 auto; }

/* 標題列 */
.page-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom: var(--spacing-xl); padding-bottom: var(--spacing-lg);
  border-bottom:1px solid var(--border-light);
}
.page-title{
  font-size:2rem;font-weight:700;margin:0;
  color:var(--text-color);
  background:var(--gradient-warm); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* 表單卡片（沿用 modern-card，補充區域化樣式） */
.form-card { overflow:hidden; animation: fadeIn 0.5s ease-out; }
.form-header {
  background: var(--gradient-soft); padding: var(--spacing-lg);
  display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid var(--border-light);
}
.form-title { font-size:1.25rem;font-weight:600;margin:0;color:var(--text-color); }
.form-icon { color: var(--button-bg-color); opacity:.85; }
.form-content { padding: var(--spacing-xl); }
.form-group { margin-bottom: var(--spacing-lg); }
.form-label { display:block; font-size:.875rem; font-weight:500; margin-bottom: var(--spacing-sm); color:var(--text-color); }
.textarea { resize:vertical; min-height:80px; }
.form-actions {
  display:flex; gap:var(--spacing-md); margin-top:var(--spacing-xl); padding-top:var(--spacing-lg);
  border-top:1px solid var(--border-light);
}

/* 清單網格 */
.roles-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:var(--spacing-lg); margin-bottom:var(--spacing-xl);
}

/* 卡片（沿用 modern-card，補充動畫/互動） */
.role-card { cursor:pointer; position:relative; overflow:hidden; animation: slideUp .6s ease-out both; }
.role-card::before{
  content:''; position:absolute; inset:0; left:-100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
  transition:left .6s;
}
.role-card:hover::before{ left:100%; }
.role-card:hover{ transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--border-accent); }
.role-card-selected{ border-color:var(--button-bg-color); box-shadow:0 0 0 3px rgba(242,170,132,.15); background:var(--gradient-soft); }

.role-card-content{ padding:var(--spacing-lg); }
.role-avatar-section{ display:flex; align-items:flex-start; gap:var(--spacing-md); margin-bottom:var(--spacing-md); }
.role-avatar-container{ flex-shrink:0; }
.role-avatar-image{
  width:3rem;height:3rem;border-radius:50%;object-fit:cover; border:2px solid var(--border-light); transition:all var(--transition-fast);
}
.role-avatar-image:hover{ transform:scale(1.05); border-color:var(--button-bg-color); }
.role-avatar-placeholder{
  width:3rem;height:3rem;border-radius:50%; display:flex; align-items:center; justify-content:center;
  background: var(--gradient-button); transition:all var(--transition-fast);
}
.role-avatar-placeholder:hover{ transform:scale(1.05); box-shadow:var(--shadow-md); }
.role-avatar-text{ color:var(--button-text-color); font-weight:600; font-size:1.125rem; }

.role-info{ flex:1; min-width:0; }
.role-name{ font-size:1.125rem; font-weight:600; margin:0 0 var(--spacing-xs) 0; color:var(--text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.role-description{
  color:var(--subtext-color); font-size:.875rem; line-height:1.4; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}

.role-tags{ display:flex; flex-wrap:wrap; gap:var(--spacing-xs); }

.role-actions{
  display:flex; justify-content:flex-end; gap:var(--spacing-md);
  padding:var(--spacing-md) var(--spacing-lg);
  background:var(--surface-glass); border-top:1px solid var(--border-light);
}
.action-btn{
  display:inline-flex; align-items:center; gap:var(--spacing-xs);
  padding:var(--spacing-sm) var(--spacing-md);
  border:none; border-radius:var(--radius-md);
  font-size:.875rem; font-weight:500; cursor:pointer; transition:all var(--transition-fast);
}
.action-btn-edit{ background:var(--gradient-primary); color:var(--text-color); }
.action-btn-edit:hover{ background:var(--gradient-soft); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
.action-btn-delete{ background:transparent; color:#dc2626; border:1px solid #dc2626; }
.action-btn-delete:hover{ background:#dc2626; color:white; transform:translateY(-1px); box-shadow:0 4px 14px 0 rgba(220,38,38,.25); }

/* 空狀態 */
.empty-state{ display:flex; justify-content:center; align-items:center; min-height:400px; padding:var(--spacing-xl); }
.empty-state-card{
  background:var(--surface-card); backdrop-filter:blur(15px); border:1px solid var(--border-light);
  border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); padding:3rem; text-align:center; max-width:400px; width:100%;
  transition:all var(--transition-normal);
}
.empty-state-card:hover{ transform:translateY(-4px); box-shadow:var(--shadow-xl); border-color:var(--border-accent); }
.empty-state-icon{ color:var(--subtext-color); margin-bottom:var(--spacing-lg); opacity:.6; }
.empty-state-text{ font-size:1.25rem; font-weight:600; color:var(--text-color); margin:0 0 var(--spacing-sm) 0; }
.empty-state-subtext{ color:var(--subtext-color); margin:0 0 var(--spacing-xl) 0; font-size:.9375rem; }

/* RWD */
@media (max-width: 768px){
  .role-assembler{ padding:var(--spacing-md); }
  .page-header{ flex-direction:column; gap:var(--spacing-md); text-align:center; }
  .page-title{ font-size:1.75rem; }
  .form-content{ padding:var(--spacing-lg); }
  .form-actions{ flex-direction:column; }
  .roles-grid{ grid-template-columns:1fr; gap:var(--spacing-md); }
  .role-avatar-section{ flex-direction:column; align-items:center; text-align:center; }
  .role-actions{ justify-content:center; }
  .empty-state-card{ padding:2rem; }
}
@media (max-width: 480px){
  .page-title{ font-size:1.5rem; }
  .role-card-content{ padding:var(--spacing-md); }
  .empty-state-card{ padding:1.5rem; }
}

/* 動畫 */
@keyframes slideUp{ from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
@keyframes fadeIn{ from{opacity:0; transform:scale(.95);} to{opacity:1; transform:scale(1);} }
</style>

