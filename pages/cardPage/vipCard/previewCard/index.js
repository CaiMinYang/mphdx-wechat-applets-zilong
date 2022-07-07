//分享给好友的名片 点击进入是默认收藏, 分享到群里 点击进入要自己触发收藏事件
//在向对方发送申请交换名片  只有对方同意之后  当前用户名片夹里才有对方的名片   同理对方的名片夹也会有当前用户申请的名片
var cardCommont = require('../../../../utils/cardCommont.js');
var commont = require('../../../../utils/commont.js');
var company = require('../../../../utils/company.js');

Page({
  data: {
    gitcarteInfo:{},

    skiptype: 1,
    cardList: {},
    basicInfo: {},
    cardid: '', //名片的id
    creatorid: '', // 创建次名片用户id
    isPackup: 0, //是否收起 1表示收起 0展开
    telArr: [], //临时存放手机号码
    hidden: true, //隐藏提示框
    // showContacts: false, //是否显示人脉集市分类
    cardInfo: [], //统计当前登录用户的名片个数
    signParams: { //交换名片 要给对方发送自己的名片ID
      carteid: ''
    },
    isRefresh: true, //是否刷新当前页面
    swapHidden: true, //交换提示框
    is_authorized: true, //是否需要登录
    is_tipcardswap: true, //第一次进入该页面且部分字段隐藏的情况下 才会有此提示
    // isAddGuide: true, //分享出去的页面 是否显示头部的弹窗
    showModal: false, //是否显示自定义模态框
    noteTip: true, //交换短信提醒,
    hideColumn: false, //是否隐藏一些字段(即名片对访问者不可见)
    giveHidden: true, //回递名片提示
    mycardTotal: 0, //当前登录用户创建名片的个数
    isSend: true,
    isHasCompany: false, //当前用户是否创建过企业主页
    currentFace: 0,
    color: '#1b85d5', // 皮肤
    detailSkin: '#cccccc', // 字段背景色
    fields: [], // 字段
    backup_fields: [],
    isCnEn: false,
    mobile: '',
    videoUrl:'',
    latitude: '', // 经纬度，地图
    longitude: '',
    username: '', // 聊一聊联系人
    forwardingScript: '', // 转发话术
    collected: 0, // 当前用户查看被人名片，是否被当前用户收藏 0，没有  1 有
    comPageList: [],
    imageUrl: '', // 回递名片的url
    feeType: '', // 回递名片是否免费
    shapeType: 1, // 回递名片 定制名片横版，竖版是
    myforwardingScript: '', // 回递名片的转发话术
    companyid: '',
    playId:'',
  },
  onLoad: function (options) {
    //判断是否登录
    commont.againAuthorized(this);

    var scene = decodeURIComponent(options.scene ? options.scene : ''); //扫码进入
    if (scene) {
      var sceneVal = scene.split(',');
      this.setData({
        cardid: sceneVal[0],
        skiptype: sceneVal[1],
        creatorid: sceneVal[2],
        currentFace: options.currentFace == 0 ? 0 : 1 // 1 正面
      })
    } else {
      this.setData({
        skiptype: options.type, //0表示从名片夹进入 1表示分享到朋友圈之后查看的内容 2表示从群组中进入 3表示从交换页面进入 4表示从人脉集市页面进入  10表示从公众号页面进入  6从同事名片进入
        isHide: options.isHide ? options.isHide : '', //从群组中查看名片详情 判断当前名片是否在群组中隐藏 1表示隐藏 0未隐藏  隐藏后手机号码不显示
        cardid: options.cardid, //名片的id
        creatorid: options.userid, //创建此名片的用户ID
        companyid: options.companyid || '',
        currentFace: options.currentFace == 1 ? 1 : options.currentFace == 0 ? 0 : 1 // 1 正面
      })
      if (options.type == 2) {
        this.setData({
          isAdmin: options.isAdmin == 'true' ? true : false //是否为群组管理员
        })
      }
    }

    //处理交换申请列表的名片数据
    if (this.data.skiptype == 3) {
      this.operateSwapedData();
    }
    var userid = commont.getUserid().userid

    // 页面初始化 options为页面跳转所带来的参数
    if ((this.data.skiptype == 1 || this.data.skiptype == 2 || this.data.skiptype == 4) && this.data.creatorid != userid) {
      this.setData({
        isPackup: 1
      })
    }
    // this.loadData();
  },

  //登录后调用的方法
  onShow: function (res) {
    if (this.data.isRefresh) {
      this.loadData();
    } else {
      this.setData({
        isRefresh: true,
      })
    }
  },

  loadData: function () {
    //当前登录用户userid
    this.setData({
      userid: commont.getUserid().userid,
      userInfo: wx.getStorageSync('activityUserInfo')
    })
    if (this.data.userInfo && !this.data.userInfo.mobile && this.data.skiptype == 1) {
      // this.setData({
      //   showModal: true
      // })
    }
    //头部引导层'添加到小程序'
    // if (this.data.userid) {
    //   this.showTopGuide();
    // }
    // 新接口
    commont.postJson("/mp/carte/getCarteInfo", {
      carteId: this.data.cardid
    }, (res) => {
      res = res.data;
      console.log(res)
      this.isShowSwapTip();
      if (res.code === '0000') {
        // if (this.data.creatorid != commont.getUserid().userid) {
        //   wx.hideShareMenu({})
        // }
        let canshare = res.data.basicInfo.canshare || 0;
        if (this.data.creatorid != commont.getUserid().userid && canshare == 0) {
          wx.hideShareMenu({})
        }
        console.log(res.data)
        this.setData({
          basicInfo: res.data.basicInfo,
          gitcarteInfo:res.data,
          cardList: res.data.carteInfo.templateCarte || {},
          hideColumn: true,
          canshare: canshare,
          mobile: res.data.mobile,
          videoUrl: res.data.videoUrl,
          forwardingScript: res.data.forwardingScript,
          color: res.data.skin || '#1b85d5',
          detailSkin: res.data.detailSkin || '#cccccc',
          latitude: res.data.latitude || null,
          longitude: res.data.longitude || null,
          username: res.data.username,
          collected: res.data.collected ? 1 : 0,
          comPageList: res.data.companyPages,
          isCnEn: res.data.isCnEn || false,
        })
        var fields = res.data.fieldAndDatas || [];
        var fieldAndDatas = fields.filter(function (item) {
          return item.val
        })
        var all = [];
        var currentFace = this.data.currentFace;
        if (res.data.isCnEn) {
          fieldAndDatas = fieldAndDatas.filter(function (item) {
            if (currentFace === 1) {
              return item.field.sideType === 1 || item.field.source != 1
            }
            return item.field.sideType === 2 || item.field.source != 1
          })
        }
        var imgArr = [];
        fieldAndDatas.forEach(function (item) {
          var mp = {
            val: item.val,
            ...item.field,
            at1: item.field.viewName.charAt(0),
            viewName: item.field.source == 1 ? item.field.viewName.replace(/[0-9]/g, '') : item.field.viewName
          }
          if (mp.dataType === 5 || mp.dataType === 4) {
            let dataList = []
            let valList = mp.val.split(',')
            let coverList = mp.cover.split(',')
            valList.forEach((item, index) => {
              const itemList = {
                val: item,
                cover: coverList[index],
                viewName: mp.viewName + (index + 1),
                at1: mp.at1
              }
              dataList.push(itemList)
            })
            mp.valList = dataList
          }
          // if (mp.source == 1 || mp.dataType == 1) {
            all.push(mp)
          // } else {
          //   imgArr.push(mp)
          // }
        })
        console.log(all)

        // all.sort(function (a, b) {
        //   return a.dataType - b.dataType
        // })
        this.setData({
          fields: all,
          imgArr: imgArr,
          backup_fields: fields
        })

        //是否自动收藏(分享给好友的名片 点击进入是默认收藏,分享到群里 点击进入要自己触发收藏事件)
        //7月9号更改  getApp().globalData.scene == '1007'   不管是分享到群还是个人默认点击进入别人的名片 收藏一次

        if (this.data.skiptype == 1 && this.data.collected == 0 &&
          commont.getUserid().userid) {
          var params = {
            cardid: this.data.cardid,
            colltype: 1,
            skiptype: this.data.skiptype
          };
          cardCommont.collectCard(params, this);
        }
      } else if (res.code === '100100007') {
        commont.hint(res.msg, '', function () {
          wx.navigateBack({
            delta: 1
          })
        })
      } else {
        commont.hint(res.msg);
      }
    })

    this.loadDefaultCard();
  },
  // //是否显示头部引导
  // showTopGuide() {
  //   //从朋友圈分享进入 加弹框提醒(添加到我的小程序)
  //   if (this.data.skiptype == 1 && !wx.getStorageSync("topGuideTip")) {
  //     this.setData({
  //       isAddGuide: false
  //     })
  //     setTimeout(() => {
  //       this.closeTopGuide();
  //     }, 30000)
  //   }
  // },
  // //关闭头部引导
  // closeTopGuide() {
  //   this.setData({
  //     isAddGuide: true
  //   })
  //   wx.setStorageSync("topGuideTip", true);
  // },
  onUnload() {
    //手动更新上一页面的数据
    if (this.data.creatorid == this.data.userid) {
      // this.refreshPrePage();
    }
  },
  //判断是否已经弹出过名片交换提醒框
  isShowSwapTip() {
    var swapCardTip = wx.getStorageSync("swapCardTip");
    if (!swapCardTip && this.data.creatorid != this.data.userid && this.data.collected == 0 && !this.data.isAdmin && this.data.cardList.swaped != 1 && this.data.skiptype != 1 && this.data.isHide == 1) {
      this.setData({
        is_tipcardswap: false
      })
    }
  },
  //处理交换申请列表的名片数据
  operateSwapedData() {
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    this.setData({
      selectTab: prePage.data.selectTab,
    })
    if (prePage.data.selectTab == 1) {
      this.setData({
        cardStatus: prePage.data.waitData[prePage.data.lookIndex].status
      })
    } else {
      this.setData({
        cardStatus: prePage.data.processedData[prePage.data.lookIndex].status
      })
    }
  },

  //关联企业主页
  selectComCard() {
    const {
      cardInfo,
      cardid,
      cardList
    } = this.data
    var djson = {
      id: cardid,
      companyid: cardInfo[0].id,
      companyname: cardInfo[0].companyname,
    }
    cardList.companyid = cardInfo[0].id;
    cardList.companyname = cardInfo[0].companyname;
    this.setData({
      cardList: cardList
    })
    //关联企业主页之后保存
    cardCommont.updateCard(djson); //0表示电子档保存 1表示扫描保存
  },

  //图片预览
  previewImg(event) {
    let currentUrl = event.currentTarget.dataset.src
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: [currentUrl] // 需要预览的图片http链接列表
    })
  },

  //拨打电
  bindPhoneCall: function (e) {
    var mobile = e.currentTarget.dataset.call;
    if (mobile != undefined) {
      cardCommont.bindPhoneCall(e);
      return;
    }
    commont.hint("该名片暂无电话", '温馨提示');

  },
  //地图导航
  openMap: function () {
    const {
      cardid,
      longitude,
      latitude
    } = this.data;
    commont.postJson('/mp/carte/getCarteTemplateCoordinates', {
      carteId: cardid
    }, res => {
      res = res.data;
      var data = res.data || [];
      if (data.length > 1) { // 多导航
        wx.navigateTo({
          url: '/pages/cardPage/vipCard/daohang/index?cardid=' + cardid,
        })
      } else if(data.length == 1){ // 单导航
        this.judgemap(data[0].lng, data[0].lat, data[0].name, data[0].remark);
      }else{
        commont.hint('暂未维护导航地址', '温馨提示')
      }

    })
  },
  judgemap(longitude, latitude, name, remark) {
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
          that.chooseLocal(longitude, latitude, name, remark);
        }
      }
    })
  },
  chooseLocal(longitude, latitude, name, remark) {
    var activityUserInfo = wx.getStorageSync('activityUserInfo');
    if (this.data.creatorid != activityUserInfo.userid) {
      if (!longitude || !latitude) {
        commont.hint('暂未维护导航地址', '温馨提示')
      } else {
        wx.openLocation({
          latitude: Number(latitude) || null,
          longitude: Number(longitude) || null,
          name: name|| '',
          address: remark||'',
          scale: 28,
          success: function () {}
        })
      }
    } else {
      wx.chooseLocation({
        latitude: Number(latitude) || null,
        longitude: Number(longitude) || null,
        success: res => {
          commont.postJson('/mp/carte/updateCarteCoordinate', {
            carteId: this.data.cardid,
            longitude: res.longitude,
            latitude: res.latitude,
          }, res1 => {
            var data = res1.data;
            if (data.code === '0000') {
              this.loadData();
              commont.hint('导航更新成功', '温馨提示');
            } else {
              commont.hint('导航更新失败', '温馨提示');
            }
          })
        },
        fail: res => {

        }
      })
    }
  },
  //删除名片(即取消收藏 名片夹收藏的名片)
  deleteCard: function (e) {
    var colltype = e.currentTarget.dataset.type; //1收藏 2取消收藏
    var params = {
      cardid: this.data.cardid,
      colltype: colltype,
      skiptype: this.data.skiptype
    };
    cardCommont.collectCard(params, this);
  },
      //跳转分组
      cardGroup: function () {
        console.log(this.data.gitcarteInfo.groupIds)
        console.log(this.data.cardList)
  
        wx.navigateTo({
          url: '/pages/cardPage/cardGrouping/index?redact=0&userid=' + commont.getUserid().userid+'&type=preview'+'&groups='+this.data.gitcarteInfo.groupIds
        })
      },
  

  //刷新上一页面的数据
  delPrevPage() {
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2],
      myCaseList = [],
      cardCaseList = [];
    if (pages[pages.length - 2].route == "pages/cardPage/personCard/index") {
      //我的名片分组
      if (prePage.data.myCaseList) {
        myCaseList = prePage.data.myCaseList.filter((item, index) => {
          return item.id != this.data.cardid
        })
      }
      //我收藏的名片
      if (prePage.data.cardCaseList) {
        cardCaseList = prePage.data.cardCaseList.filter((item, index) => {
          return item.id != this.data.cardid
        })
      }

      prePage.setData({
        myCaseList: myCaseList,
        cardCaseList: cardCaseList,
        cardCaseTotal: prePage.data.cardCaseTotal - 1
      })

    }
  },

  //编辑名片(针对当前登录用户创建的名片)
  editCard: commont.throttle(function (e) {
    wx.navigateTo({
      url: '/pages/cardPage/vipCard/editCard/index?companyid=' + this.data.companyid + '&id=' + this.data.cardid,
    })
  }, 200),

  //收藏名片到名片夹
  collectCard: commont.throttle(function (e) {
    if (this.data.skiptype != 3) {
      if (!commont.getUserid().userid) {
        commont.hint('登录超时，请稍后再试', '提示');
        return false
      } else {
        var colltype = e.currentTarget.dataset.type; //1收藏 2取消收藏
        var params = {
          cardid: this.data.cardid,
          colltype: colltype,
          skiptype: this.data.skiptype
        };
        cardCommont.collectCard(params, this);
      }
    }
  }, 1000),

  //进入名片夹
  openCardCase() {
    wx.navigateTo({
      url: '/pages/cardPage/personCard/index?tab=2',
    })
  },
  //留言
  bindLeaveWord() {
    wx.navigateTo({
      url: '/pages/morePage/cardLeaveWord/index?receiverUserid=' + this.data.creatorid + '&receiverHeadicon=""&receiverUsername=' + this.data.basicInfo.username
    })
  },
  noCard(e) {
    wx.navigateTo({
      url: '/pages/morePage/selectCardFx/index'
    })
},

  //右上角的分享
  onShareAppMessage: function (e) {
    let _this = this;
    _this.setData({
      isRefresh: false,
    })
    const {
      feeType,
      shapeType,
      myCardid,
      currentFace,
      imageUrl,
      cardid
    } = this.data;
    if (e.target) {
      if (e.target.dataset.type == "giveCard") {
        cardCommont.increaseSharednum(cardid, res => {})
        if (feeType == 2) {
          if (shapeType == 1) {
            return {
              title: _this.data.myforwardingScript || "您好,这是我的数字名片,请惠存！",
              path: '/pages/cardPage/vipCard/previewCard/index?cardid=' + myCardid + "&type=1" + "&userid=" + _this.data.userInfo.userid + '&currentFace=1',
              imageUrl: imageUrl,
            }
          } else {
            return {
              title: _this.data.myforwardingScript || "您好,这是我的数字名片,请惠存！",
              path: '/pages/cardPage/vipCard/verticalCard/index?cardid=' + myCardid + "&type=1" + "&userid=" + _this.data.userInfo.userid + '&currentFace=1',
              imageUrl: imageUrl,
            }
          }
        } else {
          return {
            title: _this.data.myforwardingScript || "您好,这是我的数字名片,请惠存！",
            path: '/pages/cardPage/previewCard/index?cardid=' + myCardid + "&type=1" + "&userid=" + _this.data.userInfo.userid,
            imageUrl: imageUrl,
          }
        }
      } else {
        var titles = "";
        if (_this.data.creatorid == _this.data.userInfo.userid) {
          titles = _this.data.forwardingScript || "您好,这是我的数字名片,请惠存！"
        } else {
          titles = "这是" + _this.data.basicInfo.username + "的数字名片，推荐给您"
        }
        cardCommont.increaseSharednum(cardid, res => {})
        return {
          title: titles,
          path: '/pages/cardPage/vipCard/previewCard/index?cardid=' + cardid + "&type=1" + "&userid=" + _this.data.creatorid + '&currentFace=' + currentFace,
        }
      }
    } else {
      var titles = "";
      if (_this.data.creatorid == _this.data.userInfo.userid) {
        titles = _this.data.forwardingScript || "您好,这是我的数字名片,请惠存！"
      } else {
        titles = "这是" + _this.data.basicInfo.username + "的数字名片，推荐给您"
      }
      cardCommont.increaseSharednum(cardid, res => {})
      return {
        title: titles,
        path: '/pages/cardPage/vipCard/previewCard/index?cardid=' + cardid + "&type=1" + "&userid=" + _this.data.creatorid + '&currentFace=' + currentFace,
      }
    }
  },
  //设置微信号复制
  setClipboardData(e) {
    var data = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: data,
      success: function (res) {
        // wx.getClipboardData({
        //   success: function (res) {}
        // })
      }
    })
  },
  //加载默认名片
  loadDefaultCard() {
    var cardJson = {
      userid: commont.getUserid().userid,
      // carteFeeType: 2
    };
    var params = new Object()
    params.indexJson = cardJson
    params.url = "/carte/list"
    commont.POST({
      params: params,
      success: res => {
        var resData = res.data;
        if (resData.code == "0000") {
          var data = resData.data || [];
          this.setData({
            cardCount: data.length,
            vipCardList: data,
          })

          var vipList = data.filter(item => item.feeType == 2);
          var cardList = data.filter(item => item.feeType == 1);

          if (vipList.length) {
            this.setData({
              imageUrl: vipList[0].imgFrontUrl,
              myCardid: vipList[0].id,
              feeType: 2,
              shapeType: vipList[0].shapeType || 1
            })
            this.getInfo(vipList[0].id);
          } else if (cardList.length) {
            this.setData({
              myCardid: cardList[0].id,
              feeType: 1,
            })
            this.getInfo(cardList[0].id);
            this.getcardImg(cardList[0].id);
          }
        }
      }
    })
  },
  getcardImg(id) {
    cardCommont.cardCreateNewImg(id, res => {
      if (res.code === '0000') {
        this.setData({
          imageUrl: res.data,
        })
      } else {
        setTimeout(() => {
          this.getcardImg(id);
        }, 4000)
      }
    }, true)
  },
  getInfo(cardid) {
    commont.postJson("/mp/carte/getCarteInfo", {
      carteId: cardid
    }, (res) => {
      res = res.data;
      if (res.code == '0000') {
        this.setData({
          myforwardingScript: res.data.forwardingScript || ""
        })
      }
    })
  },
  //交换名片
  swapCard: commont.throttle(function (e) {
    var that = this;
    //订阅消息
    var formId = 'GlF08zgiysXWKHHbXzyg43Inta4W-UMRHIaKxMDLqBg';
    if (!wx.getStorageSync(formId)) {
      wx.requestSubscribeMessage({
        tmplIds: [formId],
        success(res) {
          if (res[formId] == 'accept') {
            that.bindSwapCard(formId);
            wx.setStorageSync(formId, 'yes');
          } else {
            that.bindSwapCard("");
            wx.setStorageSync(formId, 'no');
          }
        }
      })
    } else {
      if (wx.getStorageSync(formId) == 'yes') {
        that.bindSwapCard(formId);
      } else {
        that.bindSwapCard("");
      }
    }
  }, 1000),
  //交换名片（向当前创作此名片的用户发送自己的名片）
  bindSwapCard: function (formId) {
    this.setData({
      formId: formId
    })
    //当前登录用户绑定的手机号码
    // if (commont.getUserid().mobile) {
    //   this.data.telArr.push(commont.getUserid().mobile);
    // }
    // this.setData({
    //   telArr: this.data.telArr
    // })
    //首先判断当前用户是否创建过名片
    if (this.data.cardInfo.length >= 1) {
      wx.navigateTo({
        url: '/pages/activityPage/signupCard/index?pageType=3',
      })
    } else if (this.data.cardInfo.length == 0) {
      commont.cancelHint('你还未创建过数字名片,是否去创建?', '提示', res => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/activityPage/editActivityCard/index?pageType=3',
          })
        }
      }, true);
    }
  },
  //创建名片 
  createCard() {
    //无名片时提示创建名片
    if (this.data.cardCount == 0) {
      //当前登录用户绑定的手机号码
      let mobile = commont.getUserid().mobile;
      if (mobile) {
        let telArr = wx.getStorageSync('telArr') || [];
        if (telArr.indexOf(mobile) == -1) {
          telArr.push(mobile);
          wx.setStorageSync('telArr', telArr);
        }
      }
      wx.navigateTo({
        url: '/pages/activityPage/editActivityCard/index?pageType=6',
      })
    }
    // //无名片时提示创建名片
    // if (this.data.cardCount == 0) {
    //   //当前登录用户绑定的手机号码
    //   // if (commont.getUserid().mobile) {
    //   //   this.data.telArr.push(commont.getUserid().mobile);
    //   // }
    //   // this.setData({
    //   //   telArr: this.data.telArr
    //   // })
    //   wx.navigateTo({
    //     url: '/pages/cardPage/intro/index', // 定制名片介绍页
    //   })
    // }
  },
  //交换名片
  startSwapCard() {
    cardCommont.swapCard(this, res => {
      this.setData({
        noteTip: false,
        residue: res,
      })
      this.data.cardList.swaped = 1;
      this.setData({
        cardList: this.data.cardList
      })
      //处理上一页的数据
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      if (this.data.skiptype == 2) {
        if (prePage.loadData)
          prePage.loadData();
      } else if (this.data.skiptype == 4) {
        prePage.setData({
          bazzarData: []
        })
        if (prePage.loadBazaarData)
          prePage.loadBazaarData();
      }
    })
  },

  //通过名片交换申请
  receiveCard(e) {
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    var data;
    if (prePage.data.selectTab == 1) {
      data = prePage.data.waitData;
    } else {
      data = prePage.data.processedData;
    }
    cardCommont.receiveCard(data, prePage.data.lookIndex, 1, res => {
      if (prePage.data.selectTab == 1) {
        prePage.data.waitData[prePage.data.lookIndex].status = 1;
        prePage.setData({
          waitData: prePage.data.waitData
        })
        prePage.operateData(prePage.data.lookIndex);
      } else {
        prePage.data.processedData[prePage.data.lookIndex].status = 1;
        prePage.setData({
          processedData: prePage.data.processedData
        })
      }
      this.data.cardList.mobile = this.data.cardList.showMobile;
      this.data.cardList.email = this.data.cardList.showEmail;
      this.data.cardList.companyaddress = this.data.cardList.showCompanyaddress;
      this.data.cardList.collected = 1;

      this.setData({
        swapHidden: false,
        swapText: '名片交换成功',
        cardStatus: 1,
        collected: 1,
        cardList: this.data.cardList
      })
      setTimeout(() => {
        this.setData({
          swapHidden: true
        })
      }, 3000)
    })
  },
  //忽略名片交换申请
  ignoreCard() {
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];
    cardCommont.receiveCard(prePage.data.waitData, prePage.data.lookIndex, -1, res => {
      prePage.operateData(prePage.data.lookIndex);
      this.setData({
        swapHidden: false,
        swapText: '您已忽略对方的名片交换申请'
      })
      setTimeout(() => {
        this.setData({
          swapHidden: true
        })
        wx.navigateBack({
          delta: 1
        })
      }, 3000)
    })
  },
  //登录之后刷新当前页面
  _refreshEvent(e) {
    commont.userAuthorization(this, e.detail.userDetail, () => {
      this.setData({
        is_authorized: true,
        hidden: true
      })
      this.loadData();
    })
  },
  //关闭交换提示窗(只提示一次 关掉后下次进入将不再提示)
  _closeSwapTipEvent() {
    this.setData({
      is_tipcardswap: true,
    })
    wx.setStorageSync('swapCardTip', true);
  },
  //用户编辑了当前名片后更新上一页面的数据
  refreshPrePage() {
    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2],
      myCaseIndex, collectCaseIndex;
    if (pages.length > 1 && pages[pages.length - 2].route == "pages/cardPage/cardCase/index") {
      //我的名片分组
      if (prePage.data.myCaseList) {
        prePage.data.myCaseList.filter((item, index) => {
          if (item.id == this.data.cardid)
            myCaseIndex = index
        })
      }
      //我收藏的名片
      if (prePage.data.cardCaseList) {
        prePage.data.cardCaseList.filter((item, index) => {
          if (item.id == this.data.cardid)
            collectCaseIndex = index
        })
      }
      if (prePage.data.sorttype == 1) { //按姓名排序
        this.data.cardList.py = this.data.cardList.py ?
          (!getApp().globalData.regAlp.test(this.data.cardList.py.substring(0, 1).toUpperCase()) ? '#' : this.data.cardList.py.substring(0, 1).toUpperCase()) : '#';
      } else if (prePage.data.sorttype == 3) {
        this.data.cardList.py = this.data.cardList.compy ?
          (!getApp().globalData.regAlp.test(this.data.cardList.compy.substring(0, 1).toUpperCase()) ? '#' : this.data.cardList.compy.substring(0, 1).toUpperCase()) : '#';
      }
      if (myCaseIndex != undefined) {
        prePage.data.myCaseList.splice(myCaseIndex, 1);
        prePage.data.myCaseList.splice(myCaseIndex, 0, this.data.cardList);
      } else if (collectCaseIndex != undefined) {
        prePage.data.cardCaseList.splice(collectCaseIndex, 1);
        prePage.data.cardCaseList.splice(collectCaseIndex, 0, this.data.cardList);
      }
      prePage.setData({
        myCaseList: prePage.data.myCaseList,
        cardCaseList: prePage.data.cardCaseList
      })
    }
  },
  // 企业主页关联列表
  seeComPage() {
    var comPageList = this.data.comPageList;
    if (comPageList.length === 1) { // 一个企业主页直接进企业主页
      company.loadComCardData(comPageList[0].companyPageId, res => {
        if (res.isAdmin == 1) {
          wx.navigateTo({
            url: '/pages/cardPage/comCard/selfPage/index?id=' + comPageList[0].companyPageId,
          })
        } else {
          wx.navigateTo({
            url: '/pages/cardPage/comCard/prevOthers/index?id=' + comPageList[0].companyPageId,
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/cardPage/vipCard/comPage/index?carteId=' + this.data.cardid,
      })
    }
  },

  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  onCancel() {
    this.hideModal();
  },

  /**
   * 获取微信绑定的手机号
   */
  getPhoneNumber: function (e) {
    var _this = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      _this.hideModal();
      return false;
    } else {
      wx.login({
        success: function (ress) {
          cardCommont.getWebchatMobile(e.detail.iv, e.detail.encryptedData, ress.code, res => {
            if (!res) {
              commont.hint("该手机已被绑定", '');
            } else {
              _this.data.userInfo.mobile = res;
              // _this.data.userInfo.sessionKey = true;
              _this.data.userInfo.isAuthorized = true;
              _this.setData({
                userInfo: _this.data.userInfo
              })
              wx.setStorageSync("activityUserInfo", _this.data.userInfo);
            }
            _this.hideModal();
          }, _this)
        }
      })
    }
  },

  changeFace() {
    this.setData({
      currentFace: this.data.currentFace === 1 ? 0 : 1
    })
    var all = [];
    var currentFace = this.data.currentFace;
    var isCnEn = this.data.isCnEn;
    var fieldAndDatas = this.data.backup_fields || [];
    if (isCnEn) {
      fieldAndDatas = fieldAndDatas.filter(function (item) {
        if (currentFace == 1) {
          return (item.field.sideType == 1 && item.val) || item.field.source != 1
        }
        return (item.field.sideType == 2 && item.val) || item.field.source != 1
      })
    }
    var imgArr = [];
    fieldAndDatas.forEach(function (item) {
      var mp = {
        val: item.val,
        ...item.field,
        at1: item.field.viewName.charAt(0),
        viewName: item.field.source == 1 ? item.field.viewName.replace(/[0-9]/g, '') : item.field.viewName
      }
      if (mp.source == 1 || mp.dataType == 1) {
        all.push(mp)
      } else {
        imgArr.push(mp)
      }
    })
    console.log(all)

    all.sort(function (a, b) {
      return a.dataType - b.dataType
    })
    this.setData({
      fields: all,
      imgArr: imgArr
    })
    console.log(this.data.fields)
  },
  saveInfo() {
    const {
      mobile,
      username,
      tel,
      position,
      email,
      fax
    } = this.data.basicInfo;
    console.log(this.data.basicInfo)
    wx.addPhoneContact({
      organization:this.data.basicInfo.companyname,
      firstName: username,
      mobilePhoneNumber: mobile,
      workPhoneNumber: tel,
      email: email,
      title: position,
      homeFaxNumber: fax,
      success: () => {
        commont.hint('保存成功', '')
      },
      fail: () => {
        // commont.hint('保存失败', '')
      }
    })
  },
  viewFile:function(e) {
    const url = e.currentTarget.dataset.content;
    console.log(url)
    wx.showLoading({
      title: '加载中，请稍等！'
    })
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: url,
      success: function(res) {
        wx.hideLoading()
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          showMenu: true,
          success: function(res) {
            wx.showToast({
              title: '打开文档成功！',
              icon: 'success',
              duration: 2000//持续的时间
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '打开文档失败！',
              icon: 'none',
              duration: 2000//持续的时间
            })
          }
        })
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '下载文档失败！',
          icon: 'none',
          duration: 2000//持续的时间
        })
      }
    })
  },
  // viewFile:function(e) {
  //   const url = e.currentTarget.dataset.content;
  //   wx.navigateTo({
  //     url: `./preview-file/index?eSrc=${url}`
  //   })
  // },
  //视频播放
  // playVideo:function(e){
  //   var that = this;
  //   var id = e.currentTarget.id
  //   if (that.data.playId==id){
  //   }else if (that.data.playId == ''){
  //   }else{
  //     var prevV = wx.createVideoContext(that.data.playId);
  //     prevV.pause()
  //   }
  //   var prevV2 = wx.createVideoContext(id);
  //   prevV2.play()
  //   that.setData({
  //     playId: id
  //   })
  // },
  // pauseVideo:function(e){
  //   var that = this;
  //   if (e.currentTarget.id == that.data.playId){
  //     var prevV = wx.createVideoContext(that.data.playId);
  //     prevV.pause()
  //     that.setData({
  //       playId: ''
  //     })
  //   }
  // },
  // onHide: function () {
  //   var that = this;
  //   if (that.data.playId != '') {
  //     var prevV = wx.createVideoContext(that.data.playId);
  //     prevV.pause()
  //   }
  //   // 页面隐藏
  // },
})