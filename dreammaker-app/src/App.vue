<script setup lang="ts">
import { ref } from 'vue'
import ModuleManager from './components/ModuleManager.vue'
import RoleAssembler from './components/RoleAssembler.vue'
import ConversationTester from './components/ConversationTester.vue'
import Settings from './components/Settings.vue'

const currentPage = ref('modules')

const pages = {
  modules: { label: '模組管理', component: ModuleManager },
  roles: { label: '角色建立', component: RoleAssembler },
  tester: { label: '對話測試', component: ConversationTester },
  compare: { label: '模型比較', component: null },
  settings: { label: '設定', component: Settings },
}

const handleNavigate = (page: string) => {
  currentPage.value = page
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 夢幻背景裝飾 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style="animation-delay: 4s;"></div>
    </div>

    <header class="glass-effect relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <h1 class="text-3xl font-bold dreamy-text">✨ DreamMaker</h1>
          <nav class="flex space-x-2">
            <button
              v-for="(page, key) in pages"
              :key="key"
              @click="currentPage = key"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                currentPage === key
                  ? 'dreamy-btn text-white shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
              ]"
            >
              {{ page.label }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
      <div class="px-4 py-6 sm:px-0">
        <component
          v-if="pages[currentPage].component"
          :is="pages[currentPage].component"
          @navigate="handleNavigate"
        />
        <div v-else class="text-center py-12">
          <div class="dreamy-card p-8 max-w-md mx-auto">
            <div class="dreamy-spinner mx-auto mb-4"></div>
            <p class="dreamy-text-white text-lg">{{ pages[currentPage].label }}開發中...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
