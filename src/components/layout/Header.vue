<template>
  <header class="header">
    <h3 class="title">BỘ CÔNG AN</h3>
    <div class="flags">
      <img :src="flatVi" alt="VI" />
      <img :src="flatEn" alt="EN" />
    </div>
  </header>
</template>

<script setup lang="ts">
import flatVi from "../assets/images/flag-vi.png"
import flatEn from "../assets/images/flag-en.png"


</script>


<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: var(--yellow);
}

.flags {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
