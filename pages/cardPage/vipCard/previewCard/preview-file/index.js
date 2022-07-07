Page({

  /**
   * 页面的初始数据
   */
  data: {
    eSrc:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let eSrc = options.eSrc
    this.setData({
      eSrc: eSrc
    })
  },
})