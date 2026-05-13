<template>
  <div class="rank-list">
    <h3 class="list-title">积分排行</h3>
    <div class="rank-items">
      <MemberRank
        v-for="(member, index) in rankedMembers"
        :key="member.id"
        :member="member"
        :rank="index + 1"
        :is-me="member.id === myId"
      />
    </div>
    <div class="empty-hint" v-if="rankedMembers.length === 0">
      暂无成员数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MemberRank from '@/components/common/MemberRank.vue'
import { useFamilyStore } from '@/stores/family'

const familyStore = useFamilyStore()

const rankedMembers = computed(() => familyStore.rankedMembers)
const myId = computed(() => familyStore.memberId)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.rank-list {
  margin-top: 24px;
}

.list-title {
  @include text-title;
  margin-bottom: 16px;
}

.rank-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-hint {
  @include text-secondary;
  text-align: center;
  padding: 32px;
}
</style>