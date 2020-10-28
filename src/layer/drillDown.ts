import { Scene, PointLayer } from '@antv/l7';
// tslint:disable-next-line: no-submodule-imports
import mergeWith from 'lodash/mergeWith';
import CityLayer from './city';
import CountryLayer from './country';
import { adcodeType, IDrillDownOption } from './interface';
import ProvinceLayer from './province';
import { RegionList } from '../const';
function mergeCustomizer(objValue: any, srcValue: any) {
  if (Array.isArray(srcValue)) {
    return srcValue;
  }
}
export default class DrillDownLayer {
  private options: Partial<IDrillDownOption>;
  private regionLayer: ProvinceLayer;
  private cityLayer: ProvinceLayer;
  private countyLayer: CityLayer;
  private provinceLayer: CountryLayer;
  private scene: Scene;
  private drillState: 0 | 0.5 | 1 | 2 = 0;
  private layers: any = [];
  constructor(scene: Scene, option: Partial<IDrillDownOption>) {
    this.options = mergeWith(this.getDefaultOption(), option, mergeCustomizer);
    this.scene = scene;
    // 默认初始化省地图
    const { drillStart = 0 } = this.options;

    drillStart === 0 &&
      (this.provinceLayer = new CountryLayer(scene, {
        ...this.getLayerOption('province'),
      }));
    drillStart <= 0.5 &&
      (this.regionLayer = new ProvinceLayer(
        scene,
        this.getLayerOption('region'),
      ));

    drillStart <= 1 &&
      (this.cityLayer = new ProvinceLayer(scene, this.getLayerOption('city')));

    drillStart <= 2 &&
      (this.countyLayer = new CityLayer(scene, this.getLayerOption('county')));

    this.scene.setMapStatus({ doubleClickZoom: false });
    if (!this.options.customTrigger) {
      drillStart === 0 &&
        this.provinceLayer.on('loaded', () => {
          // 支持大区 或者省份下钻
          this.addCountryEvent();
          this.layers.push(this.provinceLayer);
        });
      drillStart <= 0.5 &&
        this.regionLayer.on('loaded', () => {
          // 支持大区 或者省份下钻
          this.addRegionEvent();
          // this.regionLayer.hide();
          this.layers.push(this.regionLayer);
        });
      drillStart <= 1 &&
        this.cityLayer.on('loaded', () => {
          this.addProvinceEvent();
          this.layers.push(this.cityLayer);
        });
      drillStart <= 2 &&
        this.countyLayer.on('loaded', () => {
          this.addCityEvent();
          this.layers.push(this.countyLayer);
        });
    }
  }
  public getDefaultOption() {
    return {
      drillDepth: 2,
      drillStart: 0,
      customTrigger: false,
      autoUpdateData: true,
      regionDrill: false,
      drillDownTriggerEvent: 'click',
      drillUpTriggerEvent: 'undblclick',
      provinceData: [],
      cityData: [],
      countyData: [],
      city: {
        adcode: [],
        depth: 2,
      },
      region: {
        adcode: [],
        depth: 0,
      },
      county: {
        adcode: [],
      },
    };
  }
  // 国家视角 下钻
  public addCountryEvent() {
    const { drillDownTriggerEvent, drillDownEvent } = this.options;
    // 省级下钻到市
    this.provinceLayer.fillLayer.on(
      drillDownTriggerEvent as string,
      (e: any) => {
        let adcode = e.feature.properties.adcode;
        let type = 'province';
        if (this.options.regionDrill) {
          const REGION_CODE = e.feature.properties.REGION_CODE as string;
          adcode = RegionList[REGION_CODE].child; // 下钻到省级
          this.drillState = 0.5;
          type = 'region';
        }
        // 下钻到省份
        this.provinceLayer.hide();
        this.drillDown(adcode);
        drillDownEvent && drillDownEvent(e.feature.properties, type);
      },
    );
  }
  // 大区下钻
  public addRegionEvent() {
    const {
      drillDownTriggerEvent,
      drillUpTriggerEvent,
      drillUpEvent,
      drillDownEvent,
    } = this.options;
    this.regionLayer.fillLayer.on(drillUpTriggerEvent as string, e => {
      const properties = this.getProperties(
        this.regionLayer.getFillData(),
        this.regionLayer.getOptions().adcode,
      );
      this.drillUp();
      drillUpEvent && drillUpEvent(properties);
    });
    this.regionLayer.fillLayer.on(drillDownTriggerEvent as string, (e: any) => {
      this.drillState = 0;
      this.drillDown(e.feature.properties.adcode);
      drillDownEvent && drillDownEvent(e.feature.properties, 'province');
    });
  }
  // 省份视角下钻
  public addProvinceEvent() {
    const {
      drillDownTriggerEvent,
      drillUpTriggerEvent,
      drillUpEvent,
      drillDownEvent,
    } = this.options;
    this.cityLayer.fillLayer.on(drillUpTriggerEvent as string, () => {
      // const properties = this.getProperties(
      //   this.provinceLayer.getFillData(),
      //   this.cityLayer.getOptions().adcode,
      // );
      this.drillState = 1;
      this.drillUp();
      drillUpEvent && drillUpEvent({});
    });
    this.cityLayer.fillLayer.on(drillDownTriggerEvent as string, (e: any) => {
      this.drillState = 1;
      this.drillDown(e.feature.properties.adcode);
      drillDownEvent && drillDownEvent(e.feature.properties, 'city');
    });
  }

  public addCityEvent() {
    const {
      drillDownTriggerEvent,
      drillUpTriggerEvent,
      drillUpEvent,
    } = this.options;
    this.countyLayer.fillLayer.on(drillUpTriggerEvent as string, () => {
      // const properties = this.getProperties(
      //   this.cityLayer.getFillData(),
      //   this.countyLayer.getOptions().adcode,
      // );
      this.drillUp();
      drillUpEvent && drillUpEvent({});
    });
  }

  public show() {
    this.layers.forEach((layer: any) => layer.show());
  }

  public hide() {
    this.layers.forEach((layer: any) => layer.hide());
  }

  public destroy() {
    this.layers.forEach((layer: any) => layer.destroy());
  }
  // 省份视图 城市粒度
  public showProvinceView(
    adcode: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    this.cityLayer.show();
    if (this.options.autoUpdateData) {
      this.cityLayer.updateDistrict(adcode, newData, joinByField);
      this.cityLayer.fillLayer.fitBounds();
    }
    if (this.options.regionDrill) {
      this.regionLayer.hide();
    } else {
      this.countyLayer.hide();
    }
    this.drillState = 1;
  }
  // 城市视图 区县粒度
  public showCityView(
    code: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    this.countyLayer.show();
    let adcode: string | string[] = `${code}`;
    if (adcode.substr(2, 2) === '00') {
      // 重庆包含两个编码
      adcode = [adcode.substr(0, 2) + '0100', adcode.substr(0, 2) + '0200'];
    }
    // 更新县级行政区划
    if (this.options.autoUpdateData) {
      this.countyLayer.updateDistrict(adcode, newData, joinByField);
      this.countyLayer.fillLayer.fitBounds();
    }
    this.cityLayer.hide();
    this.drillState = 2;
  }

  // 大区视图 省份视角
  public showRegionView(
    adcode: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    this.regionLayer.show();
    if (this.options.autoUpdateData) {
      this.regionLayer.updateDistrict(adcode, newData, joinByField);
      this.regionLayer.fillLayer.fitBounds();
    }
    this.countyLayer.hide();
    this.drillState = 0.5;
  }

  /**
   * 向上
   */
  public drillUp() {
    const { drillStart = 0 } = this.options;
    if (this.drillState <= drillStart) {
      return;
    }
    switch (this.drillState) {
      case 2:
        this.cityLayer.show();
        this.cityLayer.fillLayer.fitBounds();
        this.countyLayer.hide();
        this.drillState = 1;
        break;
      case 0.5:
        this.provinceLayer.show();
        this.provinceLayer.fillLayer.fitBounds();
        this.regionLayer.hide();
        this.drillState = 0;
        break;
      case 1:
        if (this.options.regionDrill) {
          this.regionLayer.show();
          this.regionLayer.fillLayer.fitBounds();
          this.cityLayer.hide();
          this.drillState = 0.5;
        } else {
          this.provinceLayer.show();
          this.provinceLayer.fillLayer.fitBounds();
          this.cityLayer.hide();
          this.drillState = 0;
        }
        break;
    }
  }
  public drillDown(
    adcode: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    const { drillDepth } = this.options;
    if (this.drillState === drillDepth) {
      return;
    }
    switch (this.drillState) {
      case 0:
        this.showProvinceView(adcode, newData, joinByField); // 市
        break;
      case 0.5:
        this.showRegionView(adcode, newData, joinByField); // 省
        break;
      case 1:
        this.showCityView(adcode, newData, joinByField); // 区县
        break;
    }
  }

  public updateData(
    layer: 'province' | 'city' | 'county' | 'region',
    newData: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    switch (layer) {
      case 'province':
        this.provinceLayer.updateData(newData, joinByField);
        this.provinceLayer.fillLayer.fitBounds();
        break;
      case 'region':
        this.regionLayer.updateData(newData, joinByField);
        this.regionLayer.fillLayer.fitBounds();
        break;
      case 'city':
        this.cityLayer.updateData(newData, joinByField);
        this.cityLayer.fillLayer.fitBounds();
        break;
      case 'county':
        this.countyLayer.updateData(newData, joinByField);
        this.countyLayer.fillLayer.fitBounds();
    }
  }

  private getLayerOption(type: 'province' | 'city' | 'county' | 'region') {
    const {
      joinBy,
      label,
      bubble,
      fill,
      popup,
      geoDataLevel,
      onClick,
    } = this.options;

    const datatype = (type + 'Data') as
      | 'provinceData'
      | 'cityData'
      | 'countyData'
      | 'regionData';
    return {
      data: this.options[datatype],
      joinBy,
      label,
      bubble,
      fill,
      popup,
      onClick,
      geoDataLevel,
      ...this.options[type],
    };
  }

  private getProperties(data: any, adcode: adcodeType) {
    const adcodeArray = Array.isArray(adcode) ? adcode : [adcode];
    const feature = data.features.filter((fe: any) => {
      const code = fe.properties.adcode;
      return (
        adcodeArray.indexOf(code) !== -1 ||
        adcodeArray.indexOf('' + code) !== -1
      );
    });
    return feature[0] ? feature[0].properties : {};
  }
}
