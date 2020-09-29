import React from 'react';
import { Slider } from 'antd';
import { Scene } from '@antv/l7';
import { CityLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';

export default () => {
  const data = [
    {
      name: '上城区',
      value: '34.5',
      adcode: '330102',
    },
    {
      name: '下城区',
      value: '52.6',
      adcode: '330103',
    },
    {
      name: '江干区',
      value: '80.1',
      adcode: '330104',
    },
    {
      name: '拱墅区',
      value: '57.9',
      adcode: '330105',
    },
    {
      name: '西湖区',
      value: '90.8',
      adcode: '330106',
    },
    {
      name: '滨江区',
      value: '45.5',
      adcode: '330108',
    },
    {
      name: '萧山区',
      value: '158.5 ',
      adcode: '330109',
    },
    {
      name: '余杭区',
      value: '189.1',
      adcode: '330110',
    },
    {
      name: '富阳区',
      value: '74.4',
      adcode: '330111',
    },
    {
      name: '临安区',
      value: '59.6',
      adcode: '330112',
    },
    {
      name: '桐庐县',
      value: '43.6',
      adcode: '330122',
    },
    {
      name: '淳安县',
      value: '35.8',
      adcode: '330127',
    },
    {
      name: '建德市',
      value: '44.7',
      adcode: '330182',
    },
  ];
  let layer;
  const marks = {
    0: '0',
    200: '200万人',
  };

  function handleData(values) {
    let dataTmp = [];
    data.map(item => {
      if (item.value >= values[0] && item.value <= values[1])
        dataTmp.push(item);
    });
    return dataTmp;
  }

  function change(value) {
    layer.updateData(handleData(value));
  }

  React.useEffect(() => {
    const scene = new Scene({
      id: 'city',
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
      layer = new CityLayer(scene, {
        data,
        joinBy: ['adcode', 'adcode'],
        adcode: ['330000', '330100'], // adcode[0] 对应省行政编码  adcode[1] 对应市行政编码
        fill: {
          color: {
            field: 'value',
            values: value => {
              if (!value) return;
              if (value < 30) return '#FFE6D9';
              if (value < 60) return '#FFCBB3';
              if (value < 90) return '#FFAD86';
              if (value < 120) return '#FF8F59';
              if (value < 140) return '#FF5809';
              if (value < 200) return '#D94600';
            },
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
            return `<span>${props.NAME_CHN +
              '  人口：' +
              props.value +
              '万人'}</span>`;
          },
        },
      });
    });
  }, []);

  return (
    <div
      style={{
        height: '500px',
      }}
    >
      <div
        style={{
          height: '400px',
          position: 'relative',
        }}
        id="city"
      ></div>
      <div style={{ marginTop: '40px', padding: '0 100px' }}>
        <Slider
          marks={marks}
          onChange={change}
          max={200}
          range
          defaultValue={[0, 200]}
        />
      </div>
    </div>
  );
};
