import request from '@/utils/request'

export function fetchUserInfo(data) {
  return request({
    url: '/chart/getSignInfo',
    method: 'post',
    data
  })
}
