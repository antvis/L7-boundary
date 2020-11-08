// tslint:disable-next-line: no-submodule-imports
import merge from 'lodash/merge';

import { adcodeType, IDistrictLayerOption } from './interface';
import ProvinceLayer from './province';

export interface IProvinceLayerOption extends IDistrictLayerOption {
  adcode: adcodeType;
}
export default class CityLayer extends ProvinceLayer {
  protected layerType: string = 'City';
  protected getDefaultOption(): IProvinceLayerOption {
    const config = super.getDefaultOption();
    return merge({}, config, {
      adcode: ['110000'],
      depth: 3,
    });
  }
  protected filterData(data: any, adcode: adcodeType) {
    const adcodeArray = Array.isArray(adcode) ? adcode : [adcode];
    const features = data.features.filter((fe: any) => {
      const { adcode_cit, adcode } = fe.properties;
      return (
        adcodeArray.indexOf(adcode_cit) !== -1 ||
        adcodeArray.indexOf('' + adcode_cit) !== -1 ||
        adcodeArray.indexOf(adcode) !== -1 ||
        adcodeArray.indexOf('' + adcode) !== -1
      );
    });
    return { type: 'FeatureCollection', features };
  }

  protected filterLabelData(data: any, adcode: adcodeType) {
    const adcodeArray = Array.isArray(adcode) ? adcode : [adcode];
    const features = data.filter((fe: any) => {
      const { adcode_cit, adcode } = fe;
      return (
        adcodeArray.indexOf(adcode_cit) !== -1 ||
        adcodeArray.indexOf('' + adcode_cit) !== -1 ||
        adcodeArray.indexOf(adcode) !== -1 ||
        adcodeArray.indexOf('' + adcode) !== -1
      );
    });
    return features;
  }
}
