const cardCommont = require('../../../../utils/cardCommont.js');
var commont = require('../../../../utils/commont.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    forwardingScript:'',
    carteId: '', // 当前名片id
    addHidden: true, // 自定义添加字段设置
    // 名片正面信息
    frontData: [
      // {
      //   canModify: false,
      //   name: 'name',
      //   viewName: '姓名',
      //   val: '',
      //   dataType: 1
      // },
      // { canModify: true,
      //   name: 'name',
      //   viewName: '头像',
      //   val: '',
      //   dataType: 2
      // }
    ],
    // 名片反面信息
    backData: [],
    // 其他信息
    otherData: [],
    // 自定义信息
    customData: [],
    customDataType: "1", // 字段类型
    customViewName: '', // 字段中文名
    customName: '', // 字段英文名
    skin: '#1195DD',
    back: '',
    from: '',
    privacy: '', // 隐私文本
    privacyText: '',
    companyid: '',
    canSelfField: false, // 能否自定义字段
    arrayindex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      back: options.back,
      from: options.from || '',
      carteId: options.id,
      companyid: options.companyid || ''
    })
    this.getcarteInfo();
  },
  getcarteInfo() {
    commont.postJson("/mp/carte/getCarteInfo", {
      carteId: this.data.carteId,
      companyPageId: this.data.companyid
    }, (res) => {
      res = res.data;
      if (res.code === '0000') {
        var fieldAndDatas = res.data.fieldAndDatas;
        var front = [];
        var back = [];
        var other = [];
        var custom = [];
        console.log(fieldAndDatas)
        fieldAndDatas.forEach(element => {
          var item = {
            val: element.val,
            ...element.field
          }
          if (item.source == 1) {
            if (item.sideType == 1) {
              front.push(item)
            } else if (item.sideType == 2) {
              back.push(item)
            }
          } else if (item.source == 2) {
            other.push(item)
          } else if (item.source == 3) {
            custom.push(item)
          }
        });
        var policy = '';
        var policyText = '';
        var hide = res.data.hide;
        var companyPageHide = res.data.companyPageHide;
        if (hide == 0) {
          policy = 0;
          policyText = '公开（公开全部详情）'
        } else if (hide == 1) {
          policy = 1;
          policyText = '不公开（无法查看详情）'
        } else if (hide == 100) {
          policy = 100;
          policyText = '半公开（需交换名片查看详情）'
        } else if (companyPageHide == 0) {
          policy = 0;
          policyText = '公开（公开全部详情）'
        } else if (companyPageHide == 1) {
          policy = 1;
          policyText = '不公开（无法查看详情）'
        } else if (companyPageHide == 100) {
          policy = 100;
          policyText = '半公开（需交换名片查看详情）'
        } else {
          policy = 1;
          policyText = '不公开（无法查看详情）'
        }
        this.setData({
          frontData: front,
          backData: back,
          otherData: other,
          customData: custom,
          skin: res.data.skin || '#1195DD',
          privacy: policy,
          canshare: res.data.basicInfo.canshare||0,
          privacyText: policyText,
          canSelfField: res.data.canSelfField,
          forwardingScript:res.data.forwardingScript
        })
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
  },
  bindtarea(e) {
    var dataset = e.currentTarget.dataset;
    console.log(dataset);
    this.setData({
      forwardingScript: e.detail.value
    })

  },

  bindinput(e) {
    var dataset = e.currentTarget.dataset;
    if (dataset.type == 'front') {
      var edit = this.data.frontData;

      edit[dataset.index].val = e.detail.value
      this.setData({
        frontData: edit
      })
    } else if (dataset.type == 'back') {
      var edit = this.data.backData;

      edit[dataset.index].val = e.detail.value
      this.setData({
        backData: edit
      })
    } else if (dataset.type == 'other') {
      var edit = this.data.otherData;

      edit[dataset.index].val = e.detail.value
      this.setData({
        otherData: edit
      })
    } else if (dataset.type == 'custom') {
      var edit = this.data.customData;

      edit[dataset.index].val = e.detail.value
      this.setData({
        customData: edit
      })
    }
  },
  //图片上传
  uploadImg(e) {
    cardCommont.uploadImg(this, (res) => {
      var data = JSON.parse(res.data);
      if (data.code === '0000') {
        var dataset = e.currentTarget.dataset;
        var path = data.data;
        if (dataset.type == 'front') {
          var edit = this.data.frontData;
          edit[dataset.index].val = path
          this.setData({
            frontData: edit
          })
        } else if (dataset.type == 'back') {
          var edit = this.data.backData;
          edit[dataset.index].val = path
          this.setData({
            backData: edit
          })
        } else if (dataset.type == 'other') {
          var edit = this.data.otherData;
          edit[dataset.index].val = path
          this.setData({
            otherData: edit
          })
        } else if (dataset.type == 'custom') {
          var edit = this.data.customData;
          edit[dataset.index].val = path
          this.setData({
            customData: edit
          })
        }
      } else {
        wx.showToast({
          title: data.msg || '上传失败', //标题
          icon: 'none',
          duration: 3000
        })
      }
    })
  },

  // 图片预览
  previewImg(e) {
    var dataset = e.currentTarget.dataset;
    wx.previewImage({
      urls: [dataset.src]
    })
  },
  deleteField(e) {
    wx.showModal({
      title: '温馨提示',
      content: '确实删除该字段？',
      success: (res) => {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          var customData = this.data.customData;
          customData.splice(index, 1)
          this.setData({
            customData: customData
          })
        }
      }
    })
  },
  // 无编辑权限提示
  disabledFiled() {
    wx.showModal({
      title: '暂无权限',
      content: '您没有权限进行此操作，请联系管理员',
      showCancel: false
    })
  },
  radioChange(e) {
    this.setData({
      customDataType: e.detail.value
    })
  },
  modalInput(e) {
    this.setData({
      customViewName: e.detail.value
    })
  },
  //自定义字段
  addCustom() {
    this.setData({
      addHidden: false,
      customName: '',
      customDataType: '1',
      customViewName: ''
    })
  },
  cancel() {
    this.setData({
      addHidden: true
    })
  },
  removeAllSpace(str) {

    return str.replace(/\s+/g, "");
  },
  getUUID() {
    return 'Axxxxxx'.replace(/x/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  },
  confirm() {
    // customDataType: "1", // 字段类型
    var {
      customViewName,
      customDataType
    } = this.data;
    if (!customViewName) {
      commont.hint("请输入字段名称", '温馨提示')
      return;
    }
    var item = {
      name: this.getUUID(), // 随机生成
      viewName: customViewName,
      val: '',
      dataType: parseInt(customDataType)
    }
    var custom = this.data.customData;
    custom.push(item)
    this.setData({
      customData: custom,
      addHidden: true
    })
  },
  //  删除名片提示
  deleteCard() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该名片？',
      cancelColor: '#999999',
      confirmColor: "#333333",
      success: (res) => {
        if (res.confirm) {
          var back = this.data.back;
          commont.postJson("/mp/carte/deleteCarte", {
            carteId: this.data.carteId
          }, (res1) => {
            var data = res1.data;
            if (data.code === '0000') {
              commont.hint('删除成功', '温馨提示', function () {
                if (back == 1) {
                  wx.navigateBack({
                    delta: 1
                  })
                } else {
                  wx.navigateBack({
                    delta: 2
                  })
                }
              })

            } else {
              wx.showToast({
                title: data.msg,
              })
            }
          })
        }
      }
    })
  },
  // 数据提交
  submitdata() {
    console.log(this.data.forwardingScript)
    var obj = {
      forwardingScript:this.data.forwardingScript,
      carteId: this.data.carteId,
      companyPageHide: this.data.privacy,
      fields: [],
      selfFields: []
    };
    var index = 0;
    var {
      frontData,
      backData,
      otherData,
      customData
    } = this.data;
    var data = [].concat(frontData, backData, otherData)
    data.forEach(function (item) {
      var name = item.name;
      var value = item.val;
      if (value) {
        obj.fields.push({
          name: name,
          val: value
        })
      }
    })
    index = 0;
    customData.forEach(function (item) {
      var name = item.name;
      var value = item.val;
      if (value) {
        obj.selfFields.push({
          "name": name,
          "val": value,
          "viewName": item.viewName,
          "dataType": item.dataType
        })
      }
    })
    commont.postJson("/mp/carte/updateCarte", obj, function (res) {
      res = res.data;
      if (res.code === '0000') {
        commont.hint('更新成功', '温馨提示', function () {
          wx.navigateBack({
            delta: 0,
          })
        })
      } else {
        commont.hint(res.msg, "")
      }
    })
  },
  bindPickerChange(e) {
    var params = {};
    params.indexJson = {
      id: this.data.carteId,
      canshare: Number(e.detail.value)
    };
    params.url = "/carte/setShare";
    commont.POST({
      params: params,
      success: (res) => {
        res = res.data;
        if(res.code === '0000'){
          commont.hint('设置成功', '')
          this.setData({
            canshare: Number(e.detail.value)
          })
        }else{
          commont.hint(res.msg||'失败', '')
        }
      }
    })
  },
  privacy() {
    wx.showActionSheet({
      itemList: ['不公开（无法查看详情）', '半公开（需交换名片查看详情）', '公开（公开全部详情）'],
      success: (res) => {
        if (res.tapIndex == 0) {
          this.setData({
            privacy: 1,
            privacyText: '不公开（无法查看详情）',
          })
        } else if (res.tapIndex == 1) {
          this.setData({
            privacy: 100,
            privacyText: '半公开（需交换名片查看详情）',
          })
        } else if (res.tapIndex == 2) {
          this.setData({
            privacy: 0,
            privacyText: '公开（公开全部详情）',
          })
        }
      }
    })
  }
})