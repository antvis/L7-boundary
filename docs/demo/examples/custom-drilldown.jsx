import React from 'react';
import { Scene } from '@antv/l7';
import { ProvinceLayer, CityLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'province',
      map: new Mapbox({
        center: [116.2825, 39.9],
        pitch: 0,
        style: 'blank',
        zoom: 1,
        minZoom: 0,
        maxZoom: 10,
      }),
    });

    scene.on('loaded', () => {
      //去除scene双击zoom放大事件
      scene.setMapStatus({ doubleClickZoom: false });

      //省级区划
      let provinceLayer = new ProvinceLayer(scene, {
        adcode: ['330000'], //选择对应省的行政编码，只可展示一个省份
        depth: 2, //普通省份如果需要展示下面市的边界depth为2， 对应直辖市需要将depth设为3
        fill: {
          color: {
            field: 'NAME_CHN',
            values: [
              '#feedde',
              '#fdd0a2',
              '#fdae6b',
              '#fd8d3c',
              '#e6550d',
              '#a63603',
            ],
          },
        },
        stroke: '#ccc',
        label: {
          enable: true,
          textAllowOverlap: false,
          field: 'NAME_CHN',
        },
        popup: {
          enable: true,
          Html: props => {
            return `<span>${props.NAME_CHN}</span>`;
          },
        },
      });

      //市级区划
      let cityLayer = new CityLayer(scene, {
        adcode: ['330000', '330100'], // adcode[0] 对应省行政编码  adcode[1] 对应市行政编码
        fill: {
          color: {
            field: 'NAME_CHN',
            values: [
              '#feedde',
              '#fdd0a2',
              '#fdae6b',
              '#fd8d3c',
              '#e6550d',
              '#a63603',
            ],
          },
        },
        autoFit: false,
        stroke: '#ccc',
        label: {
          enable: true,
          textAllowOverlap: false,
          field: 'NAME_CHN',
        },
        popup: {
          enable: true,
          Html: props => {
            return `<span>${props.NAME_CHN}</span>`;
          },
        },
      });
      //初始化隐藏市级区划
      cityLayer.hide();

      //点击省级区划，下钻到市
      provinceLayer.on('loaded', () => {
        provinceLayer.fillLayer.on('click', e => {
          const adcode = [e.feature.properties.adcode];
          cityLayer.show();
          cityLayer.updateDistrict(adcode);
          cityLayer.fillLayer.fitBounds();
          provinceLayer.hide();
        });
      });

      //双击市级空白区，上钻回省级区划
      cityLayer.on('loaded', () => {
        cityLayer.fillLayer.on('undblclick', e => {
          provinceLayer.show();
          provinceLayer.updateDistrict(['330000']);
          provinceLayer.fillLayer.fitBounds();
          cityLayer.hide();
        });
      });
    });
  }, []);

  return (
    <div
      style={{
        height: '400px',
        position: 'relative',
      }}
      id="province"
    ></div>
  );
};
