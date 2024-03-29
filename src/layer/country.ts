import { AttributeType, LineLayer, PointLayer, Scene } from '@antv/l7';
import { getDataConfig } from '../config';
import BaseLayer from './baseLayer';
import { IDistrictLayerOption, adcodeType } from './interface';
import { RegionList } from '../const';

export default class CountryLayer extends BaseLayer {
  protected layerType: string = 'Country';
  private fillRawData: any;
  constructor(scene: Scene, option: Partial<IDistrictLayerOption> = {}) {
    super(scene, option);
    this.init();
  }
  protected async init() {
    const { depth, showBorder } = this.options;
    await this.addProvinceFill();
    await this.addProvinceLabel();
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    if (showBorder) {
      await this.addProvinceLine(countryConfig.provinceLine);
      if (depth === 2 * 1) {
        await this.addCityBorder(countryConfig.fill);
      }
      if (depth === 3 * 1) {
        await this.addCountyBorder(countryConfig.fill);
      }
    }
    this.emit('loaded');
    this.loaded = true;
  }
  protected async addProvinceFill() {
    const { depth, adcode } = this.options;
    // 根据depth 获取数据
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    const fillData = await this.fetchData(countryConfig.fill);
    this.fillRawData = fillData;
    let data = fillData;
    if (adcode && Array.isArray(adcode) && adcode.length !== 0) {
      data = this.filterData(fillData, adcode);
    }
    this.fillData = data;
    this.addFillLayer(data);
  }
  protected async addProvinceLabel() {
    const { depth } = this.options;
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    const fillLabel = countryConfig.label
      ? await this.fetchData(countryConfig.label)
      : null;
    if (fillLabel && this.options.label?.enable) {
      const viewType = this.getOptions().viewType;
      if (viewType === 'standard') {
        this.addLabelLayer(
          fillLabel.filter((v: any) => {
            return v.name !== '澳门';
          }),
        );
        this.addMCLabel();
      } else {
        this.addLabelLayer(fillLabel);
      }
    }
  }
  // 国界,省界 完整国界
  protected async addProvinceLine(cfg: any) {
    const lineData = await this.fetchData(cfg);
    // 普通国界
    const border1 = lineData.features.filter((feature: any) => {
      const type = feature.properties.type;
      return type === '1';
    });
    // 香港 澳门
    const border2 = lineData.features.filter((feature: any) => {
      const type = feature.properties.type;
      return type === '4';
    });
    const borderFc = {
      type: 'FeatureCollection',
      features: border1,
    };

    const borderFc2 = {
      type: 'FeatureCollection',
      features: border2,
    };

    const nationalBorder = lineData.features.filter((feature: any) => {
      const type = feature.properties.type;
      return type !== '1' && type !== '4';
    });
    const nationalFc = {
      type: 'FeatureCollection',
      features: nationalBorder,
    };
    this.addNationBorder(nationalFc, borderFc, borderFc2);
  }

  // 普通边界
  protected async addNormalProvinceLine(cfg: any) {}

  // 省级行政区划
  private async addNationBorder(
    boundaries: any,
    boundaries2: any,
    boundaries3: any,
  ) {
    const {
      nationalStroke,
      provinceStroke,
      provinceStrokeWidth,
      nationalWidth,
      chinaNationalStroke,
      chinaNationalWidth,
      coastlineStroke,
      coastlineWidth,
      showBorder,
      stroke,
      strokeWidth,
      visible,
      zIndex,
      strokeOpacity,
    } = this.options;
    // 添加国界线
    const lineLayer = new LineLayer({
      zIndex: zIndex + 0.1,
      visible: visible && showBorder,
    })
      .source(boundaries)
      .size('type', (v: string) => {
        if (v === '3') {
          return provinceStrokeWidth;
        } else if (v === '2') {
          return coastlineWidth;
        } else if (v === '0') {
          return chinaNationalWidth;
        } else {
          return '#fff';
        }
      })
      .shape('line')
      .color('type', (v: string) => {
        if (v === '3') {
          return provinceStroke; // 省界
        } else if (v === '2') {
          return coastlineStroke; // 海岸线
        } else if (v === '0') {
          return chinaNationalStroke; // 中国国界线
        } else {
          return '#fff';
        }
      });
    // 添加未定国界
    const lineLayer2 = new LineLayer({
      zIndex: zIndex + 0.1,
      visible: visible && showBorder,
    })
      .source(boundaries2)
      .size(chinaNationalWidth)
      .shape('line')
      .color(chinaNationalStroke)
      .style({
        lineType: 'dash',
        dashArray: [2, 2],
      });

    // 添加澳门香港界限
    const lineLayer3 = new LineLayer({
      zIndex: zIndex + 0.1,
      visible: visible && showBorder,
    })
      .source(boundaries3)
      .size(provinceStrokeWidth)
      .shape('line')
      .color(provinceStroke)
      .style({
        lineType: 'dash',
        dashArray: [4, 2, 2, 2],
      });

    this.scene.addLayer(lineLayer);
    this.scene.addLayer(lineLayer2);
    this.scene.addLayer(lineLayer3);
    this.layers.push(lineLayer, lineLayer2, lineLayer3);
  }
  // 市边界
  private async addCityBorder(cfg: any) {
    const border1 = await this.fetchData(cfg);
    const {
      cityStroke,
      cityStrokeWidth,
      visible,
      strokeOpacity,
    } = this.options;
    const cityline = new LineLayer({
      zIndex: 2,
      visible,
    })
      .source(border1)
      .color(cityStroke)
      .size(cityStrokeWidth)
      .style({
        opacity: strokeOpacity,
      });
    this.scene.addLayer(cityline);
    this.layers.push(cityline);
  }

  // 县级边界
  private async addCountyBorder(cfg: any) {
    const border1 = await this.fetchData(cfg);
    const {
      countyStrokeWidth,
      countyStroke,
      visible,
      strokeOpacity,
    } = this.options;
    const cityline = new LineLayer({
      zIndex: 2,
      visible,
    })
      .source(border1)
      .color(countyStroke)
      .size(countyStrokeWidth)
      .style({
        opacity: strokeOpacity,
      });
    this.scene.addLayer(cityline);
    this.layers.push(cityline);
  }

  private addMCLabel() {
    const data = [
      {
        name: '澳门',
        center: [113.537747, 22.187009],
      },
    ];
    const labelLayer1 = this.addText(data, { maxZoom: 2.9 }, [-45, -10]);
    const labelLayer2 = this.addText(data, { minZoom: 3, maxZoom: 4 }, [
      -35,
      -10,
    ]);
    const labelLayer = this.addText(data, { minZoom: 4.1 }, [0, 0]);
    this.scene.addLayer(labelLayer);
    this.scene.addLayer(labelLayer1);
    this.scene.addLayer(labelLayer2);
    this.layers.push(labelLayer, labelLayer1, labelLayer2);
  }

  private filterData(data: any, adcode: adcodeType) {
    const adcodeArray = Array.isArray(adcode) ? adcode : [adcode];
    const features = data.features.filter((fe: any) => {
      // 根据Code过滤数据
      const { REGION_CODE, adcode_pro } = fe.properties;
      return (
        adcodeArray.indexOf('86') !== -1 ||
        adcodeArray.indexOf(86) !== -1 ||
        adcodeArray.indexOf(REGION_CODE) !== -1 ||
        adcodeArray.indexOf('' + REGION_CODE) !== -1 ||
        adcodeArray.indexOf(adcode_pro) !== -1 ||
        adcodeArray.indexOf('' + adcode_pro) !== -1
      );
    });
    return { type: 'FeatureCollection', features };
  }

  private addText(labelData: any, option: any, offset: [number, number]) {
    const { label, zIndex, visible } = this.options;
    const labelLayer = new PointLayer({
      zIndex: zIndex + 0.4,
      visible,
      ...option,
    })
      .source(labelData, {
        parser: {
          type: 'json',
          coordinates: 'center',
        },
      })
      .color(label.color as AttributeType)
      .shape('name', 'text')
      .size(label.size as AttributeType)
      .style({
        opacity: label.opacity,
        stroke: label.stroke,
        strokeWidth: label.strokeWidth,
        textAllowOverlap: label.textAllowOverlap,
        textOffset: offset,
      });
    return labelLayer;
  }

  private addRegionLabel() {
    const data = Object.values(RegionList).map(v => v);
    // console.log('data', data);
    // this.addLabelLayer(data);
  }
}
