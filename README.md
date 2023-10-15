# distortionfm
ポッドキャスト「Distortion.fm」のWebサイト。

### 起動方法
```sh
npm install
npm run dev
```

### DB
|column|type|constraint|
|--|--|--|
|id|seq|PK|
|start_ms|int|PK|
|end_ms|int|NOT NULL|
|transcript|varchar|NOT NULL|
[vtt]