Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    phoneNumber: {
      type: String,
      value: ''
    }
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm')
    },

    onReject() {
      this.triggerEvent('reject')
    },

    onUseOtherPhone() {
      this.triggerEvent('useOtherPhone')
    }
  }
}) 