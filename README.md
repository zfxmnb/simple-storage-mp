# simple-storage-mp
## 一个微信小程序缓存管理工具
```js
import storage from "simple-storage-mp";

/**
 * 设置缓存，支持过期时间
 * @param {*} key
 * @param {*} data
 * @param {*} expire
 *  过期时间点 "2019-1-14 21:38:00" | 过期时长，1天2小时3分钟4s后过期 "1d2h3m4s" | 过期时长'1.2.3.4' | 多少个自然日过期，1n为当天23:59:59过期 '1n'
 */
storage.set(key, data, expire);

// 获取缓存
storage.get(key);

// 一处指定缓存，key 未穿值为清楚所有缓存
storage.remove(key);

// 清楚过期缓存
storage.clear();

// 监听缓存改变
storage.onChange(key, fn)

// 移除缓存监听器
storage.removeListener(key, fn)
```