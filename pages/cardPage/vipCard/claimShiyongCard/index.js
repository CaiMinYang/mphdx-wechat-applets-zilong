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
  onLoad: function (options) {
    commont.againAuthorized(this, res => {
    });
    var userInfo = wx.getStorageSync('activityUserInfo');
    this.setData({
      userInfo: userInfo,
    })

    this.isAuthorized();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(wx.getStorageSync('nickName'))
    const title = wx.getStorageSync('nickName') + '邀请你开通企业名片'
    return {
      title: title,
      imageUrl: 'https://file.mphdx.com/2021/06/16/89902158b2c8473da131e7be7d82b03d.png',
      path: '/pages/cardPage/vipCard/claimShiyongCard/index'
    }
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
  showmfsy: function (e) {
    var that = this;
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
    commont.postJson('/mp/user/v2/openExp', {
      mobile: this.data.countryCode + '-' +mobile,
      code: validCode,
    }, res => {
      console.log(res)
      var resData = res.data;
      this.setData({
        claimFlag: false
      })
  
      if (resData.code == '0000') {
        wx.showToast({
          title: '试用成功',
          icon: 'loading',
          mask: true,
          duration: 2000
        })
        setTimeout(function () {
          var pages = getCurrentPages();
          if(pages.length >= 2){
            var prevPage = pages[pages.length - 2];
            prevPage.loadData()
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
          return
        }, 2000);
      }else if(resData.code == '1005'){
        console.log('resData.code=' + resData.code)
        wx.showToast({
          title: resData.msg,
          icon: 'error',
          duration: 2000
        })
      } else {
        console.log('resData.code=' + resData.code)
        wx.showToast({
          title: resData.msg,
          icon: 'error',
          duration: 2000
        })
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/cardPage/personCard/index?tab=1'
          })
        }, 2000);
      }
    })
  }
})