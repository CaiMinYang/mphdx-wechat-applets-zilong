var commont = require('../../../../utils/commont.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardid: '',
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cardid: options.cardid
    })
    this.loadData();
  },
  loadData() {
    const {
      cardid
    } = this.data;
    commont.postJson('/mp/carte/getCarteTemplateCoordinates', {
      carteId: cardid
    }, res => {
      res = res.data;
      var data = res.data || [];
      this.setData({
        list: data
      })
    })
  },
  openmap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    let list = this.data.list;
    var data = list[index];
    this.judgemap(data.lng, data.lat, data.name, data.remark);
  },
  judgemap(longitude, latitude,name, remark) {
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
              if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      that.chooseLocal(longitude, latitude, name, remark);
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
          that.chooseLocal(longitude, latitude, name, remark);
        } else { //授权后默认加载
          that.chooseLocal(longitude, latitude, name,remark);
        }
      }
    })
  },
  chooseLocal(longitude, latitude, name,remark) {
    wx.openLocation({
      latitude: Number(latitude) || null,
      longitude: Number(longitude) || null,
      name: name || '',
      address: remark || '',
      scale: 28,
      success: function () {}
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

})