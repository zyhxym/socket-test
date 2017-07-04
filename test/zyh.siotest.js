'use strict'
var should = require('should');
var io = require('socket.io-client');
var socketURL = 'ws://121.43.107.106:4050/chat';

var options = {
};
//并发测试客户端池
var clientPool = [];
var POOL_LIMIT = 200;

var chatUser1 = {'user_name':'siotest01','user_id':'siotest01id','client':'doctor'};
var chatUser2 = {'user_name':'siotest02','user_id':'siotest02id','client':'patient'};
var chatUser3 = {'user_name':'siotest03','user_id':'siotest03id','client':'wechatdoctor'};
var chatUser4 = {'user_name':'siotest04','user_id':'siotest04id','client':'wechatpatient'};
//1 5 6 7 8在同一组 5是组长 组号sockettest01
var chatUser5 = {'user_name':'siotest05','user_id':'siotest05id','client':'wechatdoctor'};
var chatUser6 = {'user_name':'siotest06','user_id':'siotest06id','client':'wechatdoctor'};
var chatUser7 = {'user_name':'siotest07','user_id':'siotest07id','client':'wechatdoctor'};
var chatUser8 = {'user_name':'siotest08','user_id':'siotest08id','client':'wechatdoctor'};
//1 既是医生又是患者 又想多端登录
var chatUser12 = {'user_name':'siotest01','user_id':'siotest02id','client':'patient'};
var chatUser13 = {'user_name':'siotest01','user_id':'siotest02id','client':'wechatdoctor'};
var chatUser14 = {'user_name':'siotest01','user_id':'siotest02id','client':'wechatpatient'};
//var client of socket
var client1;
var client2;
var client3;
var client4;
var client5;
var client6;
var client7;
var client8;
var client12;
var client13;
var client14;
//var status of return
var status1;
var status4;
var status5;
var status6;
var status7;
var status8;
var status12;
var status13;
var status14;

var singlemsg1={
		clientType:'doctor',
		contentType:'text',
		fromID:'siotest01id',
		fromName:'siotest01',
		fromUser:{
		},
		targetID:'siotest02id',
		targetName:'siotest02',
		targetType:'single',
		status:'send_going',
		createTimeInMillis: Date.now(),
		newsType:'11',
		targetRole:'patient',
		content:'hello',
		test:true
};
var singlemsg4={
    clientType:'wechatpatient',
    contentType:'text',
    fromID:'siotest04id',
    fromName:'siotest04',
    fromUser:{
    },
    targetID:'siotest01id',
    targetName:'siotest01',
    targetType:'single',
    status:'send_going',
    createTimeInMillis: Date.now(),
    newsType:'11',
    targetRole:'doctor',
    content:'hello',
    test:true
};

var groupmsg1={
    clientType:'doctor',
    contentType:'text',
    fromID:'siotest01id',
    fromName:'siotest01',
    fromUser:{
    },
    teamId:'sockettest01',
    targetID:'sockettest01',
    targetName:'socket测试1',
    targetType:'group',
    status:'send_going',
    createTimeInMillis: Date.now(),
    newsType:'13',
    targetRole:'doctor',
    content:'hello',
    test:true
};

var success = 'send_success';
//单聊长时测试指标
var s, r;
var sendtimer;

// describe("单聊测试",function(){
//   it('app医生对app患者', function(done){
//   client1 = io.connect(socketURL, options);

//   client1.on('connect', function(data){
//     client1.emit('newUser', chatUser1);

//     /* Since first client is connected, we connect
//     the second client. */
//     client2 = io.connect(socketURL, options);

//     client2.on('connect', function(data){
//       console.log('connect ok')
//       client2.emit('newUser', chatUser2);
//       setTimeout(function(){client1.emit('message', {msg:singlemsg1,to:'siotest02id',role:'doctor'})}, 1000); 
//       client1.on('messageRes', function(data){
//       	success.should.equal(data.msg.status);
//       });
//       client2.on('getMsg', function(data){
//       	success.should.equal(data.msg.status);
//       	done();
//       });

//     });

//   });

 
//   });

//   after(function(){
//     client1.disconnect();
//     client2.disconnect();
//   });


 
//   });

// describe("群聊测试", function(){
//   before(function(){
//     client1 = io.connect(socketURL, options);
//     client5 = io.connect(socketURL, options);
//     client6 = io.connect(socketURL, options);
//     client7 = io.connect(socketURL, options);
//     client8 = io.connect(socketURL, options);

//     client1.on('connect', function(data){
//       client1.emit('newUser', chatUser1);
//     });
//     client5.on('connect', function(data){
//       client5.emit('newUser', chatUser5);
//     });
//     client6.on('connect', function(data){
//       client6.emit('newUser', chatUser6);
//     });
//     client7.on('connect', function(data){
//       client7.emit('newUser', chatUser7);
//     });
//     client8.on('connect', function(data){
//       client7.emit('newUser', chatUser8);
//     });
//     setTimeout(function(){client1.emit('message', {msg:groupmsg1, to:'sockettest01', role:'doctor'})}, 1000);
  
//   });

//   after(function(){
//     client1.disconnect();
//     client5.disconnect();
//     client6.disconnect();
//     client7.disconnect();
//     client8.disconnect();

//     status1 = '';
//     status5 = '';
//     status6 = '';
//     status7 = '';
//     status8 = '';
//   });

//   it('app医生对一群微信医生',function(done){
//     client1.on('messageRes', function(data){
//       status1 = data.msg.status;
//     });
//     client5.on('getMsg', function(data){
//       status5 = data.msg.status;
//     });
//     client6.on('getMsg', function(data){
//       status6 = data.msg.status;
//     });
//     client7.on('getMsg', function(data){
//       status7 = data.msg.status;
//     }); 
//     client7.on('getMsg', function(data){
//       status8 = data.msg.status;
//     }); 
//     setTimeout(function(){
//       success.should.equal(status1);
//       success.should.equal(status5);
//       success.should.equal(status6);
//       success.should.equal(status7);
//       success.should.equal(status8); 
//       done();  
//     },2000);

      
//   });

// });

// describe("多端登录", function(){
//   before(function(){
//     client1 = io.connect(socketURL, options);
//     client4 = io.connect(socketURL, options);
//     client12 = io.connect(socketURL, options);
//     client13 = io.connect(socketURL, options);
//     client14 = io.connect(socketURL, options);

//     client1.on('connect', function(data){
//       client1.emit('newUser', chatUser1);
//     });
//     client4.on('connect', function(data){
//       client4.emit('newUser', chatUser4);
//     });
//     client12.on('connect', function(data){
//       client12.emit('newUser', chatUser12);
//     });
//     client13.on('connect', function(data){
//       client13.emit('newUser', chatUser13);
//     });
//     client14.on('connect', function(data){
//       client14.emit('newUser', chatUser14);
//     });
//     setTimeout(function(){client4.emit('message', {msg:singlemsg4, to:'siotest01id', role:'patient'})}, 1000);
//   });

//   after(function(){
//     client1.disconnect();
//     client4.disconnect();
//     client12.disconnect();
//     client13.disconnect();
//     client14.disconnect();

//     status1 = '';
//     status4 = '';
//     status12 = '';
//     status13 = '';
//     status14 = '';
//   });

//   it('4发1收，患者对医生，应该只有1app医生端能收到',function(done){
//     client4.on('messageRes', function(data){
//       status4 = data.msg.status;
//     });
//     client1.on('getMsg', function(data){
//       status1 = data.msg.status;
//     });
//     client12.on('getMsg', function(data){
//       status12 = data.msg.status;
//     }); 
//     client13.on('getMsg', function(data){
//       status13 = data.msg.status;
//     });
//     client14.on('getMsg', function(data){
//       status14 = data.msg.status;
//     });
//     setTimeout(function(){
//       success.should.equal(status4);
//       success.should.equal(status1);
//       success.should.not.equal(status12);
//       success.should.not.equal(status13);
//       success.should.not.equal(status14); 
//       done();  
//     },2000);

//   });

// });

// describe("单聊并发测试",function(){
//   before(function(){
  var sendcount,getcount,rescount
    (function next(i){
      if(i == 0){
        return console.log("pool created");
      }
      console.log(i);
      var s = io.connect(socketURL, options)
      s.on('getMsg')
      s.on('messageRes')
      flag
      setInterval(每个s过多久发一个,10000)
      clientPool.push(s);

      next(i - 1);
    })(POOL_LIMIT);

//     // clientPool.forEach(function(s, i){
//       let i=0;
//     for(let s of clientPool){

//       setTimeout(function(){
//         s.emit('newUser', {'user_name':'siotestp'+i,'user_id':'siotestp'+i+'id','client':'patient'});
//         console.log('newUser no.', i++);
//       }, 500* i);
//     }
//     // });

//   });

//   it('1个医生给一群患者依次发消息',function(done){
//     client1 = io.connect(socketURL, options);
//     client1.emit('newUser', chatUser1);
//     let j = 0;
//     var timer = setInterval(function(){
//       console.log('shou: '+ j);
//     },500);

//     setTimeout(function(){
//       clearInterval(timer);
//     },10000);

//     clientPool.forEach(function(s, i){
//       setTimeout(function(){
//         client1.emit('message', {
//           msg:{
//             clientType:'doctor',
//             contentType:'text',
//             fromID:'siotest01id',
//             fromName:'siotest01',
//             fromUser:{
//             },
//             targetID:'siotestp'+i+'id',
//             targetName:'siotestp'+i,
//             targetType:'single',
//             status:'send_going',
//             createTimeInMillis: Date.now(),
//             newsType:'11',
//             targetRole:'patient',
//             content:'hello',
//             test:true
//           },
//           to:'siotestp'+i+'id',
//           role:'doctor'
//         });
//         s.on('getMsg', function(data){
//           success.should.equal(data.msg.status);
//           j++;
//           console.log(j)
//         });

//       }, 100 * i);
//     });

//   });
// })



describe("单聊长时测试",function(){
  before(function(){
    s = 0;
    r = 0;
    client1 = io.connect(socketURL, options);
    client1.on('connect', function(data){
      console.log('client1 connect ok')
      client1.emit('newUser', chatUser1);
    });
    client2 = io.connect(socketURL, options);
    client2.on('connect', function(data){
        console.log('client2 connect ok')
        client2.emit('newUser', chatUser2);
    });

  });
  it('app医生1对app患者2', function(done){   
    if(s==0){
      
    setTimeout(function(){
      console.log('new timer!')
     sendtimer = setInterval(function(){
     client1.emit('message', {msg:singlemsg1, to:'siotest02id', role:'doctor'})
     },10000); //10秒一次发送   
      console.log('start listening!')
      client1.on('messageRes', function(data){
       success.should.equal(data.msg.status);
       console.log('send:'+ s++)
      });
      client2.on('getMsg', function(data){
       success.should.equal(data.msg.status);
       console.log('receive:'+ r++)
      });
    },5000); 
    };

 
  });

  after(function(){
    clearInterval(sendtimer);
    client1.disconnect();
    client2.disconnect();
  });


 
  });