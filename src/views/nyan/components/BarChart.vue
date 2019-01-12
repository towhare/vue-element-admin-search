<template>
  <div class="barChart"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons')
export default {
  name: 'BarChart',
  props: {
    name: {
      type: String,
      default: '条形图'
    },
    chartData: {
      type: Number,
      default: function() {
        return 5
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
      this.chart.setOption(
        {
          tooltip: {
            trigger: 'item',
            formatter: '{b} <br/> {c}分'
          },
          xAxis: {
          },
          yAxis: {
            data: ['分数']
          },
          series: [
            { // For shadow
              type: 'bar',
              itemStyle: {
                normal: { color: 'rgba(0,0,0,0.05)' }
              },
              barGap: '-100%',
              barCategoryGap: '40%',
              data: [10],
              animation: false
            },
            {
              type: 'bar',
              data: [this.chartData]
            }
          ]
        })
    }
  }
}
</script>

<style scoped>
  .barChart{
    min-height:100px;
    max-height:200px;
    height:100%;
    width:100%;
  }
</style>
