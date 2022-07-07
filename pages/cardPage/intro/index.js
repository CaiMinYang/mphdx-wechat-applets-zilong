// pages/cardPage/intro/index.js
var commont = require('../../../utils/commont.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lointoData: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.lointo();

  },
  showmfsy: function (e) {
    if(this.data.lointoData==0){
      wx.navigateTo({
        url: '/pages/cardPage/vipCard/claimShiyongCard/index'
      })  
    }else{
      wx.navigateTo({
        url: '/pages/cardPage/personCard/index?tab=1'
      })
    }
  },
  lointo: function () {
    commont.postJson('/mp/user/getExpState', {}, res => {
      var resData = res.data;
      if (resData.code == '0000') {
        this.setData({
          lointoData: resData.data.expState,
        })
      } else {
        console.log('resData.code=' + resData.code)
      }
    })
  },
  startCards () {
    wx.navigateTo({
        url: '/pages/guide/comCardGuide/index'
    })
},
  toVipCard(){
    wx.navigateTo({
      url: '/pages/cardPage/personCard/index?tab=1',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '定制企业数字名片, 像ERP一样管理企业名片资源',
      path: '/pages/cardPage/intro/index'
    }
  }
})