<template>
  <div style="padding:30px;background-color: #f0f2f5;">
    <transition name="el-zoom-in-bottom">
      <div v-if="currentPage === 'Main' " v-show="currentPage === 'Main'">
        <el-row class="mainRow1">
          <el-col :lg="24"><p class="title" style="text-align:center">所有的 {{ allQuestions.title }}, 参与 {{ allQuestions.length }} 人次 </p></el-col>
          <el-col :lg="12" :sm="24" >
            <pie-chart :chart-data="groupChartData" class="mainPie"/>
          </el-col>
          <el-col :lg="12" :sm="24" class="titleRight">
            <p>总人数 {{ stats.totalNumber }}</p>
            <p>数据时间段选择</p>
            <el-date-picker
              :picker-options="pickerOptions"
              v-model="dateSelect"
              type="daterange"
              format="yyyy年MM月dd日"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width:500px;"
            />
            <el-button @click="initcsv()">创建csv文件</el-button>
            <a :href="computeURI" download="反馈信息表.csv"><el-button type="primary">下载csv</el-button></a>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col v-for="(group,index) in allQuestions.groups" :xs="24" :sm="12" :lg="8" :key="group.name" >
            <div class="card-container">
              <div class="title">{{ index+1 }}.{{ group.name }}</div>
              <div class="info">
                参与次数:{{ group.value }}， 平均完成时间 {{ group.timeSpent.length>0? Math.round(avg(group.timeSpent) * 100) / 100 + 's' : '0' }}
              </div>
              <el-button type="primary" @click="switchPage(index)" >查看</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </transition>
    <transition name="el-zoom-in-top">
      <div v-for="(group,index) in allQuestions.groups" v-if="currentPage === index " :key="group.name" class="page" >
        <el-button icon="el-icon-back" @click="switchPage('Main')">返回</el-button>
        <div class="title">{{ group.name }}  平均完成时间: {{ group.timeSpent.length>0? Math.round(avg(group.timeSpent) * 100) / 100 + 's' : '' }}</div>
        <el-row :gutter="20">
          <el-col v-for="question in group.questions" :key="question.name" :xs="24" :sm="12" :lg="8">
            <div class="chart-wrapper">
              <div class="title">{{ question.name }}</div>
              <pie-chart v-if="question.type === 1 || question.type === 2" :chart-data="question.chartData" />
              <bar-chart v-if="question.type === 3" :chart-data="avg(question.chartData)"/>
              <text-list v-if="question.type === 4 || question.type === 5" :text-list="question.chartData" />
            </div>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchPhone, fetchByDate, fetchCustomerNumber } from '@/api/nyanchart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TextList from './components/TextList'

export default {
  name: 'Index',
  components: {
    PieChart,
    BarChart,
    TextList
  },
  data: function() {
    return {
      value: null,
      sourceData: null,
      testChartData: [
        { name: '第一项', value: 133 },
        { name: '第二项', value: 344 }
      ],
      sourceYesOrNoQuestions: [],
      yesOrNoQuestions: [],
      allQuestionsConfig: [
        {
          name: '客服',
          questions: [
            { name: '您对客服的服务打几分？（1~10）', type: 3 },
            { name: '您的需求我们客服人员是否为您解决', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '医生',
          questions: [
            { name: '医生是否给您亲自做检查？', type: 1 },
            { name: '您的医生是哪位？', type: 5 },
            { name: '医生对您的问题是否做到耐心细致的回答？', type: 1 },
            { name: '您是否会向周边朋友推荐我们医院？', type: 1 },
            { name: '您觉得我院的收费是否合理？', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '输液',
          questions: [
            { name: '护士的穿刺技术是否满意？', type: 1 },
            { name: '您在输液过程中是否会觉得液体太凉', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '收费',
          questions: [
            { name: '您给收费人员的态度打几分？（1~10）', type: 3 },
            { name: '当您有疑问时工作人员是否为您解释', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '超声',
          questions: [
            { name: '您做的项目是？', type: 2, selections: ['NT', '四维彩超', '胎儿心超', 'E10大排畸'] },
            { name: '是否达到您的期望值？', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '治疗室',
          questions: [
            { name: '治疗前是否会向您核对姓名，告知疗效、目的？', type: 1 },
            { name: '治疗期间护士不谈论与治疗无关的话题？', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '药房',
          questions: [
            { name: '您给药房工作人员态度打几分？（1~10）', type: 3 },
            { name: '是否会向您解释用药注意事项？', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '住院部',
          questions: [
            { name: '在您需要帮助的时候是否出现护士站无人情况？', type: 1 },
            { name: '医生是否耐心细致解决您的问题？', type: 1 },
            { name: '在您住院期间护士是否向您收取任何形式的押金？', type: 1 },
            { name: '入院体验是否满意？', type: 1 },
            { name: '您住院期间的责任医生是？', type: 5 },
            { name: '您对住院收费有疑义时，是否为您解答？', type: 1 },
            { name: '我要吐槽', type: 4 }
          ]
        },
        {
          name: '月子中心',
          questions: [
            { name: '您对月子期间的菜品是否满意？', type: 1 },
            { name: '您对我院的月嫂是否满意？', type: 1 },
            { name: '月子期间的产后康复项目您觉得需要调整吗？', type: 5 },
            { name: '我要吐槽', type: 4 }
          ]
        }
      ],
      allQuestions: {
        title: '反馈统计',
        groups: []
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      csvText: '',
      dateSelect: '',
      currentPage: '2',
      loading: false,
      stats: {
        totalNumber: 0
      }
    }
  },
  computed: {
    ...mapGetters([
      'avatar',
      'token'
    ]),
    getAllQuestions() {
      return this.allQuestions
    },
    groupChartData() {
      const chartData = []
      for (let i = 0; i < this.allQuestions.groups.length; i++) {
        const singleGroup = this.allQuestions.groups[i]
        const groupData = {
          name: singleGroup.name,
          value: singleGroup.value
        }
        chartData.push(groupData)
      }
      return chartData
    },
    computeURI: function() {
      return encodeURI(this.csvText)
    }
  },
  watch: {
    allQuestions: function() {
      this.statsAll(this.sourceData)
    },
    currentPage: () => {
    },
    dateSelect: function() {
      this.getDataByDate()
    }
  },
  mounted: function() {
    fetchPhone({ phone: '18888888888' }).then(response => {
      this.sourceData = this.changeDataToJson(response.data)
      this.statsAll(this.sourceData)
      this.initcsv()
    }).catch(error => {
      console.log(error)
    })
    this.allQuestions.groups = this.initQuestionsStats(this.allQuestionsConfig)
    this.statsAll(this.sourceData)
    this.currentPage = 'Main'
    this.getUserNumber()
  },
  methods: {
    getDataByDate() {
      this.loading = true
      console.log('开始获取信息')
      fetchByDate({ date: this.dateSelect }).then(response => {
        this.sourceData = this.changeDataToJson(response.data)
        this.allQuestions.groups = this.initQuestionsStats(this.allQuestionsConfig)
        this.currentPage = 'Main'
        this.getUserNumber()
        this.statsAll(this.sourceData)
        this.loading = false
      }).catch(error => {
        console.log(error)
        console.log('获取信息失败')
        this.loading = false
      })
    },
    getUserNumber() {
      fetchCustomerNumber().then(response => {
        this.stats.totalNumber = response.data.number
      }).catch(error => {
        console.log(error)
      })
    },
    changeDataToJson(data) {
      for (var i = 0; i < data.length; i++) {
        var singleRow = data[i]
        for (var j = 1; j <= 9; j++) {
          var QP = 'QP' + j
          if (singleRow[QP] && typeof singleRow[QP] === 'string') {
            singleRow[QP] = JSON.parse(singleRow[QP])
          }
          if (singleRow.timeSpent && typeof (singleRow.timeSpent) === 'string') {
            singleRow.timeSpent = JSON.parse(singleRow.timeSpent)
          }
        }
      }
      return data
    },
    /* 将结果转换为统计结果的函数 按照问题 划分*/
    initQuestionsStats(questionConfig) {
      const groups = []
      for (let i = 0; i < questionConfig.length; i++) {
        const QuestionGroup = questionConfig[i]
        const group = []
        for (let j = 0; j < QuestionGroup.questions.length; j++) {
          const singleQ = QuestionGroup.questions[j]
          const single = {
            name: singleQ.name,
            type: singleQ.type
          }
          if (single.type === 1) {
            single.chartData = [
              { name: '是', value: 0 },
              { name: '否', value: 0 },
              { name: '未选择', value: 0 }
            ]
            single.legendData = ['是', '否', '未选择']
          }
          if (single.type === 2) { // 单选
            const chartData = []
            for (let x = 0; x < singleQ.selections.length; x++) {
              const singleData = {
                name: singleQ.selections[x],
                value: 0
              }
              chartData.push(singleData)
            }
            single.chartData = chartData
          }
          if (single.type === 3) {
            const chartData = []
            single.chartData = chartData
          } else if (single.type === 4 || single.type === 5) {
            const chartData = []
            single.chartData = chartData
          }
          group.push(single)
        }
        groups.push({
          name: QuestionGroup.name,
          number: 0,
          value: 0,
          timeSpent: [],
          questions: group
        })
      }
      return groups
    },
    statsAll(sourceData) {
      if (sourceData) {
        this.allQuestions.length = sourceData.length
        // 算出不同组别的提交数量以及其他基本信息
        for (let i = 0; i < sourceData.length; i++) {
          const singleRow = sourceData[i]
          this.handleDataRow(singleRow)
        }
      }
    },
    // 对单行数据进行 统计处理
    handleDataRow(row) {
      for (let qgroupIndex = 0; qgroupIndex < 9; qgroupIndex++) {
        const currentRow = row['QP' + (qgroupIndex + 1)]
        const dataGroup = this.allQuestions.groups[qgroupIndex]
        if (currentRow && dataGroup) {
          dataGroup.value += 1
          dataGroup.timeSpent.push(row.timeSpent)
          for (let i = 0; i < dataGroup.questions.length; i++) {
            const question = dataGroup.questions[i]
            let answer = currentRow[i].answerText
            if (answer && question.type === 1) {
              this.statType1(question, answer)
            } else if (answer && question.type === 2) {
              answer = currentRow[i].answer
              this.statType2(question, answer)
            } else if (answer && question.type === 3) {
              answer = currentRow[i].answer
              this.statType3(question, answer)
            } else if (answer && question.type === 4 || question.type === 5) {
              this.statType4(question, answer)
            }
          }
        }
      }
    },
    statType1(question, answerText) {
      if (answerText === '是') {
        question.chartData[0].value += 1
      } else if (answerText === '否') {
        question.chartData[1].value += 1
      } else {
        question.chartData[2].value += 1
      }
    },
    statType2(question, answer) {
      if (question.chartData[answer]) {
        question.chartData[answer].value += 1
      }
    },
    statType3(question, answer) {
      if (question.chartData && answer && answer >= 0 && answer <= 10) {
        question.chartData.push(answer)
      }
    },
    statType4(question, answerText) {
      if (question.chartData && answerText) {
        question.chartData.push(answerText)
      }
    },
    switchPage(page) {
      this.currentPage = page
      console.log('click')
    },
    avg(numArr) {
      let sum = 0
      for (let i = 0; i < numArr.length; i++) {
        sum += numArr[i]
      }
      return sum / numArr.length
    },
    getAvgNumber: function(group) {
      if (group.timeSpent.length > 0) return ''
      else return Math.round(this.avg(group.timeSpent) * 100) / 100 + 's'
    },
    initcsv() {
      const sourceData = this.sourceData
      var cvsStr = 'data:text/csv;charset=utf-8,id,电话,'
      cvsStr += this.addrow1()
      if (sourceData && sourceData.length > 0) {
        for (let i = 0; i < sourceData.length; i++) {
          const current = sourceData[i]
          cvsStr += this.addSingle(current)
        }
        this.csvText = cvsStr
      }
    },
    addrow1() {
      const row1 = []
      const qs = this.allQuestionsConfig
      let text = ''
      for (let i = 0; i < qs.length; i++) {
        const currentQuestionPack = qs[i]
        const questionPackName = currentQuestionPack.name
        for (let j = 0; j < currentQuestionPack.questions.length; j++) {
          const question = questionPackName + '-' + currentQuestionPack.questions[j].name
          row1.push(question)
          text += question
          text += ','
        }
      }
      text += '用户id'
      text += '\r\n'
      return text
    },
    // 输出为单条逗号分隔的字符串 加'\r\n';
    addSingle(line) {
      let lineStr = ''
      // 1添加id
      const id = line.id
      lineStr += id + ','
      lineStr += line.phone ? line.phone : '' // 电话
      lineStr += ','
      for (let i = 0; i < this.allQuestionsConfig.length; i++) {
        const currentQuestionPack = this.allQuestionsConfig[i]
        for (let j = 0; j < currentQuestionPack.questions.length; j++) {
          if (!line['QP' + (i + 1)]) {
            lineStr += ','
          } else {
            lineStr += line['QP' + (i + 1)][j].answerText.replace(/[\r\n]/g, '') + ','
          }
        }
      }
      lineStr += line.cookieid
      lineStr += '\r\n'
      return lineStr
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .myicon{
    background-color: #cccccc;
    border-radius:50%;
    box-shadow:0 0 2px 2px #cccccc;
    margin:4px;
  }
  .title{
    font-size:1.4em;
  }
  .mainPie{
    background-color: #fff;
  }
  .chart-container{
    overflow:hidden;
    margin:20px 0;
    background-color: #fff;
    .chart-title{
      text-align:center;
      margin:15px 0 0 0;
    }
  }
  .card-container{
    height:auto;
    min-height:150px;
    background-color: #fff;
    padding:20px;
    margin:10px auto;
    .title{
      text-align:center;
      font-size:1.2em;
    }
    .info{
      margin:10px auto;
    }
  }
  .page{
    .title{
      text-align:center;
    }
    .chart-wrapper{
      background-color: #fff;
      margin:20px 0;
      padding:0 10px;
      height:350px;
      .title{
        line-height: 50px;
        height:50px;
        font-size:20px;
        border-bottom:1px solid #cccccc;
      }
    }
  }
  .mainRow1{
    position:relative;
    .titleRight{
      padding:15px;
      background-color: #fff;
      height:300px;
    }
    .title{
      height:50px;
      line-height: 50px;
      margin:0;
    }
  }

</style>
