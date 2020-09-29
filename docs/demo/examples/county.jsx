import React from 'react';
import { Scene } from '@antv/l7';
import { CountyLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'county',
      map: new Mapbox({
        center: [116.2825, 39.9],
        pitch: 0,
        style: 'blank',
        zoom: 3,
        minZoom: 0,
        maxZoom: 10,
      }),
    });

    scene.on('loaded', () => {
      new CountyLayer(scene, {
        adcode: ['110101', '110102', '110106', '110105'], // 区县行政编码，可以加多个区县行政编码，展示多个区县
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
    });
  }, []);

  return (
    <div
      style={{
        height: '400px',
        position: 'relative',
      }}
      id="county"
    ></div>
  );
};
