Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onAgree() {
      this.triggerEvent('agree')
    },

    onReject() {
      this.triggerEvent('reject')
    },

    onPrivacyTap() {
      wx.showModal({
        title: '隐私政策',
        content: '河南博物院票务预约小程序尊重并保护用户的隐私权。本隐私政策介绍了我们如何收集、使用和保护您的个人信息。',
        showCancel: false
      })
    }
  }
}) 