'use strict'
var should = require('should')
var io = require('socket.io-client')
var socketURL = 'ws://121.43.107.106:4050/chat'

var options = {}
// 并发测试客户端池
var senderPool = []
var receiverPool = []
var POOL_LIMIT = 60
// chatuser样本
var chatUser1 = { 'user_name': 'siotest01', 'user_id': 'siotest01id', 'client': 'doctor' }
// 消息样本
var singlemsg1 = {
  clientType: 'doctor',
  contentType: 'text',
  fromID: 'siotest01id',
  fromName: 'siotest01',
  fromUser: {},
  targetID: 'siotest02id',
  targetName: 'siotest02',
  targetType: 'single',
  status: 'send_going',
  createTimeInMillis: Date.now(),
  newsType: '11',
  targetRole: 'patient',
  content: 'hello',
  test: true
}
var success = 'send_success'
// 统计指标：总发送数量，发送成功数量，接收成功数量
var sentCount = 0
var sendSuccess = 0
var receiveSuccess = 0
// 已发送消息的时间数组
var sendTimeArr = []
var receiveTimeArr = []
// 重复收到消息的时间数组
var duplicateSendTime = []
var duplicateReceiveTime = []

describe('单聊并发长时测试', function () {
  before(function () {
    (function next (i) {
      if (i === 0) {
        return console.log('Pool created')
      }
      var r = io.connect(socketURL, options)
      var s = io.connect(socketURL, options)
      receiverPool.push(r)
      senderPool.push(s)
      next(i - 1)
    })(POOL_LIMIT)

    receiverPool.forEach(function (r, i) {
      setTimeout(function () {
        r.emit('newUser', { 'user_name': 'siotestr' + i, 'user_id': 'siotestr' + i + 'id', 'client': 'patient' })
        r.on('getMsg', function (data) {
          receiveSuccess++
          var t = receiveTimeArr.indexOf(data.msg.createTimeInMillis)
          if (t !== -1) {
            receiveTimeArr.splice(t, 1)
          } else { duplicateReceiveTime.push(data.msg.createTimeInMillis) }
        })
        if (i === POOL_LIMIT - 1) createSender()
      }, 200 * i)
    })

    var createSender = function () {
      console.log('receiver created')
      senderPool.forEach(function (s, i) {
        setTimeout(function () {
          s.emit('newUser', { 'user_name': 'siotests' + i, 'user_id': 'siotests' + i + 'id', 'client': 'doctor' })
          s.on('messageRes', function (data) {
            sendSuccess++
            var t = sendTimeArr.indexOf(data.msg.createTimeInMillis)
            if (t !== -1) {
              sendTimeArr.splice(t, 1)
            } else { duplicateSendTime.push(data.msg.createTimeInMillis) }
          })
          if (i === POOL_LIMIT - 1) sendingMessage()
        }, 200 * i)
      })
    }

    var sendingMessage = function () {
      console.log('sender created')
      senderPool.forEach(function (s, i) {
        setTimeout((function (j) {
          return function () {
            setInterval(function () {
              var timeNow = Date.now()
              s.emit('message', {
                msg: {
                  clientType: 'doctor',
                  contentType: 'text',
                  fromID: 'siotests' + j + 'id',
                  fromName: 'siotests' + j,
                  fromUser: {},
                  targetID: 'siotestr' + j + 'id',
                  targetName: 'siotestr' + j,
                  targetType: 'single',
                  status: 'send_going',
                  createTimeInMillis: timeNow,
                  newsType: '11',
                  targetRole: 'patient',
                  content: 'hello',
                  test: true
                },
                to: 'siotestr' + j + 'id',
                role: 'doctor'
              })
              sentCount++
              sendTimeArr.push(timeNow)
              receiveTimeArr.push(timeNow)
            }, 10000)
          }
        }(i)), 60 * i)
      })
    }
  })

  it('每隔一小时输出统计量', function (done) {
    setInterval(function () {
      console.log('尝试发送：' + sentCount)
      console.log('发送成功：' + sendSuccess)
      console.log('接收成功：' + receiveSuccess)
            // console.log("发送失败的时间："+sendTimeArr)
            // console.log("接收失败的时间："+receiveTimeArr)
            // console.log("收到重复回执的时间："+duplicateSendTime)
            // console.log("收到重复消息的时间："+duplicateReceiveTime)
    }, 10000)
  })
})
