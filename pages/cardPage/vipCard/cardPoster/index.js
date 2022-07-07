var commont = require('../../../../utils/commont.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardId: '',
    createId: '',
    postList: [],
    //所有图片的高度  
    imgheights: [],
    //默认  
    current: 0,
    is_authorized: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cardId: options.id || '',
      createId: options.createId,
    })
    commont.againAuthorized(this, res => {
      this.setData({
        is_authorized: true,
      })
      this.loadData();
    })

  },
  loadData() {
    var flag = false;
    Promise.all([301, 302, 303, 304].map(item => this.promisePost(item))).then(res => {
      res = res || [];
      var arr = [];
      var flag = '';
      res.forEach(function (item) {
        if (item.code === '0000') {
          flag = true;
          arr.push(item.data);
        } else if (item.code === '100100012') {

        }
      })
      if (arr.length === 0) {
        commont.hint('获取失败', '')
        return
      }

      this.setData({
        postList: arr
      })
    })

    // commont.postJson('/mp/carte/getCartePoster', {
    //   carteId: this.data.cardId,
    //   smallClass: 301
    // }, res => {
    //   res = res.data;
    //   console.log(res);
    // })
  },

  promisePost(code) {
    return new Promise((resolve, rejected) => {
      commont.postJson('/mp/carte/getCartePoster', {
        carteId: this.data.cardId,
        smallClass: code
      }, res => {
        res = res.data;
        resolve(res)
        // console.log(res);
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // const title = wx.getStorageSync('nickName') + '邀请你开通企业定制名片'
    var {createId, cardId } = this.data;
    var userid = wx.getStorageSync("activityUserInfo").userid;
    var title = ''
    if(userid == createId){
      title = '你好，这是我的名片海报';
    }else{
      title = '你好，这是'+wx.getStorageSync('nickName')+'的名片海报';
    }
    return {
      title: title,
      path: '/pages/cardPage/vipCard/cardPoster/index?id=' + cardId +"&createId="+ createId,
    }
  },
  imageLoad: function (e) { //获取图片真实宽度  
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    //计算的高度值  
    var screenWidth = wx.getSystemInfoSync().screenWidth * 2 - 120;
    var viewHeight = screenWidth / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  bindchange(e) {
    var current = e.detail.current;
    this.setData({
      current: current
    })
  },
  saveImg() {
    const {
      postList,
      current
    } = this.data;
    if (!postList.length) {
      return;
    }
    commont.saveImgToPhone(postList[current]);
  },
  //登录之后刷新当前页面
  _refreshEvent(e) {
    commont.userAuthorization(this, e.detail.userDetail, () => {
      this.setData({
        is_authorized: true
      })
      this.loadData();
    })
  },
})