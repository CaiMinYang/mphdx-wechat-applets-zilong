const commont = require('../../../../utils/commont');
const cardCommont = require('../../../../utils/cardCommont.js');
let isRequest = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowModal: true,
    sorthidden: true,
    sorttype: 1,
    dataList: [],
    page: 1,
    keywords: '',
    companyId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      companyId: options.companyid
    })
    this.loadData();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  hideFabsModal() {
    this.setData({
      sorthidden: true,
      isShowModal: true,
      collectCard_click_index: 'N',
    })
  },
  //获取搜索输入框的内容
  bindinput: function (e) {
    var val = e.detail.value;
    this.setData({
      keywords: val,
      // dataList: [],
      page: 1
    });
    this.loadData();
  },
  loadData() {
    const {
      dataList,
      page,
      sorttype,
      companyId,
      keywords,
    } = this.data;
    commont.postJson('/mp/carte/getMyCompanyCarteGroupCartes', {
      sortType: sorttype,
      pageNo: page,
      username: keywords,
      pageSize: 20,
    }, res => {
      isRequest = false;
      res = res.data;
      if (res.code == '0000') {
        var list = res.data.list || [];
        list.forEach((item, idx) => {
          if (sorttype == 1) { //1是按照姓名排序  3是公司  2是时间
            item.py = item.py ?
              (!getApp().globalData.regAlp.test(item.py.substring(0, 1).toUpperCase()) ? '#' : item.py.substring(0, 1).toUpperCase()) : '#';
          }
        })
        if (page == 1) {
          this.setData({
            dataList: list
          })
        } else {
          this.setData({
            dataList: dataList.concat(list)
          })
        }
      }
    }, companyId)
  },
  lookCard(e) {
    this.setData({
      isFreshing: false,
    })
    var dataset = e.currentTarget.dataset
    var cardId = dataset.cardid; //名片id
    // var username = dataset.username; //用户名
    var userid = dataset.userid; //用户id
    var shapetype = dataset.shapetype;

    var feeType = dataset.feetype;
    let path = '';
    if (feeType == 1) {
      path = '/pages/cardPage/previewCard/index?cardid=' + cardId + "&type=6&userid=" + userid
    } else {
      if (shapetype == 2) {
        path = '/pages/cardPage/vipCard/verticalCard/index?cardid=' + cardId + "&type=6&userid=" + userid
      } else {
        path = '/pages/cardPage/vipCard/previewCard/index?cardid=' + cardId + "&type=6&userid=" + userid
      }

    }
    wx.navigateTo({
      url: path, //type等于0表示是从搜索界面点击查看名片详情  等于1表示分享到朋友圈之后查看名片详情
    })
  },
  bindShowFabs(e) {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    if (!this.data.isShowModal) {
      this.hideFabsModal();
    } else {
      if (type == 1) { //我创建的名片
        this.setData({
          isShowModal: false
        })
      } else { //我收藏的名片
        this.setData({
          collectCard_click_index: index,
          isShowModal: false
        })
      }
    }
  },
  bindNavigation(e) {
    this.hideFabsModal();
    var longitude = e.currentTarget.dataset.longitude;
    var latitude = e.currentTarget.dataset.latitude;
    var companyaddress = e.currentTarget.dataset.address;
    if (!longitude) {
      wx.showToast({
        title: '未维护导航地址',
        icon: 'error',
        duration: 1000
      })
    } else {
      wx.openLocation({
        latitude: Number(latitude),
        longitude: Number(longitude),
        name: companyaddress,
        scale: 28,
        success: function () {}
      })
    }
  },
  bindPhoneCall(e) {
    this.hideFabsModal();
    cardCommont.bindPhoneCall(e);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!isRequest) {
      isRequest = true;
      this.setData({
        page: this.data.page + 1
      })
      this.loadData();
    }
  },
})