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
    if(carteId){
      this.setData({
        carteId: carteId
      })
      this.loadData(carteId);
    }else{
      wx.navigateBack({
        delta: 1,
      })
    }
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
    commont.postJson("/mp/carte/getCarteInfo", {
      carteId: carteId
    }, (res) => {
      res = res.data;
      if(res.code === '0000'){
          this.setData({
            comList: res.data.companyPages || []
          })
      }else{
        commont.hint('获取失败', '提示');
      }
    })
  },
  // 去企业主页
  tocompage(e){
    var comid = e.currentTarget.dataset.comid;
    //判断当前用户是否为当前企业主页的管理员
    company.loadComCardData(comid, res => {
      if (res.isAdmin == 1) {
        wx.navigateTo({
          url: '/pages/cardPage/comCard/selfPage/index?id=' + comid,
        })
      } else {
        wx.navigateTo({
          url: '/pages/cardPage/comCard/prevOthers/index?id=' + comid,
        })
      }
    })
  }
})