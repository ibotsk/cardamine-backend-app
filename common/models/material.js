'use strict';

const wkx = require('wkx');

const geogHexToJSON = (hexCoord) => {
  const wkbBuffer = Buffer.from(hexCoord, 'hex');
  const geom = wkx.Geometry.parse(wkbBuffer);

  return geom.toGeoJSON();
};

module.exports = function(Material) {
  Material.observe('loaded', (ctx, next) => {
    const data = ctx.data;
    if (data) {
      if (data.coordinatesGeoref) {
        data.coordinatesGeoref = geogHexToJSON(data.coordinatesGeoref);
      }
      if (data.coordinatesForMap) {
        data.coordinatesForMap = geogHexToJSON(data.coordinatesForMap);
      }
    }

    return next();
  });
};
