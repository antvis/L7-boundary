# boundary

## Getting Started

Install dependencies,

```bash
$ yarn install
$ npm i
```

Start the dev server,

```bash
$ yarn run start
$ npm start
```

Build documentation,

```bash
$ npm run docs:build
```

Build library via `father-build`,

```bash
$ npm run build
```

### 如何更新数据

```javascript
import { setDataConfig } from '@antv/l7-district';
setDataConfig({
  country: {
    CHN: {
      1: {
        // 设置省级地图
        fill: {
          type: 'pbf', // 支持pbf 和 geojson  pbf 进行了数据压缩，减少数据量
          url:
            'https://gw.alipayobjects.com/os/bmw-prod/47af6305-062e-454f-9e8a-55e0808b2b7a.bin',
        },
      },
    },
  },
});
```

#### 如何转成 pbf

可以将 GeoJSON 转成 Pbf
