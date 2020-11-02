import {
  ILayer,
  LineLayer,
  PointLayer,
  PolygonLayer,
  Scene,
  StyleAttrField,
} from '@antv/l7';
// tslint:disable-next-line: no-submodule-imports
import merge from 'lodash/merge';
import { getDataConfig } from '../config';
import ProvinceLayer from './province';
import { adcodeType, IDistrictLayerOption } from './interface';
import { RegionList } from '../const';

export interface IProvinceLayerOption extends IDistrictLayerOption {
  adcode: adcodeType;
}
export default class RegionLayer extends ProvinceLayer {
  protected layerType: string = 'Region';
}
