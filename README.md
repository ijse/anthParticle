anthParticle
=============

粒子动画引擎Js版本，兼容Android端动态壁纸文件格式。
使用方式参考example

# APIs

### new anthParticle(options)

```
options: {
  fps: 60,
  canvas: document.createElement('canvas'),
  loader: new anthParticleXmlLoader({
    data: xmlDataString,
    image: imageCanvas
  })
}
```

### reload(loader, callback)

```

```

# Contribute

// install dependencies
npm install --development

// run test suits
npm test

// make release
npm run-script release
