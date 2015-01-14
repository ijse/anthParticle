anthParticle
=============

粒子动画引擎Js版本，兼容Android端动态壁纸文件格式(`example/data/config.xml`)。

使用方式参考example(`example/index.html`)

# 说明

* 兼容主流浏览器
* loader与引擎分离，可根据源数据格式选择最适合的loader
* 有完整的单元测试

# APIs

### ap = new anthParticle(options)

```
options: {
  fps: 60,
  canvas: document.createElement('canvas'),
  loader: new anthParticleXmlLoader({
    data: xmlDataString,
    image: imageCanvas
  }),
  fpsMeter: new FPSMeter()
}
```

- <canvas>: 画布
- [fps]: 动画fps值，默认为60
- [loader]: 加载器，可以有`xmlLoader`, `jsonLoader`等
- [fpsMeter]: 显示FPS，需要引入FPSMeter，默认不显示


### ap.reload(loader, callback)

重新加载数据。

- <loader>: 加载器
- <callback>: 加载成功后的回调函数，之后的操作都需要在此执行

### ap.start()

开始动画

### ap.stop()

停止动画

### ap.pause()

暂停动画

### ap.play()

继续暂停的动画



# Contribute



// install dependencies
npm install --development

// run test suits
npm test

// make release
npm run-script release
