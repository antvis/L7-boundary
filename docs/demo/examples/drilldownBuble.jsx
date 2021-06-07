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
        minZoom: 3,
        maxZoom: 10,
      }),
    });
    scene.on('loaded', () => {
      new DrillDownLayer(scene, {
        autoFit: false,
        data: [],
        autoUpdateData: false,
        type: 'DrillDownLayer',
        joinBy: ['NAME_CHN', 'name'],
        viewStart: 'Country',
        viewEnd: 'Province',
        provinceStroke: '#ccc',
        cityStroke: '#EBCCB4',
        cityStrokeWidth: 1,
        fill: { color: '#ccc' },
        label: { size: 12 },
        popup: { enable: true },
        bubble: {
          enable: true,
          size: { field: 'value', values: [3, 20] },
        },
        drillUpTriggerEvent: 'none',
        province: {
          data: [
            { name: '上海市', value: 4161 },
            { name: '云南省', value: 5608 },
            { name: '内蒙古自治区', value: 6090 },
            { name: '北京市', value: 2367 },
            { name: '台湾省', value: 3395 },
            { name: '吉林省', value: 5157 },
            { name: '四川省', value: 7749 },
            { name: '天津市', value: 5328 },
            { name: '宁夏回族自治区', value: 2900 },
            { name: '安徽省', value: 4 },
          ],
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
