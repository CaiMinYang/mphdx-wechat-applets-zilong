var commont = require('../../../../utils/commont.js');
var company = require('../../../../utils/company.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comList: [], // 关联的企业主页
    carteId: '' // 名片id, 获取当前名片关联的企业主页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var carteId = options.carteId;
    console.log(carteId)
    // if(carteId){
      this.setData({
        carteId: carteId
      })
      this.loadData(carteId);
    // }else{
    //   wx.navigateBack({
    //     delta: 1,
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShow(){
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#EEEEEE'
    })
  },
  loadData(carteId){
    company.loadMyCard().then(res => {
      let companyList = res.companyList;
      console.log(res)
      this.setData({
        comList: companyList,
      })
    });
  },
  // 去企业主页
  tocompage(e){
    var index = e.currentTarget.dataset.index;
    wx.setStorageSync('companyIdkey', this.data.comList[index].id)
    wx.setStorageSync('companyNamekey', this.data.comList[index].companyname)
      wx.navigateBack({
        delta: 1,
      })
  }
})