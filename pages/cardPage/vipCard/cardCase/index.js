var commont = require('../../../../utils/commont.js');
var cardCommont = require('../../../../utils/cardCommont.js');
Page({
  data: {
    commFileUrl: '',
    cardCaseList: [], //我收藏的名片
    sorthidden: true, //名片夹 排序展示与隐藏
    isShowMoreCard: true, //当名片夹中有待接收名片 自己的名片超出3张隐藏
    keywords: '', //搜索关键字
    sorttype: 1,
    isShowModal: true,
    hiddenLoading: true,
    pageNo: 1,
    dataLoading: true
  },
  onLoad: function (options) {

  },
  onShow() {
    this.setData({
      hiddenLoading: false,
      cardCaseList: [],
      pageNo: 1
    })
    this.loadCardCaseData();
  },
  //上拉加载
  lowerUser: commont.throttle(function () {
    if (this.data.pageNo >= 1 && this.data.pageNo < (this.data.collectTotal % 10 == 0 ? this.data.collectTotal / 10 : Math.floor(this.data.collectTotal / 10) + 1)) {
      this.data.pageNo++;
      this.setData({
        pageNo: this.data.pageNo,
        dataLoading: false
      })
      this.loadCardCaseData();
    }
  }, 1000),
  //加载名片夹数据
  loadCardCaseData: function () {
    cardCommont.getCardCaseData(this, false, res => {
      if (this.data.myCaseList.length > 3 && this.data.pageNo == 1) { //我的名片的个数
        this.setData({
          isShowMoreCard: false,
        })
      }
      this.setData({
        hiddenLoading: true,
        dataLoading: true
      })
    });
  },
})