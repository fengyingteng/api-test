
// 密码保存
var handleSavePassword = () => {
    $(document).on('click', '#savePassword', (e) => {
        checkedPwd()
    })
}
var savePassword = () => {
    var data = getPassword()
    postData('/api/savePassword', data, (err, result) => {
        if (err) {
            alert(err)
        } else {
            if (result.res > 0) {
                alert('密码保存成功！')
            } else{
                alert('密码保存失败！')
            }
        }
        $('#codePassword').html(JSON.stringify(result, null, 2))
    })
}

//密码检测
var checkedPwd = () => {
    var data = getPassword();
    console.log('data test', data)
    let checkedData = {
        account: data.account,
        oldPwd : data.oldPwd,
        access_token: data.access_token
    }
    postData('/api/checkPassword',checkedData, (err, result) => {
        if(err) {
            alert(err)
        } else {
            console.log('check result', result)
            if (result.res > 0) {
                savePassword()
            } else {
                alert('旧密码不对， 请重新输入！')
            }
        }
    })
}
//获取修改密码数据
var getPassword = () =>{
    var account = $('#passAgentNum').val().trim();
    var oldPwd = md5($('#oldPwd').val().trim());
    var newPwd = md5($('#newPwd').val().trim());
        if (account&&oldPwd&&newPwd) {
            return {
                account: account,
                oldPwd:oldPwd,
                newPwd:newPwd,
                access_token: localStorage.getItem('access_token')
            }
        } else {
            alert('缺少必要的参数！')
            return;
        }
}
//自动获取host
var getHost = () => {
    var _protocol = localStorage.getItem('protocol')
    if (!_protocol) {
        $('.protocol').focus()
        $('#imgCode').hide()
        $('.getCap').show()
        return;
    } else {
        $('.protocol').val(_protocol)
        getCaptchaCode()
        $('#imgCode').show()
        $('.getCap').hide()
    }
}
//输入域名
var inputOnchange = () => {
    $('#protocol').on('input', function(e) {
        let _value = e.target.value;
        localStorage.setItem('protocol',_value) 
        getHost()
    })
}
//获取验证码
var getCaptchaCode = () => {
    getData('/api/getCaptcha', null, (err, result) => {
        if (err) {
            alert(err)
        } else {
            $('#imgCode').attr('src', result.captchaPng)
            $('#captchaToken').val(result.captchaToken)
            localStorage.setItem('captchapng',result.captchaPng)
            localStorage.setItem('captchaToken', result.captchaToken)
        }
    })
} 
// 点击获取验证码
var getLoginData = () => {
  var account = $('#account').val().trim();
  var password = $('#password').val().trim();
  var captcha = $('#captcha').val().trim();
    if(account && password &&captcha ) {
        return {
            account: account,
            password:md5(password),
            captcha: captcha,
            captcha_token: localStorage.getItem('captchaToken')
        }
    } else {
        alert('缺少必要的参数！')
        return ;
    }
}
//坐席登录
var loginAction = () => {
  
   $('#LoginInBtn').click(function(){
       loginApi()
   })
}
//登录获取验证码
var loginApi = () => {
    console.log('get data')
    var data = getLoginData()
    let _d = $.isEmptyObject(data)
    if (_d) {
        return 
    }
    postData('/api/sysUserSignIn', data, (err, result) => {
        if (err) {
            alert(err)
        } else {
            if (result&&result.res> 0) {
                alert('登录成功！')
                stateTips(result)
                initSocket()
            } else {
                alert('登录失败！')
                getCaptchaCode()
            }
            $('#codeLogin').html(JSON.stringify(result, null, 2))
        }
    })
}
// 状态提示相关
var stateTips = (result) => {
           //登录状态 0 未登录 1已登录
           let signState = result.user.signState
           let signTip = '', lineStateTip = '', extenState = '';
           if(signState == 0) {
               signTip = '未登录'
           } else if (signState == 1) {
               signTip = '登录'
           }
           $('#signState').html(signTip)
           //语音坐席状态 -1上线，0 空闲,-2未知状态，1振铃，2通话，3保持
           let extensionState = result.user.extensionState
           if (extensionState == -2) {
               extenState='未知状态'
           } else  if (extensionState == -1) {
               extenState='上线'
           } else  if (extensionState == 0) {
               extenState='空闲'
           }else  if (extensionState == 1) {
               extenState='振铃'
           }else  if (extensionState == 2) {
               extenState='通话'
           } else  if (extensionState == 3) {
               extenState='保持'
           }
           $('#extensionState').html(extenState)
           //在线坐席状态 1表示在线，2表示挂起
           let lineState = result.user.lineState
           if (lineState == 1) {
               lineStateTip = '在线'
           } else if (lineState == 2) {
               lineStateTip = '挂起'
           }
           $('#lineState').html(lineStateTip)
           localStorage.setItem('access_token', result.jwt)
           // 十秒钟发送一次心跳
           timer = setInterval(() => {
               getHeart()
           },10*1000)
}
//获取心跳
var getHeart =() => {
    var data = {
        access_token: localStorage.getItem('access_token')
    }
    getData('/api/callServer',data, (err, result) => {
        if (err) {
            alert('心跳发送失败！')
            $('#heartState').html('心跳关闭')
        } else{
            if (result.res> 1) {
            $('#heartState').html('心跳打开')
            }
        }
    })
}
var getSiteUrl = () => {
    var ptl = $('.protocol').val().trim();
    if (!ptl) {
        alert('请输入正确的主机地址')
        return null;
    }
    if (ptl.indexOf('//') == -1) {
        alert('请输入正确的主机地址')
        return null
    }
    var ptl_arr = ptl.split(':')
    if(ptl_arr && ptl_arr.length == 3) {
        var _http = ptl_arr[0]
        if (!_http || _http != 'http'&& _http != 'https') {
            alert('访问的主机地址 => 协议有错误')
            return null;
        }
        var _host = ptl_arr[1]
        if(!_host) {
            alert('访问的主机地址 => host地址填写错误')
            return null;  
        }
        var _port= ptl_arr[2]
        if(!_port) {
            alert('访问的主机地址 => 端口填写填写有误')
            return null;
        }
        localStorage.setItem('protocol',ptl)
        return ptl;

    } else {
        alert('请输入正确的主机地址')
        return null;
    }
}
//自动登录
var handleAutoLogin = () => {
    $(document).on('click', '#autoLoginBtn', () => {
        let _access_token = localStorage.getItem('access_token') 
        var data = {
            access_token: _access_token
        }
        if (_access_token) {
            getData('/api/authByToken', data, (err, result) => {
                if (err) {
                    alert(err)
                } else {
                    if (result&& result.res>0){
                        alert('自动登录成功！')
                        stateTips(result)
                        initSocket()
                    } else{
                        alert('自动登录失败！')
                    }
                }
                $('#codeAutoLogin').html(JSON.stringify(result, null, 2))
            })
        } else {
            alert('获取不到token， 请先手动登录！')
        }
        
    })
}
//坐席登出
var handleSignOutClick = () => {
    $(document).on('click', '#signOut', (e)=> {
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData('/api/loginOut',data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if (result.res > 0) {
                    alert('坐席登出成功！')
                    localStorage.removeItem('access_token')
                    socket.disconnect()
                    socket.close()
                    socket = null;
                } else {
                    alert('坐席登出失败！')
                }
                $('#codesignOut').html(JSON.stringify(result, null, 2))
            }
        })
    })
}
// cti上线
var ctiLoginClick = () => {
    $(document).on('click', '#ctiSignIn', (e) => {
        var agentNum = $('#ctiAgentNum').val().trim() 
        var exten = $('#exten').val().trim()
        var initStatus = $('#initStatus').val().trim()
        if (!agentNum ||!exten || !initStatus) {
            alert('缺少必要的参数！')
            return;
        }
        var data = {
            agentNum,
            exten,
            initStatus,
            access_token:localStorage.getItem('access_token')
        }
        postData('/api/ctiSignIn', data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if(result.res > 0 ) {
                    alert('上线成功！')
                    let _tips = ''
                    switch(initStatus) {
                        case -2:
                            return _tip = '未知'
                        case -1:
                            return _tip = '离线'
                        case 0:
                            return _tip = '空闲'
                        case 1:
                            return _tip = '振铃'
                        case 2:
                            return _tip = '通话'
                        case 3:
                            return _tip = '保持'
                        case 4:
                            return _tip = '后处理'
                        case 5:
                            return _tip = '被占用'
                        case 6:
                            return _tip = '忙碌'
                        case 7:
                            return _tip = '离开'
                        case 8:
                            return _tip = '预览外呼中'
                        case 9:
                            return _tip = '监控'
                        case 10:
                            return _tip = '呼出中'
                    }
                    $('#extensionState').html(_tips)
                } else{
                    alert('上线失败！')
                }
                $('#codeCtiSignIn').html(JSON.stringify(result, null, 2))
            }
        }) 
    })
}
//外呼
var clickOutCall = () => {
    $(document).on('click', '#manualCallout', (e) => {
        var callAgentNum = $('#callAgentNum').val().trim()
        var customerNum = $('#customerNum').val().trim()
        if(!callAgentNum || !customerNum) {
            alert('缺少必要的参数！')
            return ;
        }
        var data = {
            callAgentNum,
            customerNum,
            access_token:localStorage.getItem('access_token')
        }
        postData(' /api/manualCallout',data, (err, result) => {
            if(err) {
                alert(err)
            } else {
                if(result.res > 0) {
                    alert('外呼成功！')
                } else{
                    alert('外呼失败！')
                }
                $('#codeManualCallout').html(JSON.stringify(result, null, 2))
            }
        })
    })
}
// 获取坐席组
var handleGetGroupList = () => {
    $(document).on('click', '#getGroupListBtn', (e) => {
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        postData('/api/getGroupList', data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if(result.res>0) {
                    alert('获取坐席组数据成功！')
                } else{
                    alert('获取数据失败:' + result.msg)
                }
            }
            $('#getGroupList').html(JSON.stringify(result, null, 2)) 
        })
    })
}
//获取所有坐席
var handleGetAllGroupList = () => {
    $(document).on('click', '#getAllGroupListBtn', (e) => {
        var pageCount = $('#pageCount').val().trim() || 20;
        var pageNum = $("#pageNum").val().trim() || 1
        var data = {
            pageCount: pageCount,
            pageNum: pageNum,
            access_token: localStorage.getItem('access_token')
        }
        postData('/api/getUserListByPage', data, (err, result) => {
            if(err) {
                alert(err)
            } else {
                if (result.res> 0) {
                    alert('获取所有坐席数据成功！')
                } else{
                    alert('获取数据失败:' + result.msg)
                }
            }
            $('#getAllGroupList').html(JSON.stringify(result, null, 2)) 
        })
    })
}
// 在线坐席上下线
var handleLineState = () => {
    $(document).on('click', '#lineStateBtn',() =>{
        var _lineState = $('#onLineState').val().trim()
        if (_lineState) {
            var data = {
                lineState: _lineState,
                access_token: localStorage.getItem('access_token')
            }
            postData('/api/setUserState', data, (err, result) => {
                if (err) {
                    alert(err)
                } else {
                    if(result.res>0) {
                        alert('设置状态成功！')
                        let _lineTips = ''
                        if (_lineState == 1) {
                            _lineTips = '上线'
                        } else if(_lineState == 2) {
                            _lineTips = '下线'
                        }
                        $('#lineState').html(_lineTips)
                    } else{
                        alert('获取数据失败:' + result.msg)
                    }
                }
                $('#getLineState').html(JSON.stringify(result, null, 2))  
            })
        } else {
            alert('请输入在线状态！')
        }
    })
}
//获取当前在线坐席聊天室列表
var handleGetRooms =() => {
    $(document).on('click', '#getRoomsBtn', () => {
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData('/api/getRooms', data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if(result.res>0) {
                    alert('获取数据成功！')
                } else{
                    alert('获取数据失败:' + result.msg)
                }
            }
            $('#getRooms').html(JSON.stringify(result, null, 2))  
        })  
    })
}
//获取当前语音服务通话列表
var handleGetRooms =() => {
    $(document).on('click', '#getVoiceRoomsBtn', () => {
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData('/api/getVoiceRooms', data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if(result.res == 0) {
                    alert('暂无数据！')
                } else if( result.res>0) {
                    alert('获取数据成功！') 
                } else{
                    alert('失败，入参的参数不合法！' )
                }
            }
            $('#getVoiceRooms').html(JSON.stringify(result, null, 2))  
        })  
    })
}
//获取语音服务历史通话列表
var handleGetVoiceRoomsHistory =() => {
    $(document).on('click', '#getVoiceRoomsHistoryBtn', () => {
        var _custId = $('#custIdText').val().trim();
        if (_custId) {
            var data = {
                custId:_custId,
                access_token: localStorage.getItem('access_token')
            }
            getData('/api/getVoiceRoomsHistory', data, (err, result) => {
                if (err) {
                    alert(err)
                } else {
                    if( result.res>0) {
                        alert('获取数据成功！') 
                    } else{
                        alert('获取数据失败！' )
                    }
                }
                $('#getVoiceRoomsHistory').html(JSON.stringify(result, null, 2))  
            }) 
        } else {
            alert('请输入客户的识别ID')
        }
    })
}
//获取当前在线的在线坐席
var handleGetAgent =() => {
    $(document).on('click', '#getAgentBtn', () => {
        var queryText = $('#custIdText').val().trim() || '';
        var queryType = $('#queryType').val().trim() || 'inline'
        var data = {
            queryText:queryText,
            queryType:queryType,
            access_token: localStorage.getItem('access_token')
        }
        postData('/api/getAgent', data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('获取数据成功！') 
                } else{
                    alert('获取数据失败！' )
                }
            }
            $('#getAgentCode').html(JSON.stringify(result, null, 2))  
        }) 
        
    })
}
//获取坐席侧会话里的消息
var handleGetUserMsgByRid =() => {
    $(document).on('click', '#getUserMsgByRidBtn', () => {
        var Rid = $('#Rid').val().trim();
        var last = $('#last').val().trim() | '' ;
        var sessionId = $('#sessionId').val().trim();
        if(!Rid || !sessionId ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            sessionId:sessionId,
            last:last,
            Rid:Rid,
            access_token: localStorage.getItem('access_token')
        }
        postData('/api/getUserMsgByRid', data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('获取数据成功！') 
                } else{
                    alert('获取数据失败！' )
                }
            }
            $('#getUserMsgByRid').html(JSON.stringify(result, null, 2))  
        }) 
        
    })
}
// 语音坐席下线
var handleCtiSignOut =() => {
    $(document).on('click', '#ctiSignOut', () => {
        var agentNum = $('#ctiOutAgentNum').val().trim();
        if(!agentNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/ctiSignOut/${agentNum}`, data, (err, result) => {
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('坐席下线成功！')
                    $('#extensionState').html('下线')
                } else{
                    alert('获取数据失败:' + result.msg )
                }
            }
            $('#codeCtiSignOut').html(JSON.stringify(result, null, 2))  
        }) 
        
    })
}
//状态切换
var handleCtiStateChange =() => {
    $(document).on('click', '#changeStatus', () => {
        var agentNum = $('#changeAgentNum').val().trim();
        var toStatus = $('#toStatus').val().trim();
        if(!agentNum || !toStatus) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/changeStatus/${agentNum}/${toStatus}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('状态切换成功！') 
                } else{
                    alert('状态切换失败:' + result.msg )
                }
            }
            $('#codeChangeStatus').html(JSON.stringify(result, null, 2))  
        }) 
        
    })
}
//挂断电话
var handleHandUp =() => {
    $(document).on('click', '#HandUpBtn', () => {
        var agentID = $('#agentID').val().trim();
        var relationUuid = $('#relationUuid').val().trim();
        var agentUuid = $('#agentUuid').val().trim();
        if(!agentID || !relationUuid ||!agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            relationUuid,
            agentUuid,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/hangUp`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('挂断成功！') 
                } else{
                    alert('挂断失败:' + result.msg )
                }
            }
            $('#codeHandUp').html(JSON.stringify(result, null, 2))  
        })   
    })
}
// 语音坐席评分
var  handleEvaluate = () => {
    $(document).on('click','#EvaluateBtn', (e) => {
        var agentID = $('#evaluateAgentID').val().trim();
        var callUuid = $('#callUuid').val().trim();
        var language = $('#language').val().trim().toLowerCase() || 'cn';
        if(!agentID || !callUuid ||!language) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            // agentID,
            // callUuid,
            // language,
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/evaluate/${agentID}/${callUuid}/${language}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('评分成功！') 
                } else{
                    alert('评分失败:' + result.msg )
                }
            }
            $('#codeEvaluate').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//语音坐席静音
var  handleMuteVoice = () => {
    $(document).on('click','#MuteVoiceBtn', (e) => {
        var agentNum = $('#muteAgentNum').val().trim();
        var agentUuid = $('#muteAgentUuid').val().trim();
        if(!agentNum || !agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            // agentNum,
            // agentUuid,
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/muteVoice/${agentNum}/${agentUuid}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('静音成功！') 
                } else{
                    alert('静音失败:' + result.msg )
                }
            }
            $('#codeMuteVoice').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//取消静音
var  handleUnMuteVoice = () => {
    $(document).on('click','#unMuteAgentUuidBtn', (e) => {
        var agentNum = $('#unMuteAgentNum').val().trim();
        var agentUuid = $('#unMuteAgentUuid').val().trim();
        if(!agentNum || !agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            // agentNum,
            // agentUuid,
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/unMuteVoice/${agentNum}/${agentUuid}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('取消静音成功！') 
                } else{
                    alert('取消静音失败:' + result.msg )
                }
            }
            $('#codeunMuteAgentUuid').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//保持
var  handleHoldVoice = () => {
    $(document).on('click','#HoldVoiceBtn', (e) => {
        var agentNum = $('#HoldVoiceAgentNum').val().trim();
        var agentUuid = $('#HoldVoiceAgentUuid').val().trim();
        if(!agentNum || !agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            // agentNum,
            // agentUuid,
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/holdVoice/${agentNum}/${agentUuid}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('保持成功！') 
                } else{
                    alert('保持失败:' + result.msg )
                }
            }
            $('#codeunHoldVoice').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//取消保持
var  handleUnHoldVoice = () => {
    $(document).on('click','#UnHoldVoiceBtn', (e) => {
        var agentNum = $('#UnHoldVoiceAgentNum').val().trim();
        var agentUuid = $('#UnHoldVoiceAgentUuid').val().trim();
        if(!agentNum || !agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            // agentNum,
            // agentUuid,
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/unholdVoice/${agentNum}/${agentUuid}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('取消保持成功！') 
                } else{
                    alert('取消保持失败:' + result.msg )
                }
            }
            $('#codeunUnHoldVoice').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
// 监控相关处理
var  handleMonitorHandle = () => {
    $(document).on('click','#UnHoldVoiceBtn', (e) => {
        var agentID = $('#MonitorHandleAgentNum').val().trim();
        var cmdType = $('#cmdType').val().trim();
        var targetAgentNum = $('#targetAgentNum').val().trim();
        if(!agentID || !targetAgentNum || !cmdType) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            cmdType,
            targetAgentNum,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/monitorHandle`, data, (err, result) => {
            // console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('监控设置成功！') 
                } else{
                    alert('监控设置失败！' )
                }
            }
            $('#codeMonitorHandle').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//三方
var  handleThreeWay = () => {
    $(document).on('click','#ThreeWayBtn', (e) => {
        var agentID = $('#ThreeWayAgentID').val().trim();
        var agentCallUuid = $('#agentCallUuid').val().trim();
        var trdAgentNum = $('#trdAgentNum').val().trim();
        var trdIsOutbound = $('#trdIsOutbound').val().trim();
        if(!agentID || !trdAgentNum || !trdIsOutbound ||!agentCallUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            trdAgentNum,
            trdIsOutbound,
            agentCallUuid,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/threeWayHandle`, data, (err, result) => {
            // console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('三方设置成功！') 
                } else{
                    alert('三方设置失败！' )
                }
            }
            $('#codeThreeWay').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//取消三方
var  handleUnThreeWay = () => {
    $(document).on('click','#UnThreeWayBtn', (e) => {
        var agentID = $('#unThreeWayAgentID').val().trim();
        var agentCallUuid = $('#unThreeWayAgentCallUuid').val().trim();
        if(!agentID || !agentCallUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/getCtiAgentRole/${agentNum}`, data, (err, result) => {
            // console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('取消三方设置成功！') 
                } else{
                    alert('取消三方设置失败！' )
                }
            }
            $('#codeUnThreeWay').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//获取坐席的监控权限
var  handleGetCtiAgentRole = () => {
    $(document).on('click','#GetCtiAgentRoleBtn', (e) => {
        var agentNum = $('#ctiAgentRoleAgentNum').val().trim();
        if(!agentNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/getCtiAgentRole/${agentNum}`, data, (err, result) => {
            // console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result.res>0) {
                    alert('获取坐席监控权限成功！') 
                } else{
                    alert('获取坐席监控权限失败！' )
                }
            }
            $('#codeGetCtiAgentRole').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.16.	获取坐席组列表
var  handleGetAgentGroupList = () => {
    $(document).on('click','#GetAgentGroupListBtn', (e) => {
        var agentNum = $('#getAgentGroupListAgentNum').val().trim();
        if(!agentNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getAgentGroupList').show()
        getData(`/api/getAgentGroupList/${agentNum}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result && result.res>0) {
                    alert('获取坐席组列表成功！') 
                } else{
                    alert('获取坐席组列表失败！' )
                }
            }
            $('.getAgentGroupList').hide()
            $('#codeGetAgentGroupList').html(JSON.stringify(result, null, 2))  
        }) 
    })
}

//6.17.	根据队列号查询队列成员
var  handleGetAgentOfQueue = () => {
    $(document).on('click','#GetAgentOfQueueBtn', (e) => {
        var agentNum = $('#getAgentOfQueueAgentNum').val().trim();
        var queueNum = $('#queueNum').val().trim();
        if(!agentNum || !queueNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getAgentOfQueue').show()
        getData(`/api/getAgentOfQueue/${agentNum}/${queueNum}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                if( result&&result.res>0) {
                    alert('获取坐席组列表成功！') 
                } else{
                    alert('获取坐席组列表失败！' )
                }
            }
            $('.getAgentOfQueue').hide()
            $('#codeGetAgentOfQueue').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.18.	获取某个坐席组的成员
var  handleGetAgentsOfAgentGroup = () => {
    $(document).on('click','#GetAgentsOfAgentGroupBtn', (e) => {
        var agentNum = $('#AgentGroupAgentNum').val().trim();
        var agentGroupNum = $('#agentGroupNum').val().trim();
        if(!agentNum || !agentGroupNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getAgents').show()
        getData(`/api/getAgentsOfAgentGroup/${agentNum}/${agentGroupNum}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {
                
                if( result && result.res>0) {
                    
                    alert('获取某个坐席组的成员成功！') 
                } else{
                    alert('获取某个坐席组的成员失败！' )
                }
            }
            $('.getAgents').hide()
            $('#codeGetAgentsOfAgentGroup').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.19.	获取坐席的监控状态
var  handleGetAgentMonitorInfo = () => {
    $(document).on('click','#GetAgentMonitorInfoBtn', (e) => {
        var agentNum = $('#MonitorInfoAgentNum').val().trim();
        var agentsStr = $('#agentsStr').val().trim();
        if(!agentNum || !agentsStr) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentNum,
            agentsStr,
            access_token: localStorage.getItem('access_token')
        }
        $('.monitorInfo').show()
        postData(`/api/GetAgentMonitorInfo`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取坐席的监控状态成功！') 
                } else{
                    alert('获取坐席的监控状态失败！' )
                }
            }
            $('.monitorInfo').hide()
            $('#codeGetAgentMonitorInfo').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.20.	获取队列统计信息
var  handleGetQueueStatis = () => {
    $(document).on('click','#GetQueueStatisBtn', (e) => {
        var agentNum = $('#GetQueueStatisAgentNum').val().trim();
        var queueNumLstStr = $('#queueNumLstStr').val().trim();
        if(!agentNum || !queueNumLstStr) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getQueueStatis').show()
        getData(`/api/getQueueStatis/${agentNum}/${queueNumLstStr}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取队列统计信息成功！') 
                } else{
                    alert('获取队列统计信息失败！' )
                }
            }
            $('.getQueueStatis').hide()
            $('#codeGetQueueStatis').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.21.	获取在线的坐席
var  handleGetCtiOnlineAgent = () => {
    $(document).on('click','#GetCtiOnlineAgentBtn', (e) => {
        var agentNum = $('#GetCtiOnlineAgentAgentNum').val().trim();
        if(!agentNum ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getCtiOnlineAgent').show()
        getData(`/api/getCtiOnlineAgent/${agentNum}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取队列统计信息成功！') 
                } else{
                    alert('获取队列统计信息失败！' )
                }
            }
            $('.getCtiOnlineAgent').hide()
            $('#codeGetCtiOnlineAgent').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.22.	获取IVR Profile列表
var  handleGetIvrProfileList = () => {
    $(document).on('click','#GetIvrProfileListBtn', (e) => {
        var agentID = $('#GetIvrProfileListAgentId').val().trim();
        if(!agentID ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getIvrProfileList').show()
        getData(`/api/getIvrProfileList/${agentID}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取IVR Profile列表成功！') 
                } else{
                    alert('获取IVR Profile列表失败！' )
                }
            }
            $('.getIvrProfileList').hide()
            $('#codeGetIvrProfileList').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.23.	获取IVR列表
var  handleGetIvrList = () => {
    $(document).on('click','#GetIvrListBtn', (e) => {
        var agentID = $('#GetIvrListAgentId').val().trim();
        if(!agentID ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        $('.getIvrList').show()
        getData(`/api/getIvrList/${agentID}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取IVR列表成功！') 
                } else{
                    alert('获取IVR列表失败！' )
                }
            }
            $('.getIvrList').hide()
            $('#codeGetIvrList').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.24.	询问
var  ConsultHandle = () => {
    $(document).on('click','#ConsultHandleBtn', (e) => {
        var agentID = $('#ConsultAgentID').val().trim();
        var agentCallUuid = $('#consultAgentCallUuid').val().trim();
        var consulteeIsOutbound = $('#consulteeIsOutbound').val().trim();
        var consulteeIsOutbound = $('#consulteeIsOutbound').val().trim();
        if(!agentID ||!agentCallUuid || !consulteeIsOutbound || !consulteeIsOutbound ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            agentCallUuid,
            consulteeIsOutbound,
            consulteeIsOutbound,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/consultHandle`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('询问成功！') 
                } else{
                    alert('询问失败！' )
                }
            }
            $('#codeConsultHandle').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.25.	取消询问
var  ConsultCancelHandle = () => {
    $(document).on('click','#ConsultCancelBtn', (e) => {
        var agentID = $('#ConsultCancelAgentId').val().trim();
        var agentCallUuid = $('#ConsultAgentCallUuid').val().trim();
    
        if(!agentID ||!agentCallUuid ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            agentCallUuid,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/consultHandle`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('取消询问成功！') 
                } else{
                    alert('取消询问失败！' )
                }
            }
            $('#codeConsultCancel').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//询问转
var  ConsultTransferHandle = () => {
    $(document).on('click','#ConsultTransferBtn', (e) => {
        var agentID = $('#ConsultTransferAgentId').val().trim();
        var agentCallUuid = $('#TransferAgentCallUuid').val().trim();
    
        if(!agentID ||!agentCallUuid ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            agentCallUuid,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/consultTransfer`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('取消询问成功！') 
                } else{
                    alert('取消询问失败！' )
                }
            }
            $('#codeConsultTransfer').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.27.	盲转
var  BlindTransferHandle = () => {
    $(document).on('click','#BlindTransferBtn', (e) => {
        var agentID = $('#blindAgentId').val().trim();
        var customerCallUuid = $('#customerCallUuid').val().trim();
        var transfereeIsOutbound = $('#transfereeIsOutbound').val().trim();
        var transfereeAgentNum = $('#transfereeAgentNum').val().trim();
        
        if(!agentID ||!customerCallUuid 
            ||!transfereeIsOutbound || !transfereeAgentNum) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            customerCallUuid,
            transfereeIsOutbound,
            transfereeAgentNum,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/blindTransfer`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('盲转成功！') 
                } else{
                    alert('盲转失败！' )
                }
            }
            $('#codeBlindTransfer').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.28.	获取坐席状态 （有bug）
var  CtiAgentStatusHandle = () => {
    $(document).on('click','#CtiAgentStatusBtn', (e) => {
        var obj = $('#ctiAgentObj').val().trim();
        var agent = $('#ctiAgentAgent').val().trim();
        var groupby = $('#ctiAgentGroupby').val().trim();
        var page = $('#ctiAgentPage').val().trim() || '1';
        var rows = $('#ctiAgentRows').val().trim();
        var _start = $('#ctiAgentStart').val().trim();
        var _end = $('#ctiAgentEnd').val().trim();
        var start = moment(_start).format('YYYY-MM-DD 00:00:00')
        var end = moment(_end).format('YYYY-MM-DD HH:mm:ss')
        
        if( !obj 
            ||!agent 
            ||!groupby 
            ||!page 
            ||!rows 
            ||!start 
            ||!end) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            obj,
            agent,
            groupby,
            page,
            rows,
            start,
            end,
            access_token: localStorage.getItem('access_token')
        }
        postData(`api/ctiAgentStatusTotalList`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取状态成功！') 
                } else{
                    alert('获取状态失败！' )
                }
            }
            $('#codeCtiAgentStatus').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.29.	坐席互拨
var  InternalCalHandle = () => {
    $(document).on('click','#InternalCalBtn', (e) => {
        var agentID = $('#InternalCalAgentId').val().trim();
        var calledAgentNum = $('#calledAgentNum').val().trim();
    
        if(!agentID ||!calledAgentNum ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            calledAgentNum,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/internalCall`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('坐席互拨成功！') 
                } else{
                    alert('坐席互拨失败！' )
                }
            }
            $('#codeInternalCal').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.30.	重置密码
var  ResetPasswordHandle = () => {
    $(document).on('click','#ResetPasswordBtn', (e) => {
        var openId = $('#ResetPasswordopenId').val().trim();
        var oldPwd = $('#calledOldPwd').val().trim();
    
        if(!openId ||!oldPwd ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            openId,
            oldPwd,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/resetPasswordToDefault`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('重置密码成功！') 
                } else{
                    alert('重置密码失败！' )
                }
            }
            $('#codeResetPassword').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//6.31.	队列转交
var  ResetPasswordHandle = () => {
    $(document).on('click','#QueueTransferBtn', (e) => {
        var agentID = $('#QueueTransferAgentID').val().trim();
        var customerCallUuid = $('#queueCustomerCallUuid').val().trim();
        var queueNum = $('#queueQueueNum').val().trim();
    
        if(!agentID ||!customerCallUuid ||!queueNum ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            customerCallUuid,
            queueNum,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/queueTransfer`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('队列转交成功！') 
                } else{
                    alert('队列转交失败！' )
                }
            }
            $('#codeQueueTransfer').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//坐席转交 
var  AgentTransferHandle = () => {
    $(document).on('click','#AgentTransferBtn', (e) => {
        var agentID = $('#AgentTransferAgentID').val().trim();
        var customerCallUuid = $('#agentCustomerCallUuid').val().trim();
        var transfereeIsOutbound = $('#agentTransfereeIsOutbound').val().trim();
        var transfereeAgentNum = $('#agentTransfereeAgentNum').val().trim();
    
        if(!agentID ||!customerCallUuid ||!transfereeIsOutbound ||!transfereeAgentNum ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentID,
            customerCallUuid,
            transfereeIsOutbound,
            transfereeAgentNum,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/agentTransfer`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('坐席互转成功！') 
                } else{
                    alert('坐席互转失败！' )
                }
            }
            $('#codeAgentTransfer').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//根据队列获取客户排队情况 
var  GetCustomerQueueHandle = () => {
    $(document).on('click','#GetCustomerQueueBtn', (e) => {
        var agentNum = $('#GetCustomerQueueAgentNum').val().trim();
        var queueNumLstStr = $('#getCustomerQueueNumLstStr').val().trim();
     
        if(!agentNum ||!queueNumLstStr ) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            agentNum,
            queueNumLstStr,
            access_token: localStorage.getItem('access_token')
        }
        postData(`/api/cti/getCustomerQueue`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('根据队列获取客户排队情况成功！') 
                } else{
                    alert('根据队列获取客户排队情况失败！' )
                }
            }
            $('#codeGetCustomerQueue').html(JSON.stringify(result, null, 2))  
        }) 
    })
}
//获取呼叫详情 
var  GetDetailCallInfoHandle = () => {
    $(document).on('click','#GetDetailCallInfoBtn', (e) => {
        var agentUuid = $('#GetDetailCallInfoAgentUuid').val().trim();
        if(!agentUuid) {
            alert('缺少必要的参数')
            return;
        }
        var data = {
            access_token: localStorage.getItem('access_token')
        }
        getData(`/api/cti/getDetailCallInfoByCallUuid/${agentUuid}`, data, (err, result) => {
            console.log('result test', result)
            if (err) {
                alert(err)
            } else {  
                if( result && result.res>0) {    
                    alert('获取呼叫详情成功！') 
                } else{
                    alert('获取呼叫详情失败！' )
                }
            }
            $('#codeGetDetailCallInfo').html(JSON.stringify(result, null, 2))  
        }) 
    })
}

// 事件部分
// 初始化socket
var initSocket = () => {
    var siteUrl = getSiteUrl()
    var access_token = localStorage.getItem('access_token');
    socket = io.connect(`${siteUrl}?token=${access_token}`);
    var arr = []
    socket.on('CTIEVENT', (data) => {
        console.log('data socket', data)
        if (data&& data.cmdType) {
            arr.push(data.cmdType)
        } else if (data&& data.callInfo&&data.callInfo.cmdType) {
            arr.push(data.callInfo.cmdType)
        }
        //遍历数组
       let eventStr =  loopData(arr)
       $('#codeCtiEvent').html(eventStr)
    })
}
// 获取socket的事件
var loopData = (arr) => {
    let str = '<ul>'
    if (arr && arr.length) {
        for(let i = 0; i< arr.length; i++) {
            str += '<li>' +' data cmdType :  ' + arr[i] +'</li>'
        }
    }
    str += '<ul>'
    return str;
}
//清空监听结果
var clearCtiEventHandle = () => {
    $(document).on('click', '#clearCtiEventBtn', () => {
        $('#codeCtiEvent').html('')
    })
}
$(function() {
    var timer= null;
    var socket = null;
    //加载控制
    loading();  
    //api控制
    loginAction();
    //自动登录
    handleAutoLogin();
    clickOutCall();
    ctiLoginClick();
    getHost();
    inputOnchange();
    handleSignOutClick();
    handleSavePassword();
    handleGetGroupList();
    handleGetAllGroupList();
    handleLineState();
    handleGetRooms();
    handleGetVoiceRoomsHistory();
    handleGetAgent();
    handleGetUserMsgByRid();
    handleCtiSignOut();
    handleCtiStateChange();
    handleHandUp();
    handleEvaluate();
    handleMuteVoice();
    handleUnMuteVoice();
    handleUnHoldVoice();
    handleHoldVoice();
    handleMonitorHandle();
    handleUnThreeWay();
    handleGetAgentGroupList();
    handleGetCtiAgentRole();
    handleGetAgentOfQueue();
    handleGetAgentsOfAgentGroup();
    handleGetAgentMonitorInfo();
    handleGetQueueStatis();
    handleGetCtiOnlineAgent();
    handleGetIvrProfileList()
    handleGetIvrList();
    ConsultHandle();
    ConsultCancelHandle();
    ConsultTransferHandle()
    BlindTransferHandle()
    CtiAgentStatusHandle()
    InternalCalHandle()
    ResetPasswordHandle()
    AgentTransferHandle()
    GetCustomerQueueHandle()
    GetCustomerQueueHandle()
    GetDetailCallInfoHandle()
    clearCtiEventHandle()
})
var loading = () => {
    $('.getAgents').hide()
    $('.getAgentOfQueue').hide()
    $('.getAgentGroupList').hide()
    $('.monitorInfo').hide()
    $('.getQueueStatis').hide()
    $('.getCtiOnlineAgent').hide()
    $('.getIvrProfileList').hide()
    $('.getIvrList').hide()
}
//post方法封装
var postData = (url, data, callback) => {
    var site = getSiteUrl()
    if(!site){
        return callback('SITE_URL_ERROR')
    }
    $.ajax({
        url: site + url,
        data: data,
        type: 'POST',
        dataType: 'json',
        // timeout : 10000,
        contentType:'application/x-www-form-urlencoded',
        success: (result, status) => {
            console.log('result1 == ', result)
            return callback(null, result)
        },
        error: (xmlReq, status, err) => {
            console.log('err===', err)
            return callback(err)
        }
    })
}
//get方法封装
var getData = (url,data, callback) => {
    var site = getSiteUrl()
    if (!site) {
        return callback('SITE_URL_ERROR')
    }
   $.ajax({
        url: site + url, 
        type:'get',
        data: data,
        dataType: 'json',
        // timeout: 10000,
        contentType:'application/x-www-form-urlencoded',
        success: (result, status) => {
            console.log('result == ', result)
            return callback (null, result)
        },
        error: (xmlReq, status, err) => {
            console.log('err == ', err)
            return callback(err)
        }
    })
}
