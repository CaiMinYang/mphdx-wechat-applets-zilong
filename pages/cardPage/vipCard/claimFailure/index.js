Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

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
    }
  },
})