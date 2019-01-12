<template>
  <ul class="TextList">
    <li v-for="(text,index) in textList" :key="(index + text)" >{{ text }}</li>
  </ul>
</template>

<script>
export default {
  name: 'TextList',
  props: {
    textList: {
      type: Array,
      default: function() {
        return ['测试用的列表']
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .TextList{
    overflow: scroll;
    max-height:300px;
    margin:0;
    li{
      line-height: 28px;
    }
  }
</style>
