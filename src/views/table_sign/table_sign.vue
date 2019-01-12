<template>
  <div style="padding:30px;background-color: #f0f0f0;">
    <el-table :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)" stripe style="width:1000px;margin:0 auto;">
      <el-table-column prop="id" label="序号" width="100"/>
      <el-table-column prop="name" label="姓名" width="200"/>
      <el-table-column prop="phone" label="电话" width="200"/>
      <el-table-column prop="key" label="抽奖码" width="200"/>
      <el-table-column prop="time" label="报名时间" width="200" sortable/>
      <el-table-column prop="period" label="孕周" width="100" sortable/>
    </el-table>

    <div class="bottomLine">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5,10,20,40,100]"
        :page-size="pagesize"
        :total="tableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination_me"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <a :href="computeURI" download="活动抽奖信息表.csv"><el-button type="primary">下载表格csv</el-button></a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchUserInfo } from '@/api/tableSign'
export default {
  name: 'TableSign',
  data() {
    return {
      tableData: [{
        name: 'towrabbit',
        phone: '18857138217',
        key: 'xxxkkkxxxkxx',
        time: '2018-12-15 12:40:56',
        period: 12
      }],
      sourceData: [],
      csvText: '',
      pagesize: 20,
      currentPage: 1
    }
  },
  computed: {
    ...mapGetters([
      'avatar',
      'token'
    ]),
    computeURI: function() {
      console.log('计算uri')
      return encodeURI(this.csvText)
    }
  },
  mounted: function() {
    fetchUserInfo().then(response => {
      this.sourceData = response.data.results
      console.log(response)
      this.changeSourceToTable()
      console.log(this.sourceData)
    }).catch(error => {
      console.log(error)
    })
  },
  methods: {
    changeSourceToTable() {
      this.tableData = []
      if (this.sourceData && this.sourceData.length > 0) {
        this.sourceData.forEach((single, index) => {
          const sing = {
            id: index + 1,
            name: single.name,
            phone: single.phone,
            key: single.token,
            period: single.period,
            time: single.time
          }
          this.tableData.push(sing)
        })
        this.initCsv()
      }
    },
    initCsv() {
      const tableData = this.tableData
      let csvStr = 'data:text/csv;charset=utf-8,姓名,电话,抽奖码,孕周,提交时间\r\n'
      if (tableData && tableData.length > 0) {
        for (const singleLine of tableData) {
          csvStr += this.addSingle(singleLine)
        }
        this.csvText = csvStr
      }
    },
    addSingle(singleLine) {
      const lineStr = '' + singleLine.name + ',' +
      singleLine.phone + ',' +
      singleLine.key + ',' +
      singleLine.period + ',' +
      singleLine.time + '\r\n'
      return lineStr
    },
    handleSizeChange: function(size) {
      this.pagesize = size
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .bottomLine{
    margin: 0 auto;
    width:800px;
    display: flex;
    display: -webkit-flex;
    justify-content: space-around;
    align-items:center;
    -webkit-justify-content: space-around;
    -webkit-align-items:center;
    padding:10px;
  }
  .pagination_me{
    margin:0 auto;
  }
</style>
