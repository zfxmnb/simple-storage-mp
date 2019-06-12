/**
 * 小程序缓存管理
 */
export default {
    /**
     * 监听回调
     */
    listener: {},
    /**
     * 过期时间格式化
     * @param {*} expire 过期时间点 "2019-1-14 21:38:00" | 过期时长，1天2小时3分钟4s后过期 "1d2h3m4s" | 过期时长'1.2.3.4' | 多少个自然日过期，1n为当天23:59:59过期 '1n'
     */
    _formatExpire(expire) {
      if (typeof expire === 'number' && parseInt(expire) > 0) {
        // 时间戳累加
        return parseInt(expire)
      } else if (typeof expire === 'string') {
        // 匹配 "2019-1-14 21:38:00"
        let timeArr = expire.match(/(\d{4})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\s*(\d{1,2})?\s*:?\s*(\d{1,2})?\s*:?\s*(\d{1,2})?/)
        if (timeArr) {
          timeArr = timeArr.splice(1)
          return new Date(parseInt(timeArr[0]), (parseInt(timeArr[1]) - 1) || 0, parseInt(timeArr[2]) || 1, parseInt(timeArr[3]) || 0, parseInt(timeArr[4]) || 0, parseInt(timeArr[5]) || 0).getTime()
        }
        // 匹配自然自
        timeArr = expire.match(/(\d+)n/)
        if (timeArr && timeArr[1] > 0) {
          const now = new Date()
          return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime() + (timeArr[1] - 1) * 86400000
        }
        // 匹配 "1d2h3m4s"
        timeArr = expire.split(/\D+/)
        return (timeArr[0] || 0) * 86400000 + (timeArr[1] || 0) * 3600000 + (timeArr[2] || 0) * 60000 + (timeArr[3] || 0) * 1000 + Date.now()
      }
    },
    /**
     * 对比是否相等
     * @param {*} v1
     * @param {*} v2
     */
    _isEqual(v1, v2) {
      if (typeof v1 === 'object' && typeof v2 === 'object') {
        for (let key in v1) {
          if (!this._isEqual(v1[key], v2[key])) {
            return false
          }
        }
        for (let key in v2) {
          if (!this._isEqual(v1[key], v2[key])) {
            return false
          }
        }
        return true
      } else {
        return v1 === v2
      }
    },
    /**
     * 回调执行方法
     * @param {*} key 缓存键值
     * @param {*} isChange 缓存值是否改变
     */
    _runCallback(key, value = '', originValue) {
      if ((typeof key === 'string' || typeof key === 'number') && !this._isEqual(value, originValue)) {
        this.listener[key] && this.listener[key].forEach((callback) => {
          callback && callback(value)
        })
      }
    },
    /**
     * 设置缓存
     * @param {*} key 缓存key
     * @param {*} value 缓存值
     * @param {*} expire 缓存过期时间
     * @param {*} disabledCb 禁止监听回调执行
     */
    set(key, value, expire, disabledCb) {
      expire = this._formatExpire(expire)
      let data = value
      if (expire > Date.now()) {
        data = {
          value,
          expire,
          storagecontrol: true
        }
      } else if (expire) {
        return
      }
      // 执行缓存变化回调
      !disabledCb && this._runCallback(key, value, this.get(key, true))
      wx.setStorageSync(key, data)
    },
    /**
     * 获取缓存
     * @param {*} key 缓存key
     * @param {*} disabeldCb 禁止监听回调执行
     */
    get(key, disabledCb) {
      let data = wx.getStorageSync(key)
      if (Object.prototype.toString.call(data) !== '[object Object]') {
        return data
      }
      if (data.storagecontrol) {
        if (data.expire >= Date.now()) {
          return data.value
        }
        // 缓存过期回调执行
        this.remove(key, disabledCb)
        return ''
      }
      return data
    },
    /**
     * 清除缓存
     * @param {*} key 缓存key
     * @param {*} disabledCb 禁止监听回调执行
     */
    remove(key, disabledCb) {
      if (key) {
        if (wx.getStorageSync(key) !== '') {
          wx.removeStorageSync(key)
            // 移除缓存回调执行
            !disabledCb && this._runCallback(key)
        }
      } else {
        // 全部缓存清楚
        wx.getStorageInfoSync().keys.forEach(key => {
          this.remove(key, disabledCb)
        })
      }
    },
    /**
     * 全局清除过期缓存
     */
    clear() {
      wx.getStorageInfoSync().keys.forEach(key => {
        this.get(key)
      })
    },
    /**
     * 监听换成变化
     * @param {*} key 缓存键值
     * @param {*} callback 回调
     */
    onChange(key, callback) {
      if (!(typeof key === 'string' || typeof key === 'number') && typeof callback !== 'function') {
        return
      }
      this.listener[key] = (this.listener[key] || [])
      this.listener[key].push(callback)
    },
    /**
     * 移除监听
     * @param {*} key 缓存键值
     * @param {*} callback 回调方法
     */
    removeListener(key, callback) {
      if (!(typeof key === 'string' || typeof key === 'number') || typeof callback !== 'function' || !this.listener[key]) {
        return
      }
      this.listener[key] = this.listener[key].filter((item) => {
        return item !== callback
      })
    }
  }