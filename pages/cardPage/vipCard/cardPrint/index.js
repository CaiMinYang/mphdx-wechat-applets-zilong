var commont = require('../../../../utils/commont.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addsimgBl:true,
    dateDay: '',
    dateMonth: '',
    dateWeek: '',
    dateYear: '',

    cardId: '',
    createId: '',
    frontImg: '', // 名片
    backImg: '', // 名片
    front: '', // 二维码名片
    back: '', // 二维码名片
    selected: 1, // tab 索引
    postList: [],
    shapeType: 1,
    //所有图片的高度  
    imgheights: [],
    imgheightes: 850,
    frontComposeUrl: '',
    backComposeUrl: '',
    current1: 0,
    basicInfo: '',
    imgCode: '',
    etext: 0,
    textcontent: '好设计让产品易被理解',
    imgHb: [],
    imgweb: ['https://file.mphdx.com/poster/hb1.png', 'https://file.mphdx.com/poster/hb2.png', 'https://file.mphdx.com/poster/hb3.png', 'https://file.mphdx.com/poster/hb4.png', 'https://file.mphdx.com/poster/hb5.png', 'https://file.mphdx.com/poster/hb6.png', 'https://file.mphdx.com/poster/hb7.png', 'https://file.mphdx.com/poster/hb8.png'],
    //默认  
    current: 0 // swiper索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cardId: options.cardId,
      createId: options.createId,
      shapeType: options.shapeType || 1
    })

    this.loadData();
    this.setPost();
    this.getUnlimited('280px');
    this.imggoxs(this.data.imgweb, 0);
  },

  imggoxs(evs, index) {
    var that = this;
    wx.getImageInfo({
      src: evs[index],
      success: function (res) {
        that.data.imgHb.push(res.path);
        that.setData({
          imgHb: that.data.imgHb
        })
        index++
        console.log(index)
        if (evs.length > index) {
          that.imggoxs(that.data.imgweb, index);
        }
      }
    })
  },
  select(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selected: index
    })
  },
  bindEtext() {
    this.setData({
      etext: 1
    })
  },
  bindEtextDidle() {
    this.setData({
      etext: 0
    })
  },
  bindEtextOk() {
    this.setData({
      etext: 0
    })
  },
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
    this.setData({
      textcontent: e.detail.value,
    })
  },

  //获取二维码图片https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
  getUnlimited(size) {
    var that = this;
    wx.showLoading({
      title: '生成中',
    })
    console.log(this.data.cardId + ',1,' + that.data.createId);
    wx.cloud.callFunction({
      // 云函数名称
      name: 'qrCode',
      data: {
        scene: this.data.cardId + ',1,' + that.data.createId,
        size: size,
        path: this.data.shapeType == 2 ? 'pages/cardPage/vipCard/verticalCard/index' : 'pages/cardPage/vipCard/previewCard/index'
      },
      success: function (res) {
        console.log(res) // 3
        that.setData({
          imgCode: res.result,
          activitywxaqrcode: "data:image/png;base64," + res.result,
        })
        var code = "data:image/png;base64," + res.result;
        /*code是指图片base64格式数据*/
        //声明文件系统
        const fs = wx.getFileSystemManager();
        //随机定义路径名称
        var times = new Date().getTime();
        var codeimg = wx.env.USER_DATA_PATH + '/' + times + '.png';
        //将base64图片写入
        fs.writeFile({
          filePath: codeimg,
          data: code.slice(22),
          encoding: 'base64',
          success: () => {
            //写入成功了的话，新的图片路径就能用了
            that.setData({
              imgCode64: codeimg,
            })
          }
        });
        wx.hideLoading()

      },
      fail: console.error
    })
  },
  imageLoad: function (e) { //获取图片真实宽度  
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    var screenWidth = wx.getSystemInfoSync().screenWidth * 2 - 120;
    //计算的高度值  
    var viewHeight = screenWidth / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  verticalImg(e) {
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    //计算的高度值  
    var viewHeight = 590 / ratio;
    this.setData({
      imgheightes: viewHeight + 140
    })
  },
  bindchange1(e) {
    this.setData({
      current1: e.detail.current
    })
  },
  bindchange: function (e) {
    console.log(e.detail.current)
    this.setData({
      current: e.detail.current
    })
  },
  setPost() {
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
        // commont.hint('获取失败', '')
        return
      }

      this.setData({
        postList: arr
      })
    })
  },
  preview(e) {
    // 图片预览
    var src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: [src],
      showmenu: true
    })
  },
  promisePost(code) {
    return new Promise((resolve, rejected) => {
      commont.postJson('/mp/carte/getCartePoster', {
        carteId: this.data.cardId,
        smallClass: code
      }, res => {
        res = res.data;
        resolve(res)
      })
    })
  },
  tmp(img1, img2) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          if (!wx.getStorageSync('writePhotosAlbum')) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                img1 && commont.saveImgToPhone(img1);
                img2 && commont.saveImgToPhone(img2);
              }
            })
            wx.setStorageSync('writePhotosAlbum', 1)
          } else {
            wx.showModal({
              title: '提示',
              content: '你未授权相册权限，是否去打开相册权限？',
              success(res) {
                if (res.confirm) {
                  wx.openSetting();
                } else if (res.cancel) {
                  img1 && commont.saveImgToPhone(img1);
                  img2 && commont.saveImgToPhone(img2);
                }
              }
            })
          }
        } else {
          img1 && commont.saveImgToPhone(img1);
          img2 && commont.saveImgToPhone(img2);
        }
      }
    })
  },
  //保存图片
  saveImg() {
    var that = this;
    const {
      selected,
      current,
      postList,
      frontImg,
      backImg,
      front,
      back,
      current1,
      frontComposeUrl,
      backComposeUrl
    } = this.data;
    if (selected == 1) {
      if (current1 === 0) {
        this.tmp(frontImg, backImg)
      } else if (current1 === 1) {
        frontComposeUrl && commont.saveImgToPhone(frontComposeUrl);
      } else if (current1 === 2) {
        backComposeUrl && commont.saveImgToPhone(backComposeUrl);
      }
    } else if (selected == 2) {
      this.tmp(front, back);
    } else if (selected == 3) {
      // commont.saveImgToPhone(postList[current]);
      wx.showLoading({
        title: '生成中',
      })
      setTimeout(function () {
        that.comCtx(630, 1000);
      }, 1000);
    }
  },
  //绘制下载
  comCtx(widthx, heighty) {
    //2. canvas绘制文字和图片
    const ctx = wx.createCanvasContext('share');
    var that = this;
    console.log('画图')
    // ---------------------------------------
    ctx.setFillStyle('#fff')
    ctx.fillRect(0, 0, 315, 500)
    ctx.drawImage(this.data.imgHb[this.data.current], 20, 20, 275, 400);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal bold 36px Arial,sans-serif'
    ctx.fillText(that.data.dateDay, 45, 75);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 12px Arial,sans-serif'
    ctx.fillText(that.data.dateYear + '/' + that.data.dateMonth, 92, 59);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 12px Arial,sans-serif'
    ctx.fillText(that.data.dateWeek, 92, 74);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 16px Arial,sans-serif'
    // ctx.fillText(that.data.textcontent, 45, 125);
    // 
    var text = that.data.textcontent; //这是要绘制的文本
    var chr = text.split(""); //这个方法是将一个字符串分割成字符串数组
    var temp = "";
    var row = [];
    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < 220) {
        temp += chr[a];
      } else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);

    for (var ii = 0; row.length > ii; ii++) {
      ctx.fillText(row[ii], 45, 125 + 24 * ii);
    }

    // //如果数组长度大于2 则截取前两个
    // if (row.length > 1) {
    //   var rowCut = row.slice(0, 2);
    //   var rowPart = rowCut[0]; //1:：2两行换行
    //   console.log(rowPart)
    //   var test = "";
    //   var empty = [];
    //   for (var a = 0; a < rowPart.length; a++) {
    //     if (ctx.measureText(test).width < 240) {
    //       test += rowPart[a];
    //     } else {
    //       break;
    //     }
    //   }
    //   empty.push(test);
    //   var group = empty[0] + "..." //这里只显示两行，超出的用...表示
    //   rowCut.splice(1, 1, group);
    //   row = rowCut;
    //   ctx.fillText(row[1], 338, 50);
    // } else {
    //   ctx.fillText(row[0], 338, 50);
    // }

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 20px Arial,sans-serif'
    ctx.fillText(that.data.basicInfo.username, 45, 343);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 14px Arial,sans-serif'
    ctx.fillText(that.data.basicInfo.position, 45, 360);

    ctx.setFillStyle('#fff')
    ctx.font = 'normal 14px Arial,sans-serif'

    var text2 = that.data.basicInfo.companyname; //这是要绘制的文本
    var chr2 = text2.split(""); //这个方法是将一个字符串分割成字符串数组
    var temp2 = "";
    var row2 = [];
    for (var a = 0; a < chr2.length; a++) {
      if (ctx.measureText(temp2).width < 155) {
        temp2 += chr2[a];
      } else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row2.push(temp2);
        temp2 = "";
      }
    }
    row2.push(temp2);

    for (var ii = 0; row2.length > ii; ii++) {
      ctx.fillText(row2[ii], 45, 377 + 20 * ii);
    }
    // ctx.fillText(that.data.basicInfo.companyname, 45, 377);

    // 二维码底图
    ctx.setGlobalAlpha(0.3)
    ctx.setFillStyle('#fff')
    ctx.fillRect(216, 330, 68, 68)
    ctx.setGlobalAlpha(1)

    ctx.drawImage(this.data.imgCode64, 220, 334, 60, 60);

    ctx.setFillStyle('#A4A9B5')
    ctx.font = 'normal 14px Arial,sans-serif'
    ctx.fillText('Tips：长按识别二维码，保存名片', 55, 463);

    ctx.draw(true, function () {
      // 3. canvas画布转成图片
      console.log('canvas画布转成图片')
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: widthx,
        height: heighty,
        // destWidth: 375,
        // destHeight: 375,
        destWidth: widthx * 750 / wx.getSystemInfoSync().windowWidth,
        destHeight: heighty * 750 / wx.getSystemInfoSync().windowWidth,
        canvasId: 'share',
        // fileType:'jpg',
        // quality:12,
        success: function (res) {
          wx.hideLoading()
          console.log(res);
          that.setData({
            shareImgSrc: res.tempFilePath
          })
          if (!res.tempFilePath) {
            wx.showModal({
              title: '提示',
              content: '图片绘制中，请稍后重试',
              showCancel: false
            })
          }
          //4. 当用户点击分享到朋友圈时，将图片保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: that.data.shareImgSrc,
            success(res) {
              console.log(res);
              // wx.showModal({
              //   title: '图片保存成功',
              //   content: '图片成功保存到相册了，去发圈噻~',
              //   showCancel: false,
              //   confirmText: '好哒',
              //   confirmColor: '#0098EC',
              //   success: function (res) {
              //     if (res.confirm) {
              //       console.log('用户点击确定');
              //     }
              //   }
              // })
              wx.showToast({
                title: '下载成功',
                icon: 'none',
                duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
              })
            }
          })
        },
        fail: function (res) {
          console.log(res)
        }
      })
    });
  },
  loadData() {
    var that = this;
    // 名片详情
    commont.postJson("/mp/carte/getCarteInfo", {
      carteId: this.data.cardId
    }, (res) => {
      res = res.data;
      if (res.code === '0000') {
        var templateCarte = res.data.carteInfo.templateCarte || {};
        var backImgUrl = templateCarte.backImgUrl;
        var frontImgUrl = templateCarte.frontImgUrl;
        var frontComposeUrl = res.data.carteInfo.frontComposeUrl || '';
        var backComposeUrl = res.data.carteInfo.backComposeUrl || '';
        var addsimg = frontImgUrl+frontComposeUrl+backComposeUrl+backImgUrl;
        var arr1 = addsimg.split("https://");
        this.setData({
          basicInfo: res.data.basicInfo,
          frontImg: frontImgUrl,
          frontComposeUrl: frontComposeUrl,
          backComposeUrl: backComposeUrl,
          backImg: /^http/.test(backImgUrl) ? backImgUrl : '',
        })
        console.log(arr1)
        if(arr1.length>2){
          this.setData({
            addsimgBl:true
          })
        }else{
          this.setData({
            addsimgBl:false
          })

        }

      } else if (res.code === '100100007') {
        commont.hint(res.msg, '', function () {
          wx.navigateBack({
            delta: 1
          })
        })
      } else {
        // commont.hint(res.msg);
      }
    })

    commont.postJson('/mp/carte/getCarteQrCodePrint', {
      "carteId": this.data.cardId
    }, res => {
      res = res.data;
      if (res.code === '0000') {
        this.setData({
          front: res.data.front,
          // back: res.data.back,
        })
      }
    })
    //时间获取
    //写入参数
    var params = new Object();
    params.url = "/carte/getNow";
    commont.GET({
      params: params,
      success: function (res) {
        var resData = res.data;
        console.log(resData)
        if (resData.code == '0000') {
          that.setData({
            dateDay: resData.data.day,
            dateMonth: resData.data.month,
            dateWeek: resData.data.week,
            dateYear: resData.data.year,
          })
        }
      }
    })
  },
  printcard() {
    commont.hint('还未开通，敬请期待', '')
  }
})