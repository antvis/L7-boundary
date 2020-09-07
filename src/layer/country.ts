import { AttributeType, LineLayer, PointLayer, Scene } from '@antv/l7';
import { getDataConfig } from '../config';
import BaseLayer from './baseLayer';
import { IDistrictLayerOption } from './interface';

export default class CountryLayer extends BaseLayer {
  constructor(scene: Scene, option: Partial<IDistrictLayerOption> = {}) {
    super(scene, option);
    const { depth, showBorder } = this.options;
    this.addProvinceFill();
    this.addProvinceLabel();
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    if (showBorder) {
      this.addProvinceLine(countryConfig.provinceLine);
      if (depth === 2 * 1) {
        this.addCityBorder(countryConfig.fill);
      }
      if (depth === 3 * 1) {
        this.addCountyBorder(countryConfig.fill);
      }
    }
  }
  protected async addProvinceFill() {
    const { depth } = this.options;
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    const fillData = await this.fetchData(countryConfig.fill);
    this.addFillLayer(fillData);
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
      this.addLabelLayer(
        fillLabel.filter((v: any) => {
          return v.name !== '澳门';
        }),
      );
      this.addMCLabel();
    }
  }
  // 国界,省界
  protected async addProvinceLine(cfg: any) {
    const lineData = await this.fetchData(cfg);
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

  // 国界,省界
  // protected addFillLine(lineData: any) {
  //   const border1 = lineData.features.filter((feature: any) => {
  //     const type = feature.properties.type;
  //     return type === '1' || type === '4';
  //   });
  //   const borderFc = {
  //     type: 'FeatureCollection',
  //     features: border1,
  //   };
  //   const nationalBorder = lineData.features.filter((feature: any) => {
  //     const type = feature.properties.type;
  //     return type !== '1' && type !== '4';
  //   });
  //   const nationalFc = {
  //     type: 'FeatureCollection',
  //     features: nationalBorder,
  //   };
  //   this.addNationBorder(nationalFc, borderFc);
  // }

  private async loadData() {
    const { depth } = this.options;
    const countryConfig = getDataConfig(this.options.geoDataLevel).country.CHN[
      depth
    ];
    const fillData = await this.fetchData(countryConfig.fill);
    const fillLabel = countryConfig.label
      ? await this.fetchData(countryConfig.label)
      : null;
    return [fillData, fillLabel];
  }
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
    const { cityStroke, cityStrokeWidth, visible } = this.options;
    const cityline = new LineLayer({
      zIndex: 2,
      visible,
    })
      .source(border1)
      .color(cityStroke)
      .size(cityStrokeWidth)
      .style({
        opacity: 0.5,
      });
    this.scene.addLayer(cityline);
    this.layers.push(cityline);
  }

  // 县级边界
  private async addCountyBorder(cfg: any) {
    const border1 = await this.fetchData(cfg);
    const { countyStrokeWidth, countyStroke, visible } = this.options;
    const cityline = new LineLayer({
      zIndex: 2,
      visible,
    })
      .source(border1)
      .color(countyStroke)
      .size(countyStrokeWidth)
      .style({
        opacity: 0.5,
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
}
