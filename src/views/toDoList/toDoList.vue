<template>
  <div class="todoContainer">
    <h1>今日任务</h1>
    <div class="add"/>
    <div v-for="(item, index) in todayList" :key="index">
      <li>
        <div>{{ item.name }}</div>
        <el-rate v-model="item.stars" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"/>
        <div class="detail">
          内容：{{ item.details }}
        </div>
        <div class="buildTime">{{ item.buildTime }}
          <el-time-picker
            v-model="item.buildTime"
            :picker-options="{
              selectableRange: '00:00:00 - 23:59:59'
            }"
            placeholder="任意时间点"/></div>
        <div class="startTime">开始时间：{{ item.startTime }}</div>
        <div class="endTime">结束时间：{{ item.endTime }}</div>
        <el-checkbox v-model="item.done"/>
      </li>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToDoList',
  data() {
    return {
      todayList: [
        {
          type: 1,
          name: '完成列表展示',
          details: '完成列表展示 包括所包含的所有信息',
          stars: null,
          buildTime: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          done: false
        },
        {
          type: 1,
          name: '完成列表展示2',
          details: '完成列表展示 包括所包含的所有信息2',
          stars: null,
          buildTime: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          done: false
        }
      ]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .todoContainer{
    padding:20px;
  }
</style>
