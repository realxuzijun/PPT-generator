
const app = getApp()


Page({
    data: {
        describe: "",
        requirement_ppt: null,
        has_uploaded: false
    },
    describe(e) {
        this.setData({
            describe: e.detail.value
        })
    },

    onLoad(options) {
        console.log(options)

        this.setData({
            requirement_id: options.id,
            openid: app.globalData.userInfo._openid,
            userInfo: app.globalData.userInfo
        })

    },

    submitReq() {
        if (this.data.requirement_ppt == null) {
            wx.showToast({
                title: '请上传PPT',
                icon: 'error'
            })
        } else {
            wx.showModal({
                title: "", // 提示的标题
                content: "是否确定上传，上传后不可修改", // 提示的内容
                showCancel: true, // 是否显示取消按钮，默认true
                cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
                confirmText: "确定", // 确认按钮的文字，最多4个字符
                confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                success(res) {
                    if (res.confirm) {
                        wx.cloud.database().collection('requirement').doc(that.data.requirement_id).get({
                            success(res) {
                                console.log(res)
                                var submittedUserList = res.data.submittedUserList;
                                submittedUserList.push(that.data.userInfo);
                                wx.cloud.database.collection('requirement').doc(that.data.requirement_id).update({
                                    data : {
                                        submittedUserList : submittedUserList
                                    },
                                    success(res) {
                                        console.log("successfully submit")
                                        console.log(res)
                                        wx.showModal({
                                            title: "", // 提示的标题
                                            content: "PPT已提交", // 提示的内容
                                            showCancel: false, // 是否显示取消按钮，默认true
                                            cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
                                            confirmText: "确定", // 确认按钮的文字，最多4个字符
                                            confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                                            success(res) {
                                                wx.switchTab({
                                                    url: '../hall/hall',
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        
                    }

                }
            })
        }
    },

    uploadPPTfile(e) {
        var that = this;
        wx.chooseMessageFile({
            count: 1,
            type: 'file',
            success(res) {
                // console.log(res)
                var file_info = res.tempFiles[0];
                console.log(file_info)
                // TODO:判断文件类型是不是ppt,判断文件大小是否合适
                if (file_info.size > 104857600) {
                    wx.showModal({
                        title: "文件大小错误", // 提示的标题
                        content: "文件过大,请压缩小于100MB后上传", // 提示的内容
                        showCancel: false, // 是否显示取消按钮，默认true
                        cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
                        confirmText: "确定", // 确认按钮的文字，最多4个字符
                        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                    })
                } else if (!file_info.name.endsWith('ppt') && !file_info.name.endsWith('pptx') && !file_info.name.endsWith('pps') && !file_info.name.endsWith('ppsx')) {
                    wx.showModal({
                        title: "文件类型错误", // 提示的标题
                        content: "请上传PPT文件", // 提示的内容
                        showCancel: false, // 是否显示取消按钮，默认true
                        cancelColor: "#000000", // 取消按钮的文字颜色，必须是16进制格式的颜色字符串
                        confirmText: "确定", // 确认按钮的文字，最多4个字符
                        confirmColor: "#576B95", // 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串
                    })
                } else {
                    wx.showLoading({
                      title: '正在上传',
                    })
                    wx.cloud.uploadFile({
                        cloudPath: that.data.openid + "_" + file_info.name, // 在云端存储的路径
                        filePath: file_info.path
                    }).then(ress => {
                        console.log("successfully upload ppt file")
                        console.log(ress.fileID)
                        that.setData({
                            has_uploaded: true,
                            requirement_ppt: ress.fileID
                        })
                        wx.hideLoading({
                            success(res) {
                                wx.showToast({
                                  title: '上传完成',
                                })
                            }
                        })
                    }).catch(error => {
                        console.log(error)
                    })
                }


            }
        })
    }

})