'use strict';

const wkx = require('wkx');

const geogHexToJSON = (hexCoord) => {
  if (!hexCoord) {
    return null;
  }
  const wkbBuffer = Buffer.from(hexCoord, 'hex');
  const geom = wkx.Geometry.parse(wkbBuffer);

  const {type, coordinates} = geom.toGeoJSON();

  return {
    type,
    coordinates: {
      lat: coordinates[1],
      lon: coordinates[0],
    },
  };
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
