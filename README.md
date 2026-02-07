# distortionfm
ポッドキャスト「Distortion.fm」のWebサイト。

### 起動方法
```sh
npm install
npm run dev
```

### Cloudflare Deploy
```sh
npm run cf:build
npm run cf:deploy
```

### DB
#### vtt
|column|type|constraint|
|--|--|--|
|id|text|PK(複合)|
|start_ms|integer|PK(複合)|
|end_ms|integer|NOT NULL|
|transcript|text|NOT NULL|
