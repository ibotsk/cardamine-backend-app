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

/**
 *
 * @param {string} coordinatesString stringified JSON that must contain lat and lon
 */
const geogJSONToHex = (coordinatesString) => {
  const {coordinates} = JSON.parse(coordinatesString);
  const {lat, lon} = coordinates;

  if (!lat || !lon) {
    throw new Error(
      `Both latitude and longitude must be provided. Was lat=${lat} lon=${lon}`
    );
  }

  // TODO: default SRID is 4326 but the lib doesn't take any other SRID into account
  const wkb = new wkx.Point(lon, lat).toWkb();
  return wkb.toString('hex');
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

  // coordinatesGeoref and coordinatesForMap of input object must be a stringified JSON with coordinates
  Material.observe('before save', (ctx, next) => {
    const {instance} = ctx;
    if (!instance) {
      throw new Error('No instance to save');
    }

    if (instance.coordinatesGeoref) {
      instance.coordinatesGeoref = geogJSONToHex(
        instance.coordinatesGeoref
      );
    }
    if (instance.coordinatesForMap) {
      instance.coordinatesForMap = geogJSONToHex(
        instance.coordinatesForMap
      );
    }

    return next();
  });
};
