import { Scene } from '@antv/l7';
import { RegionLayer, RegionList } from '@antv/l7-district';
import { GaodeMap, Mapbox } from '@antv/l7-maps';
import { Select } from 'antd';
import * as React from 'react';
const { Option } = Select;

export default class Province extends React.Component {
  public state = {
    province: RegionList['101'].child,
  };
  // @ts-ignore
  private scene: Scene;
  private provinceLayer: ProvinceLayer;
  public componentWillUnmount() {
    this.scene.destroy();
  }

  public async componentDidMount() {
    const response = await fetch(
      'https://gw.alipayobjects.com/os/bmw-prod/149b599d-21ef-4c24-812c-20deaee90e20.json',
    );
    const provinceData = await response.json();
    const data = Object.keys(provinceData).map((key: string) => {
      return {
        code: key,
        name: provinceData[key][0],
        pop: provinceData[key][3],
      };
    });
    const scene = new Scene({
      id: 'map',
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
      const { province } = this.state;
      this.provinceLayer = new RegionLayer(scene, {
        adcode: province,
        depth: 1,
        label: {
          field: 'NAME_CHN',
          textAllowOverlap: false,
        },
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
        popup: {
          enable: true,
          Html: props => {
            return `<span>${props.NAME_CHN}</span>`;
          },
        },
      });
    });
    this.scene = scene;
  }

  public render() {
    return (
      <>
        <div
          id="map"
          style={{
            height: '400px',
            position: 'relative',
          }}
        />
      </>
    );
  }

  private handleProvinceChange = (value: string) => {
    this.setState({
      province: value,
    });
    this.provinceLayer.updateDistrict(RegionList[value].child);
  };
}
