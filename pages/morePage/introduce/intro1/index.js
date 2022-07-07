// pages/morePage/introduce/intro1/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  startCards () {
    wx.navigateTo({
        url: '/pages/guide/comCardGuide/index'
    })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '企业宣传物料数字化，智能获客，提高效率', // 分享标题
      path: '/pages/morePage/introduce/intro1/index'
    }
  },
  bindBtnCreate(){
    wx.navigateTo({
      url: '/pages/cardPage/comCard/myCard/index',
    })
  }
})