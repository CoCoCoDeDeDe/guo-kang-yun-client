<!-- src\App.vue -->
<script setup lang="ts">
// 只需要这一个空的 setup 即可
</script>

<template>
  <router-view />
</template>

<style>
/* 去掉默认的一些居中限制，方便移动端全屏铺满 */
body {
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
}
#app {
  max-width: 100vw;
  margin: 0 auto;
}
</style>