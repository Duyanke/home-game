<template>
  <div class="task-filter">
    <button
      class="filter-btn"
      :class="{ active: filter === 'all' }"
      @click="$emit('change', 'all')"
    >
      全部
    </button>
    <button
      class="filter-btn"
      :class="{ active: filter === 'pending' }"
      @click="$emit('change', 'pending')"
    >
      待领取
    </button>
    <button
      class="filter-btn"
      :class="{ active: filter === 'in_progress' }"
      @click="$emit('change', 'in_progress')"
    >
      进行中
    </button>
    <button
      class="filter-btn"
      :class="{ active: filter === 'completed' }"
      @click="$emit('change', 'completed')"
    >
      待确认
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  filter: 'all' | 'pending' | 'in_progress' | 'completed' | 'confirmed'
}>()

defineEmits<{
  change: [filter: 'all' | 'pending' | 'in_progress' | 'completed' | 'confirmed']
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.task-filter {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: $color-dark-light;
  border-radius: $button-radius;
}

.filter-btn {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: $button-radius;
  color: $color-text-secondary;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: $color-text-primary;
  }

  &.active {
    background: $color-gold;
    color: $color-dark-base;
  }
}
</style>