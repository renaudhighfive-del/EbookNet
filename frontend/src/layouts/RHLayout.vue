<template>
  <AppLayout :notif-count="0">
    <template #title><slot name="title" /></template>
    <slot />
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'
</script>
