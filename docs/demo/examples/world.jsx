import React from 'react';
import { Scene } from '@antv/l7';
import { WorldLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'world',
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
      const layer = new WorldLayer(scene, {
        data: [],
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
      console.log(layer.getLayer('fill'));
      layer.on('click', e => {
        alert(e);
      });
    });
  }, []);

  return (
    <div
      style={{
        height: '400px',
        position: 'relative',
      }}
      id="world"
    ></div>
  );
};
