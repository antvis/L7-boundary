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
      const drillLayer = new DrillDownLayer(scene, {
        viewStart: 'Country',
        viewEnd: 'County',
        provinceData: [
          { areaCode: '100', govTrans_avgTrdCnt30d: 6198254 },
          { areaCode: '102', govTrans_avgTrdCnt30d: 1688510 },
          { areaCode: '301', govTrans_avgTrdCnt30d: 4710502 },
          { areaCode: '', govTrans_avgTrdCnt30d: 8412 },
          { areaCode: '3', govTrans_avgTrdCnt30d: 2017222 },
          { areaCode: '101', govTrans_avgTrdCnt30d: 3660468 },
          { areaCode: '103', govTrans_avgTrdCnt30d: 1748562 },
          { areaCode: '104', govTrans_avgTrdCnt30d: 6425560 },
        ],
        provinceStroke: '#333',
        drillDownTriggerEvent: 'dblclick',
        fill: {
          color: {
            field: 'REGION_NAME',
            values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
          },
        },
        // province: {
        //   joinBy: ['REGION_CODE', 'areaCode'],
        //   provinceStroke: 'rgba(255,255,255,0.1)',
        // },
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
          // adcode: [330000],
          strokeOpacity: 0.5,
          fill: {
            color: {
              field: 'NAME_CHN',
              values: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
            },
          },
        },
        onClick: (e, layerType) => {
          console.log('click', e, layerType);
        },
        drillUpEvent: props => {
          console.log('drillUpEvent', props);
        },
        drillDownEvent: (props, type) => {
          console.log(type, props);
        },
        popup: {
          enable: true,
          Html: props => {
            return `<span>${props.REGION_NAME}:${props.govTrans_avgTrdCnt30d}</span>`;
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
