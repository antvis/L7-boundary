import { Scene, PointLayer } from '@antv/l7';
// tslint:disable-next-line: no-submodule-imports
import mergeWith from 'lodash/mergeWith';
import CityLayer from './city';
import CountryLayer from './country';
import RegionLayer from './region';
import { adcodeType, IDrillDownOption, DRILL_LEVEL } from './interface';
import ProvinceLayer from './province';
import { RegionList, DRILL_TYPE_LIST } from '../const';
function mergeCustomizer(objValue: any, srcValue: any) {
  if (Array.isArray(srcValue)) {
    return srcValue;
  }
}

export default class DrillDownLayer {
  public drillState: DRILL_LEVEL;
  private options: Partial<IDrillDownOption>;
  private regionLayer: RegionLayer;
  private cityLayer: ProvinceLayer;
  private countyLayer: CityLayer;
  private provinceLayer: CountryLayer;
  private scene: Scene;
  private layers: any = [];
  private drillList: Array<DRILL_LEVEL>;
  constructor(scene: Scene, option: Partial<IDrillDownOption>) {
    this.options = mergeWith(this.getDefaultOption(), option, mergeCustomizer);
    this.drillState = this.options.viewStart as DRILL_LEVEL;
    this.scene = scene;
    this.drillList = this.getViewList();
    // 初始化各层级图层；
    this.initLayers(scene);
    this.initLayerEvent();
    this.scene.setMapStatus({ doubleClickZoom: false });
  }
  public getDefaultOption() {
    return {
      drillDepth: 2,
      drillStart: 1,
      customTrigger: false,
      autoUpdateData: true,
      regionDrill: false,
      drillDownTriggerEvent: 'click',
      drillUpTriggerEvent: 'undblclick',
      provinceData: [],
      viewStart: 'Country',
      viewEnd: 'County',
      cityData: [],
      countyData: [],
      city: {
        adcode: [],
        depth: 2,
      },
      region: {
        adcode: [],
        depth: 1,
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
        let type: DRILL_LEVEL = 'Province';
        this.drillState = 'Province';
        if (this.options.regionDrill) {
          const REGION_CODE = e.feature.properties.REGION_CODE as string;
          adcode = RegionList[REGION_CODE].child; // 下钻到省级
          this.drillState = 'Region';
          type = 'Region';
        }
        // 下钻到省份
        if (this.options.autoUpdateData) {
          this.drillDown(adcode);
        }
        // 下钻事件
        if (this.drillList.indexOf(type) !== -1) {
          this.provinceLayer.hide();
          drillDownEvent && drillDownEvent(e.feature.properties, type, adcode);
        }
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
      // const properties = this.getProperties(
      //   this.regionLayer.getFillData(),
      //   this.regionLayer.getOptions().adcode,
      // );
      this.drillUp('Country');
      if (this.drillList.indexOf('Country') !== -1)
        drillUpEvent &&
          drillUpEvent({
            from: 'region',
            to: 'country',
          });
    });
    this.regionLayer.fillLayer.on(drillDownTriggerEvent as string, (e: any) => {
      this.drillState = 'Province';
      if (this.options.autoUpdateData) {
        this.drillDown(e.feature.properties.adcode);
      }
      // 是否下钻
      if (this.drillList.indexOf('Province') !== -1) {
        this.regionLayer.hide();
        drillDownEvent &&
          drillDownEvent(
            e.feature.properties,
            'Province',
            e.feature.properties.adcode,
          );
      }
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
      this.drillState = 'Province';
      const next = this.options.regionDrill ? 'Region' : 'Country';
      this.drillUp(next as DRILL_LEVEL);
      if (this.drillList.indexOf(next) !== -1)
        drillUpEvent &&
          drillUpEvent({
            to: next,
            from: 'Province',
          });
    });

    this.cityLayer.fillLayer.on(drillDownTriggerEvent as string, (e: any) => {
      this.drillState = 'City';
      if (this.options.autoUpdateData) {
        this.drillDown(e.feature.properties.adcode);
      }
      if (this.drillList.indexOf('City') !== -1) {
        drillDownEvent &&
          drillDownEvent(
            e.feature.properties,
            'City',
            e.feature.properties.adcode,
          );
      }
    });
  }
  // 添加县级行政区划
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
      this.drillUp('Province');
      if (this.drillList.indexOf('Province') !== -1)
        drillUpEvent &&
          drillUpEvent({
            to: 'Province',
            from: 'city',
          });
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
    this.cityLayer.updateDistrict(adcode, newData, joinByField);
    this.cityLayer.fillLayer.fitBounds();
    if (this.options.regionDrill) {
      this.regionLayer.hide();
    } else {
      this.provinceLayer.hide();
    }
    this.drillState = 'Province';
  }
  // 城市视图 区县粒度
  public showCityView(
    code: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    this.countyLayer.show();
    let adcode: string | string[] = `${code}`;
    if (adcode.substr(0, 4) === '5000') {
      // 重庆包含两个编码
      adcode = [adcode.substr(0, 2) + '0100', adcode.substr(0, 2) + '0200'];
    } else if (
      adcode.substr(2, 2) === '00' &&
      adcode !== '810000' &&
      adcode !== '820000'
    ) {
      adcode = [adcode.substr(0, 2) + '0100'];
    }
    // 更新县级行政区划
    this.countyLayer.updateDistrict(adcode, newData, joinByField);
    this.countyLayer.fillLayer.fitBounds();
    this.cityLayer.hide();
    this.drillState = 'City';
  }

  // 大区视图 省份视角
  public showRegionView(
    adcode: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    this.regionLayer.show();
    this.regionLayer.updateDistrict(adcode, newData, joinByField);
    this.regionLayer.fillLayer.fitBounds();

    this.provinceLayer.hide();
    this.drillState = 'Region';
  }

  /**
   * 向上
   */
  public drillUp(type: DRILL_LEVEL) {
    if (this.drillList.indexOf(type) === -1) {
      return;
    }
    switch (type) {
      case 'Province':
        this.cityLayer.show();
        this.cityLayer.fillLayer.fitBounds();
        this.countyLayer.hide();
        this.drillState = 'Province';
        break;
      case 'Country':
        this.provinceLayer.show();
        this.provinceLayer.fillLayer.fitBounds();
        if (this.options.regionDrill) {
          this.regionLayer.hide();
        } else {
          this.cityLayer.hide();
        }
        this.drillState = 'Country';
        break;
      case 'Region':
        if (this.options.regionDrill) {
          this.regionLayer.show();
          this.regionLayer.fillLayer.fitBounds();
          this.cityLayer.hide();
          this.drillState = 'Region';
        }
        break;
    }
  }
  public drillDown(
    adcode: adcodeType,
    newData?: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    if (this.drillList.indexOf(this.drillState) === -1) {
      return;
    }
    switch (this.drillState) {
      case 'Province':
        this.showProvinceView(adcode, newData, joinByField); // 市
        break;
      case 'Region':
        this.showRegionView(adcode, newData, joinByField); // 省
        break;
      case 'City':
        this.showCityView(adcode, newData, joinByField); // 区县
        break;
    }
  }

  public updateData(
    layer: DRILL_LEVEL,
    newData: Array<{ [key: string]: any }>,
    joinByField?: [string, string],
  ) {
    switch (layer) {
      case 'Country':
      case 'province':
        this.provinceLayer.updateData(newData, joinByField);
        break;
      case 'Region':
      case 'region':
        this.regionLayer.updateData(newData, joinByField);
        break;
      case 'Province':
      case 'city':
        this.cityLayer.updateData(newData, joinByField);
        break;
      case 'City':
      case 'county':
        this.countyLayer.updateData(newData, joinByField);
    }
  }

  private getLayerOption(type: DRILL_LEVEL) {
    const {
      joinBy,
      label,
      bubble,
      fill,
      popup,
      geoDataLevel,
      onClick,
    } = this.options;

    const datatype = (type.toLowerCase() + 'Data') as
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
      ...this.options[type.toLowerCase() as string],
    };
  }

  private initLayers(scene: Scene) {
    const viewList = this.getViewList();
    viewList.indexOf('Country') !== -1 &&
      (this.provinceLayer = new CountryLayer(scene, {
        ...this.getLayerOption('Province'),
      }));
    viewList.indexOf('Region') !== -1 &&
      (this.regionLayer = new RegionLayer(
        scene,
        this.getLayerOption('Region'),
      ));

    viewList.indexOf('Province') !== -1 &&
      (this.cityLayer = new ProvinceLayer(scene, this.getLayerOption('City')));

    viewList.indexOf('City') !== -1 &&
      (this.countyLayer = new CityLayer(scene, this.getLayerOption('County')));
  }

  private initLayerEvent() {
    const viewList = this.getViewList();
    if (!this.options.customTrigger) {
      viewList.indexOf('Country') !== -1 &&
        this.provinceLayer.on('loaded', () => {
          // 支持大区 或者省份下钻
          this.addCountryEvent();
          if (this.options.viewStart !== 'Country') this.provinceLayer.hide();
          this.layers.push(this.provinceLayer);
        });
      viewList.indexOf('Region') !== -1 &&
        this.regionLayer.on('loaded', () => {
          // 支持大区 或者省份下钻

          this.addRegionEvent();
          if (this.options.viewStart !== 'Region') this.regionLayer.hide();
          this.layers.push(this.regionLayer);
        });
      viewList.indexOf('Province') !== -1 &&
        this.cityLayer.on('loaded', () => {
          this.addProvinceEvent();
          if (this.options.viewStart !== 'Province') this.cityLayer.hide();
          this.layers.push(this.cityLayer);
        });
      viewList.indexOf('City') !== -1 &&
        this.countyLayer.on('loaded', () => {
          this.addCityEvent();
          if (this.options.viewStart !== 'City') this.countyLayer.hide();
          this.layers.push(this.countyLayer);
        });
    }
  }
  private getViewList(): Array<DRILL_LEVEL> {
    const { viewStart, viewEnd } = this.options;
    let drillList = DRILL_TYPE_LIST;
    if (!this.options.regionDrill && drillList.indexOf('Region') !== -1) {
      drillList.splice(1, 1);
    }
    const start = drillList.indexOf(viewStart as string);
    const end = drillList.indexOf(viewEnd as string);
    if (start === -1 || end === -1 || end < start) {
      throw new Error('下钻 viewStart, viewEnd 参数错误');
    }
    return drillList.slice(start, end + 1) as DRILL_LEVEL[];
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
  public enablePopup() {
    if (this.cityLayer) {
      this.cityLayer.enablePopup();
    }
    if (this.countyLayer) {
      this.countyLayer.enablePopup();
    }
    if (this.provinceLayer) {
      this.provinceLayer.enablePopup();
    }
    if (this.regionLayer) {
      this.regionLayer.enablePopup();
    }
  }
  public disablePopup() {
    if (this.cityLayer) {
      this.cityLayer.disablePopup();
    }
    if (this.countyLayer) {
      this.countyLayer.disablePopup();
    }
    if (this.provinceLayer) {
      this.provinceLayer.disablePopup();
    }
    if (this.regionLayer) {
      this.regionLayer.disablePopup();
    }
  }
}
