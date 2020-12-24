import React from 'react';
import { Scene } from '@antv/l7';
import { ProvinceLayer } from '@antv/l7-district';
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
      const layer1 = new ProvinceLayer(scene, {
        enablePropagation: false,
        adcode: ['330000'], //选择对应省的行政编码，只可展示一个省份
        depth: 2, //普通省份如果需要展示下面市的边界depth为2， 对应直辖市需要将depth设为3
        fill: {
          color: {
            values: 'red',
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
      layer1.on('click', e => {
        console.log('1', e);
      });
      const layer2 = new ProvinceLayer(scene, {
        enablePropagation: true,
        adcode: ['330000'], //选择对应省的行政编码，只可展示一个省份
        depth: 2, //普通省份如果需要展示下面市的边界depth为2， 对应直辖市需要将depth设为3
        fill: {
          color: {
            values: 'blue',
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
      layer2.on('click', e => {
        console.log('2', e);
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
