<template>
  <router-link
    :to="`/catalogue/${document.id}`"
    class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
  >
    <!-- Cover -->
    <div class="relative aspect-[3/4] bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] overflow-hidden">
      <div class="absolute inset-0 flex items-center justify-center">
        <BookOpen class="w-20 h-20 text-white/30" />
      </div>
      <!-- Access Badge -->
      <div class="absolute top-3 right-3">
        <span v-if="document.access === 'restricted'" class="bg-[#E8A020] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Lock class="w-3 h-3" />
          Réservé
        </span>
      </div>
      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-[#0D9488]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span class="text-white font-medium">Voir la fiche</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <span class="inline-block px-2 py-1 bg-[#0D9488]/10 text-[#0D9488] rounded text-xs font-medium mb-2">
        {{ document.category }}
      </span>
      <h3 class="font-semibold text-[#1B2A4A] mb-2 line-clamp-2 group-hover:text-[#0D9488] transition-colors">
        {{ document.title }}
      </h3>
      <p class="text-[#6B7280] text-sm mb-3 line-clamp-1">
        {{ document.authors.join(', ') }}
      </p>
      <div class="flex items-center justify-between text-xs text-[#6B7280]">
        <span class="bg-[#F1F0EC] px-2 py-1 rounded">{{ document.type }}</span>
        <span class="font-mono">{{ document.year }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { BookOpen, Lock } from '@lucide/vue'

defineProps({
  document: {
    type: Object,
    required: true,
  },
})
</script>
