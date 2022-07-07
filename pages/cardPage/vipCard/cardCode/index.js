var commont = require('../../../../utils/commont.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgCode: '',
    cardDataLogo: '',
    logoimg: '',

    type: 1, // 类型，1:企业logo,2:小程序logo
    width: 375, // 宽度
    isSelf: true,
    url: '',
    is_authorized: true, //是否需要登录
    cardCodeList: [],
    createId: '', // 名片用户id
    id: '', // 跳转名片的id
    shapeType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var {
      type,
      width
    } = this.data;
    this.setData({
      id: options.id,
      createId: options.createId,
      type: options.type || type,
      width: options.width || width,
    })
    this.getUnlimited('280px');

    commont.againAuthorized(this, res => {
      this.setData({
        is_authorized: true,
      })
      this.loadData();
      this.loadUrl();
    })
  },
  //获取二维码图片https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
  getUnlimited(size) {
    var that = this;
    wx.showLoading({
      title: '生成中',
    })
    console.log(this.data.id + ',1,' + that.data.createId);
    wx.cloud.callFunction({
      // 云函数名称
      name: 'qrCode',
      data: {
        scene: this.data.id + ',1,' + that.data.createId,
        size: size,
        path: this.data.shapeType == 2 ? 'pages/cardPage/vipCard/verticalCard/index':'pages/cardPage/vipCard/previewCard/index'
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
  //保存至相册
  saveImageToPhotosAlbum: function (widthx, heighty) {
    var that = this;
    wx.showLoading({
      title: '生成中',
    })
    setTimeout(function () {
      that.comCtx(widthx, heighty);
    }, 1000);
  },

  //绘制下载
  comCtx(widthx, heighty) {
    //2. canvas绘制文字和图片
    const ctx = wx.createCanvasContext('share');
    var that = this;
    console.log('画图')
    // ---------------------------------------
    ctx.drawImage(this.data.imgCode64, 0, 0, 375, 375);

    var avatarurl_width = 176; //绘制的头像宽度
    var avatarurl_heigth = 176; //绘制的头像高度
    var avatarurl_x = 100; //绘制的头像在画布上的位置
    var avatarurl_y = 100; //绘制的头像在画布上的位置
    ctx.save();

    ctx.beginPath(); //开始绘制
    //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
    ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false);

    ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因

    ctx.drawImage(that.data.cardDataLogo, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth); // 推进去图片，必须是https图片

    ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制

    // ctx.drawImage(that.data.cardDataLogo, 60, 60, 30, 30);
    console.log(wx.getSystemInfoSync().windowWidth)
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
  //保存图片
  saveImage() {
    var that = this;
    if (that.data.type == 2) {
      that.getUnlimited(that.data.width);
      setTimeout(function () {
        // var imgSrc =  that.data.imgCode;//二进制流转为base64编码
        var save = wx.getFileSystemManager();
        var number = Math.random();
        save.writeFile({
          filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
          data: that.data.imgCode,
          encoding: 'base64',
          success: res => {
            wx.saveImageToPhotosAlbum({ //保存为png格式到相册
              filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
              success: function (res) {
                wx.showToast({
                  title: '下载成功',
                  icon: 'none',
                  duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
                })
              },
              fail: function (err) {
                console.log(err)
              }
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      }, 2000);
    } else {
      var size = that.data.width;
      that.saveImageToPhotosAlbum(size, size);
    }
  },


  loadData() {
    var userInfo = wx.getStorageSync('activityUserInfo') || {};
    if (userInfo.userid != this.data.createId) {
      this.setData({
        isSelf: false
      })
    }
  },

  loadUrl() {
    var that = this;
    var indexJson = {
      id: this.data.id
    };
    var params = new Object()
    params.indexJson = indexJson
    params.url = "/carte/getImgByCarteId"
    commont.POST({
      params: params,
      success: res => {
        var resData = res.data;
        console.log(resData)
        var arr = new Array();
        if (resData.code == "0000") {
          if (!!resData.data.logo) {
            wx.getImageInfo({
              src: resData.data.logo,
              success: function (res) {

                that.setData({
                  cardDataLogo: res.path,
                  logoimg: resData.data.logo,
                  shapeType: resData.data.shapeType
                })
              }
            })
          }
        }
      }
    })

    // commont.postJson('/carte/getImgByCarteId', {
    //   id: this.data.id
    // }, (res) => {
    //   res = res.data;
    //   console.log(res)
    // })

    // commont.postJson('/mp/carte/getCarteQrCodes', {
    //   carteId: this.data.id
    // }, (res) => {
    //   res = res.data;
    //   var data = res.data || [];
    //   this.setData({
    //     cardCodeList: data
    //   })
    //   this.judgeurl();
    // })
  },
  createCode() {
    var {
      type,
      width,
      id
    } = this.data;
    commont.postJson('/mp/carte/createAndGetCarteQrCode', {
      "carteId": id,
      "smallType": type,
      "width": width
    }, (res) => {
      res = res.data;
      if (res.code === '0000') {
        this.setData({
          url: res.data.url
        })
      } else {
        commont.hint(res.msg || '二维码图片暂未生成，请等待', '提示')
      }
    })
  },
  judgeurl() {
    var {
      type,
      width,
      cardCodeList
    } = this.data;
    if (cardCodeList.length) {
      var url = '';
      for (var i = 0; i < cardCodeList.length; i++) {
        if (cardCodeList[i].type == type && cardCodeList[i].width == width) {
          url = cardCodeList[i].url;
          this.setData({
            url: url
          })
        }
      }
      if (!url) {
        this.createCode();
      }
    } else {
      this.createCode();
    }
  },

  radioChange1(e) {
    this.setData({
      type: e.detail.value
    })
    this.judgeurl();
  },
  radioChange2(e) {
    var value = e.detail.value;
    var width = ''
    if (value == 1) {
      width = 375;
    } else if (value == 2) {
      width = 430;
    } else if (value == 3) {
      width = 860;
    } else if (value == 4) {
      width = 1280;
    }

    this.setData({
      width: width
    })
    this.judgeurl();
  },
  preview() {
    wx.previewImage({
      current: this.data.url,
      urls: [this.data.url],
    })
  },


  //
  downLoadImg() {
    wx.downloadFile({
      url: this.data.url,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          complete(result) {
            if (result.errMsg == 'saveImageToPhotosAlbum:ok') {
              commont.hint('保存成功', '提示');
            }
          }
        })
      },
      fail: function () {

      }
    })
  },
  //登录之后刷新当前页面
  _refreshEvent(e) {
    commont.userAuthorization(this, e.detail.userDetail, () => {
      this.setData({
        is_authorized: true
      })
      this.loadData();
      this.loadUrl();
    })
  },
})