<template>
  <div class="page-container home-page">
    <div class="page-content">
      <FamilyCodeCard :family-code="familyStore.familyCode" />
      <RankList />
      <NavCards />
    </div>
    <BottomNav />
    <Loading :visible="isLoading" text="加载中..." />
    <ConnectionStatus :connected="isConnected" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FamilyCodeCard from '@/components/home/FamilyCodeCard.vue'
import RankList from '@/components/home/RankList.vue'
import NavCards from '@/components/home/NavCards.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Loading from '@/components/common/Loading.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
import { useFamilyStore } from '@/stores/family'
import { connectSocket, getSocket } from '@/services/socket'

const familyStore = useFamilyStore()
const isLoading = ref(true)
const isConnected = ref(false)

onMounted(async () => {
  // 初始化 Socket 连接
  const socket = connectSocket('http://localhost:3000')

  socket.on('connect', () => {
    isConnected.value = true
    isLoading.value = false

    // 发送加入家庭请求（示例）
    if (familyStore.familyCode) {
      socket.emit('JOIN_FAMILY', {
        type: 'JOIN_FAMILY',
        payload: {
          familyCode: familyStore.familyCode,
          memberName: familyStore.memberName
        }
      })
    }
  })

  socket.on('disconnect', () => {
    isConnected.value = false
  })

  // 监听家庭同步事件
  socket.on('FAMILY_SYNC', (data) => {
    familyStore.syncMembers(data.payload.members)
  })
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.home-page {
  background: $color-dark-base;
}
</style>