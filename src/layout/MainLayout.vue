<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 当前激活的标签，与路由路径绑定
const active = ref(route.path)

// 监听路由变化，确保在页面跳转时底栏高亮状态同步
watch(
  () => route.path,
  (newPath) => {
    active.value = newPath
  }
)

// 标签项配置
const tabs = [
  { name: '/home', icon: 'home-o', text: '首页' },
  { name: '/encyclopedia', icon: 'search', text: '百科' },
  { name: '/community', icon: 'friends-o', text: '社区' },
  { name: '/profile', icon: 'user-o', text: '我的' }
]
</script>

<template>
  <div class="layout-container">
    <div class="layout-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="route.name" v-if="route.meta.keepAlive" />
        </keep-alive>
        <component :is="Component" :key="route.name" v-if="!route.meta.keepAlive" />
      </router-view>
    </div>

    <van-tabbar v-model="active" route fixed placeholder border safe-area-inset-bottom>
      <van-tabbar-item 
        v-for="tab in tabs" 
        :key="tab.name" 
        :to="tab.name" 
        :icon="tab.icon"
        :name="tab.name"
      >
        {{ tab.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;  /** 固定高度 */
  overflow: hidden; /** 防止整体滚动 */
}

.layout-content {
  flex: 1;
  padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS */
  padding-bottom: env(safe-area-inset-bottom);
  overflow-y: auto; /** 让内容区域内部可竖向滚动 */
  background-color: #f7f8fa;  /** 统一设置背景色 */
}

/* 简单的页面切换过渡动画（可选） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>