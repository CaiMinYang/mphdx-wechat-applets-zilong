var commont = require('../../../../utils/commont.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible: false,
    countryCode: '86',

    mobile: '',
    wait: false,
    seconds: 60,
    timer: null,
    validCode: '',
    userInfo: null,
    is_authorized: true,
    claimFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    commont.againAuthorized(this, res =>{

    });
    var userInfo = wx.getStorageSync('activityUserInfo');
    this.setData({
      userInfo: userInfo,
    })

    this.isAuthorized();
  },
  showCountryIntlSelector: function () {
    console.log('设置visible')
    this.setData({
      visible: true
    });
  },
  isAuthorized() {
    if (!this.data.userInfo) {
      this.setData({
        is_authorized: false
      })
    }
  },
  //登录之后刷新当前页面
  _refreshEvent(e) {
    commont.userAuthorization(this, e.detail.userDetail, () => {
      this.setData({
        is_authorized: true,
        hidden: true
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  getPhone(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  // 获取验证码
  getCode() {
    if (!(/^[1][3456789][0-9]{9}$/.test(this.data.mobile))) {
      commont.hint('请输入正确的手机号', '验证失败');
      return
    }
    this.setData({
      wait: true
    })
    let _this = this
    _this.data.timer = setInterval(() => {
      if (_this.data.seconds == 0) {
        _this.setData({
          seconds: 60,
          wait: false
        })
        clearInterval(_this.data.timer);
        return;
      }
      _this.setData({
        seconds: _this.data.seconds
      })
      _this.data.seconds--;
    }, 1000);
    var indexJson = {
      mobile: _this.data.countryCode + '-' + this.data.mobile,
      type: 3
    };
    var params = new Object();
    params.indexJson = indexJson;
    params.url = "/sendSms";
    commont.POST({
      params: params,
      success: res => {}
    })
  },
  getCodeVal(e) {
    this.setData({
      validCode: e.detail.value
    })
  },

  // 完成
  comfirm() {
    var {mobile, validCode, claimFlag} = this.data;
    if (!(/^[1][3456789][0-9]{9}$/.test(mobile))) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        mask: true
      })
      return
    }
    if (!validCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        mask: true
      })
      return
    }
    if(claimFlag){
      return;
    }
    wx.showLoading({
      title: '认领中...',
      mask: true
    })
    this.setData({
      claimFlag: true
    })
    var params = new Object();
    let indexJson = {
      mobile: this.data.countryCode + '-' + mobile,
      validCode: validCode
    }
    params.indexJson = indexJson;
    // params.url = "/carte/receiveOtherMobileAllCartes";
    params.url = "/mp/carte/receiveCartes"; // 新 url

    commont.postJson('/mp/carte/receiveCartes', indexJson, function(res){
      var data = res.data;
      wx.hideLoading()
      if (data.code === '1000') {
        wx.redirectTo({
          url: '/pages/cardPage/vipCard/claimFailure/index'
        })
      } else if (data.code === '0000') {
        if (data.data > 0) {
          wx.showToast({
            title: '认领成功',
            icon: 'success',
            duration: 2000,
            success: function () {
              setTimeout(function () {
                var pages = getCurrentPages();
                // var prevPage = pages[pages.length - 3];
                // prevPage.getVipCardList()
                // wx.redirectTo({
                //   url: '/pages/cardPage/personCard/index?tab=1',
                // })
                if(pages.length >= 2){
                  var prevPage = pages[pages.length - 2];
                  prevPage.getVipCardList()
                  wx.navigateBack({
                    delta: 1,
                    fail: () => {
                      wx.navigateTo({
                        url: '/pages/cardPage/personCard/index?tab=1',
                      })
                    }
                  })
                }else{
                  wx.navigateTo({
                    url: '/pages/cardPage/personCard/index?tab=1',
                  })
                }
                return;
                // debugger
                if(wx.getStorageSync('scene')){
                  wx.removeStorageSync('scene')
                  wx.navigateTo({
                    url: '/pages/cardPage/personCard/index?tab=1',
                  })
                }else{
                  wx.navigateBack({
                    delta: 2,
                    fail: () => {
                      wx.navigateTo({
                        url: '/pages/cardPage/personCard/index?tab=1',
                      })
                    }
                  })
                }
              }, 2000)
            }
          })
        } else if(data.data == 0){
          wx.redirectTo({
            url: '/pages/cardPage/vipCard/claimFailure/index'
          })
        }else {
          wx.showToast({
            title: "还有"+Math.abs(data.data)+"张名片正在生成，请等待",
            icon: 'none',
            mask: true
          })
        }
      } else {
        wx.showToast({
          title: data.msg,
          icon: 'none',
          mask: true
        })
      }
    })
  }
})