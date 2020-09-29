import React from 'react';
import { Scene } from '@antv/l7';
import { DrillDownLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'drilldown',
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
      new DrillDownLayer(scene, {
        data: [
          {
            NAME_CHN: '云南省',
            adcode: 530000,
            value: 17881.12,
          },
        ],
        drillDepth: 2,
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
        city: {
          fill: {
            color: {
              field: 'NAME_CHN',
              values: ['#feedde'],
            },
          },
        },
        drillUpEvent: props => {
          console.log('drillUpEvent', props);
        },
        drillDownEvent: props => {
          console.log('drillDownEvent', props);
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
      id="drilldown"
    ></div>
  );
};
