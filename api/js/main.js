var main = () => {
    setConfig()         // 默认配置
    loginActionSet()    // 登录初始化
    ctiSignInSet()      // cti上线初始化
    manualCalloutSet()  // 外呼初始化
}

var setConfig = () => {
    $('.protocol').val('http').next().next().val('192.168.129.21').next().next().val('4018')
}

var getSiteUrl = () => {
    var ptl = $('.protocol')
    if (!ptl.val() || (ptl.val() != 'http' && ptl.val() != 'https')) {
        alert('访问的主机地址 => 协议填写有误')
        return null;
    }
    if (!ptl.next().next().val()) {
        alert('访问的主机地址 => host地址填写有误')
        return null;
    }
    if (!ptl.next().next().next().next().val()) {
        alert('访问的主机地址 => 端口填写填写有误')
        return null;
    }
    return ptl.val() + '://' + ptl.next().next().val() + ':' + ptl.next().next().next().next().val()
}

// 登录模块
var loginActionSet = () => {

    getCodeApi();
    $(document).on('click', '#login', (e) => {
        loginApi()
    })

    $(document).on('click', '#imgCode', (e) => {
        getCodeApi();
    })
}

var getLoginData = () => {
    return {
        account: $('#account').val(),
        password: md5($('#password').val()),
        captcha: $('#captcha').val(),
        captcha_token: $('#captchaToken').val()
    }
}

var loginApi = () => {
    var data = getLoginData()
    postData('/api/sysUserSignIn', data, (err, result) => {
        if (err) {
            alert(err)
        } else {
            if(result.res>0){
                alert('登录成功！')
                delete result.user
                localStorage.setItem('token', result.jwt)
            }else{
                alert('登录失败！')
                getCodeApi()
            }
            $('#codeLogin').html(JSON.stringify(result, null, 2))
        }
    })
}

var getCodeApi = () => {
    getData('/api/getCaptcha', null, (err, result) => {
        if (err) {
            alert(err)
        } else {
            $('#imgCode').attr('src', result.captchaPng)
            $('#captchaToken').val(result.captchaToken)
        }
    })
}

// cti上线模块
var ctiSignInSet  = () => {

    $(document).on('click', '#ctiSignIn', (e) => {
        ctiSignInApi()
    })
 
}

var getCtiSignInData = () => {
    return {
        agentNum: $('#agentNum').val(),
        exten: $('#exten').val(),
        initStatus: $('#initStatus').val(),
        access_token:localStorage.getItem('token')
    }
}

var ctiSignInApi = () => {
    var data = getCtiSignInData()
    postData('/api/ctiSignIn', data, (err, result) => {
        if (err) {
            alert(err)
        } else {
            if(result.res>0){
                alert('上线成功！')
            }else{
                alert('上线失败！')
            }
            $('#codeCtiSignIn').html(JSON.stringify(result, null, 2))
        }
    })
}

// 外呼模块
var manualCalloutSet  = () => {

    $(document).on('click', '#manualCallout', (e) => {
        manualCalloutApi()
    })
 
}

var getManualCalloutData = () => {
    return {
        agentNum: $('#agentNum').val(),
        customerNum: $('#customerNum').val(),
        customerDisplayNum: $('#customerDisplayNum').val(),
        access_token:localStorage.getItem('token')
    }
}

var manualCalloutApi = () => {
    var data = getManualCalloutData()
    postData('/api/manualCallout', data, (err, result) => {
        if (err) {
            alert(err)
        } else {
            if(result.res>0){
                alert('呼叫成功！')
            }else{
                alert('呼叫失败！')
            }
            $('#codeManualCallout').html(JSON.stringify(result, null, 2))
        }
    })
}

// 交互模块
var postData = (url, data, callback) => {
    var site = getSiteUrl()
    if (!site) {
        return callback('SITE_URL_ERROR')
    }
    $.ajax({
        url: site + url,
        data: data,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        success: function (result, status) {
            console.log('result1 == ', result)
            console.log('status == ', status)
            return callback(null, result)
        },
        error: function (xmlReq, status, err) {
            console.log('xmlReq == ', xmlReq)
            console.log('status == ', status)
            console.log('err == ', err)
            return callback(err)
        }
    })
}

var getData = (url, data, callback) => {
    var site = getSiteUrl()
    if (!site) {
        return callback('SITE_URL_ERROR')
    }
    $.ajax({
        url: site + url,
        data: data,
        type: 'get',
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        success: function (result, status) {
            console.log('result == ', result)
            console.log('status == ', status)
            return callback(null, result)
        },
        error: function (xmlReq, status, err) {
            console.log('xmlReq == ', xmlReq)
            console.log('status == ', status)
            console.log('err == ', err)
            return callback(err)
        }
    })
}



$(function () {
    main()
})