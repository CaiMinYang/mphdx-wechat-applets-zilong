// pages/guide/comCardGuide/index.js
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clipurl(){
    wx.setClipboardData({
      data: 'https://www.dbcstore.com',
    })
  },

  //引导至PC端
  startCards () {
    wx.navigateTo({
        url: '/pages/guide/comCardGuide/index'
    })
}
})