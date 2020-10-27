import React from 'react';
import { Scene } from '@antv/l7';
import { DrillDownLayer } from '@antv/l7-district';
import { RegionList, getRegionByAdcode } from '@antv/l7-district';
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
        maxZoom: 20,
      }),
    });

    scene.on('loaded', () => {
      new DrillDownLayer(scene, {
        regionDrill: true,
        data: [
          {
            NAME_CHN: '云南省',
            adcode: 530000,
            value: 17881.12,
          },
        ],
        drillDepth: 2,
        provinceStroke: '#333',
        fill: {
          color: {
            field: 'REGION_NAME',
            values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
          },
        },
        province: {
          regionType: 'region',
          provinceStroke: 'rgba(255,255,255,0.1)',
        },
        region: {
          strokeOpacity: 0.5,
          depth: 1,
          fill: {
            color: {
              field: 'NAME_CHN',
              values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
            },
          },
        },
        county: {
          strokeOpacity: 0.5,
          fill: {
            color: {
              field: 'NAME_CHN',
              values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
            },
          },
        },
        city: {
          strokeOpacity: 0.5,
          fill: {
            color: {
              field: 'NAME_CHN',
              values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
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
            return `<span>${'hello ' + props.REGION_NAME}</span>`;
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
