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
  settings: { label: '設定', component: Settings },
}

const handleNavigate = (page: string) => {
  currentPage.value = page
}
</script>

<template>
  <div class="app-container">
    <!-- 溫暖色調背景裝飾 -->
    <div class="background-decorations">
      <div class="decoration-orb decoration-orb-1"></div>
      <div class="decoration-orb decoration-orb-2"></div>
      <div class="decoration-orb decoration-orb-3"></div>
    </div>

    <!-- 頭部導航 -->
    <header class="app-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="app-title">DreamMaker</h1>
          <nav class="nav-container">
            <button
              v-for="(page, key) in pages"
              :key="key"
              @click="currentPage = key"
              :class="[
                'nav-btn',
                currentPage === key ? 'nav-btn-active' : 'nav-btn-inactive'
              ]"
            >
              {{ page.label }}
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主內容區域 -->
    <main class="main-content">
      <div class="content-container">
        <component
          v-if="pages[currentPage].component"
          :is="pages[currentPage].component"
          @navigate="handleNavigate"
        />
        <div v-else class="development-placeholder">
          <div class="placeholder-card">
            <div class="spinner-warm"></div>
            <p class="placeholder-text">{{ pages[currentPage].label }}開發中...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import './assets/style.css';

/* 應用程式容器 */
.app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: var(--bg-primary);
}

/* 背景裝飾 */
.background-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.decoration-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  mix-blend-mode: multiply;
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
}

.decoration-orb-1 {
  top: -10rem;
  right: -10rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, var(--primary-color) 0%, var(--accent-color) 70%);
  animation-delay: 0s;
}

.decoration-orb-2 {
  bottom: -10rem;
  left: -10rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, var(--button-bg-color) 0%, var(--accent-color) 70%);
  animation-delay: 2s;
}

.decoration-orb-3 {
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  width: 16rem;
  height: 16rem;
  background: radial-gradient(circle, var(--accent-color) 0%, var(--primary-color) 70%);
  animation-delay: 4s;
}

/* 頭部樣式 */
.app-header {
  position: relative;
  z-index: 20;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .header-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-container {
    padding: 0 2rem;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-warm);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.app-title:hover {
  transform: scale(1.02);
}

.nav-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-btn {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn-active {
  background: var(--button-bg-color);
  color: var(--button-text-color);
  box-shadow: var(--shadow-button);
  transform: translateY(-2px);
}

.nav-btn-inactive {
  background: var(--surface-glass);
  color: var(--text-color);
  border: 1px solid var(--border-light);
}

.nav-btn-inactive:hover {
  background: var(--surface-elevated);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: var(--border-medium);
}

/* 主內容區域 */
.main-content {
  position: relative;
  width: 100%;
  max-width: 1280px;
  text-align: center; 
  margin: 0 auto;
}



/* 開發中頁面樣式 */
.development-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
}

.placeholder-card {
  background: var(--surface-card);
  backdrop-filter: blur(15px);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 3rem;
  text-align: center;
  max-width: 24rem;
  width: 100%;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.placeholder-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.placeholder-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--border-accent);
}

.placeholder-text {
  color: var(--text-color);
  font-size: 1.125rem;
  font-weight: 500;
  margin-top: 1.5rem;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 響應式設計調整 */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.75rem;
  }
  
  .nav-container {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .nav-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
  
  
  .placeholder-card {
    padding: 2rem;
    margin: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .nav-container {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .decoration-orb {
    width: 12rem;
    height: 12rem;
  }
  
  .decoration-orb-1,
  .decoration-orb-2 {
    width: 16rem;
    height: 16rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .nav-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}

/* 深色模式適配 */
@media (prefers-color-scheme: dark) {
  .decoration-orb {
    opacity: 0.4;
    filter: blur(80px);
  }
  
  .app-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .placeholder-text {
    color: #E5E5E5;
  }
}

/* 動畫關鍵幀 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0px) scale(1); 
  }
  33% { 
    transform: translateY(-15px) scale(1.02); 
  }
  66% { 
    transform: translateY(-8px) scale(0.98); 
  }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 進入動畫 */
.app-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-btn {
  animation: slideInDown 0.6s ease-out;
  animation-fill-mode: both;
}

.nav-btn:nth-child(1) { animation-delay: 0.1s; }
.nav-btn:nth-child(2) { animation-delay: 0.2s; }
.nav-btn:nth-child(3) { animation-delay: 0.3s; }
.nav-btn:nth-child(4) { animation-delay: 0.4s; }
.nav-btn:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>