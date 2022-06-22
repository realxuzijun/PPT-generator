// miniprogram/pages/user/user.js
const utils = require("../../utils/util")
const app = getApp()

Page({
  data: {
    userName: "",
    avatarUrl: "",
    db: {},
    email: "未填写",
    call: "未填写",
    userInfo: {},
    about: "none",
  },
  onShow() {

    if (app.globalData.userInfo != null) {
      wx.showLoading({
        title: '数据加载中...',
      });
      console.log("get globalData.userInfo")
      console.log(app.globalData.userInfo)
      var that = this;
      wx.cloud.database().collection('user').where({ //数据查询
        _openid: app.globalData.userInfo._openid
      }).get({
        success: function (res) {
          that.setData({
            avatarUrl: res.data[0].avatarUrl,
            userName: res.data[0].userName,
            email: res.data[0].email,
            call: res.data[0].call,
            user_type: res.data[0].user_type
          })
        }
      })
      wx.cloud.database().collection('requirement').orderBy('uploadTime', 'desc').where({ //数据查询
        _openid: app.globalData.userInfo._openid,
        status : 'unreceived'
      }).get({
        success: function (res) {
          console.log(res)
          that.setData({
            realsed_requirements: res.data
          })
        }
      });

      wx.cloud.database().collection('requirement').orderBy('uploadTime', 'desc').where({ //数据查询
        acceptedWorkID : app.globalData.userInfo._openid
      }).get({
        success: function (res) {
          console.log(res)
          that.setData({
            finished_requirements: res.data
          })
        }
      });
      wx.hideLoading();
    }

  },

  reqContent(e) {
    console.log(e)
    var option = this.data.requirements[e.currentTarget.dataset.index]._id
    wx.navigateTo({ //保留当前页面，跳转到应用内的某个页面（最多打开5个页面，之后按钮就没有响应的）后续可以使用wx.navigateBack 可以返回;
      url: "../hall/reqContent/reqContent?id=" + option
    })

  },

  getUserProfile(e) {

    var that = this;
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        that.setData({
          userName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        })
        console.log(res.userInfo)
        app.globalData.userInfo = res.userInfo

        // 数据库提交结束

        wx.cloud.callFunction({
          name: "login",
          data: {},
          success: res => {
            console.log(res.result.userInfo.openId)
            // 拿到用户的OpenId
            app.globalData.userInfo._openid = res.result.userInfo.openId
            that.setData({
              userInfo: app.globalData.userInfo,
            })

          },
          fail: function (res) {
            console.log(res)
          }
        })

        // 在数据库中查询此openid，如果没有那么新建用户，否则按原用户登录

        wx.cloud.database().collection('user').where({
          _openid: app.globalData.userInfo._openid
        }).get({
          success(res) {
            if (res.data.length == 0) {
              // 没有搜索到则新建用户
              app.globalData.userInfo.user_type = false;
              wx.cloud.database().collection('user').add({
                data: {
                  userName: app.globalData.userInfo.nickName,
                  avatarUrl: app.globalData.userInfo.avatarUrl,
                  email: "未填写",
                  call: "未填写",
                  user_type: false,
                  intentional_price : 0,
                  expertise_areas : null,
                  introduction : '这个人很神秘，什么也没有写'
                },
              })
            } else {
              app.globalData.userInfo = res.data[0]
            }
            wx.setStorageSync('userInfo', app.globalData.userInfo);
            that.onShow()
          }

        })

      }
    })

  },

  onPullDownRefresh: function () {
    this.onShow();
  },

  onLoad() {

    if (wx.getStorageSync('userInfo')) {
      console.log("get storage userInfo")
      
      app.globalData.userInfo = wx.getStorageSync('userInfo');
      console.log(app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo
      })
      
    }
  }
})