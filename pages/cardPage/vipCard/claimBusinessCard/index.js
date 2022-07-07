Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var scene = decodeURIComponent(options.scene?options.scene : '');//扫码进入
    if(scene){
      wx.setStorageSync('scene', scene)
    }
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
    const title = wx.getStorageSync('nickName') + '邀请你开通企业定制名片'
    return{
      title: title,
      imageUrl:'https://file.mphdx.com/2021/06/16/89902158b2c8473da131e7be7d82b03d.png',
      path: '/pages/cardPage/personCard/index?tab=1'
      // path: '/pages/cardPage/vipCard/claimBusinessCard/index' // 此为测试用
    }
  },
  
  // 立即认领
  claimNow() {
    wx.redirectTo({
      url: '/pages/cardPage/vipCard/telAuthorization/index',
    })
  }
})