import request from '@/utils/request'

export function fetchPhone(query) {
  return request({
    url: '/chart/getPhone',
    method: 'get',
    params: query
  })
}
export function fetchByDate(data) {
  return request({
    url: '/chart/getData',
    method: 'post',
    data
  })
}
export function fetchCustomerNumber(query) {
  return request({
    url: '/chart/getCustomerNumber',
    method: 'get',
    params: query
  })
}
