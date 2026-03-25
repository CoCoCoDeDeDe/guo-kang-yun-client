<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 👈 确保这里能正常导入
import { App as CapApp } from '@capacitor/app'; 

const router = useRouter();

onMounted(async () => {
  // 监听安卓系统/侧滑返回键
  // 加上类型定义 ({ canGoBack }: { canGoBack: boolean }) 消除 any 报错
  await CapApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
    if (canGoBack) {
      router.back();
    } else {
      // 如果已经在首页了，则退出 App
      CapApp.exitApp();
    }
  });
});
</script>

<template>
  <router-view />
</template>

<style>
/* 核心：解决你之前说的“返回键和名字没了”的问题 */
:root {
  --sat: env(safe-area-inset-top);
}

body {
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
  /* 👈 加上这一行，确保整个 body 自动避开状态栏 */
  padding-top: var(--sat); 
}

#app {
  max-width: 100vw;
  margin: 0 auto;
}

/* 如果你使用的是 Vant，强制让导航栏适配安全区 */
.van-nav-bar--fixed {
  padding-top: var(--sat) !important;
}
.van-nav-bar__placeholder {
  height: calc(46px + var(--sat)) !important;
}
</style>