import { RegionList, IRegion } from './const';

export function getRegionByAdcode(code: number) {
  const region = Object.values(RegionList).find((region: IRegion) => {
    return region.child.indexOf(code) !== -1;
  });

  return region;
}
