<template>
  <router-link
    :to="`/catalogue/${document.id}`"
    class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
  >
    <!-- Cover -->
    <div class="relative aspect-[2/3] bg-gradient-to-br overflow-hidden" :class="document.coverColor">
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-6xl text-white/20">📖</span>
      </div>
      <!-- Access Badge -->
      <div class="absolute top-3 right-3">
        <span v-if="document.access === 'restricted'" class="bg-[#E79F1F] text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
          🔒
          Réservé
        </span>
        <span v-else class="bg-white text-[#0D9488] text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
          ✅
          Public
        </span>
      </div>
      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-[#0D9488]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span class="text-white font-medium text-sm">Voir la fiche</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <span class="inline-block px-2 py-1 bg-[#ECFFFD] text-[#0D9488] rounded text-xs font-medium mb-2">
        {{ document.category }}
      </span>
      <h3 class="font-semibold text-[#1B2A4A] mb-2 line-clamp-2 group-hover:text-[#0D9488] transition-colors text-sm">
        {{ document.title }}
      </h3>
      <p class="text-[#6B7280] text-xs mb-3 line-clamp-1">
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
defineProps({
  document: {
    type: Object,
    required: true,
  },
})
</script>
