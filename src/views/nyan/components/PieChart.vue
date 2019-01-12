<template>
  <div class="pieChart"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons')
export default {
  name: 'PieChart',
  props: {
    name: {
      type: String,
      default: '饼图'
    },
    options: {
      type: Object,
      default: function() {
        return {}
      }
    },
    chartData: {
      type: Array,
      default: function() {
        return [
          { name: 'A', value: 1212 },
          { name: 'B', value: 2323 },
          { name: 'C', value: 1919 }
        ]
      }
    },
    legendData: {
      type: Array,
      default: function() {
        return ['A', 'B']
      }
    }
  },
  data() {
    return {
      title: 'name',
      chart: null
    }
  },
  watch: {
    chartData: function() {
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      // this.$el.style.height = '300px'
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b} <br/> {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: this.legendData
        },
        calculable: true,
        series: {
          type: 'pie',
          data: this.chartData
        }
      })
    }
  }
}
</script>

<style scoped>
.pieChart{
  min-height:300px;
  height:300px;
  width:100%;
}
</style>
