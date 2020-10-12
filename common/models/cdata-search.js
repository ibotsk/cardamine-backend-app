'use strict';

const groupBy = require('lodash.groupby');

const isEmpty = (obj) => {
  const ne = Object.keys(obj).filter((k) => obj[k]);
  return ne.length === 0;
}

const getNameFromResult = (obj, prefix) => {
  const newObj = {};
  Object.keys(obj).filter((k) => k.startsWith(prefix))
    .forEach((k) => {
      newObj[k] = obj[k];
    });
  return newObj;
}

/**
 * Returns a string from properties of latestRevision and accepted, or
 * latestRevision and original if accepted is empty.
 * @param {object} item 
 */
const groupingKey = (item) => {
  const dataItem = item.__data;
  const latestRevisionObj = getNameFromResult(dataItem, 'latestRevision');
  const originalObj = getNameFromResult(dataItem, 'original');
  const acceptedObj = getNameFromResult(dataItem, 'accepted');

  let forKey = Object.keys(latestRevisionObj).map((k) => latestRevisionObj[k]);

  if (isEmpty(acceptedObj)) {
    const originalAsArray = Object.keys(originalObj).map((k) => originalObj[k]);
    forKey = [...forKey, ...originalAsArray];
  } else {
    const acceptedAsArray = Object.keys(acceptedObj).map((k) => acceptedObj[k]);
    forKey = [...forKey, ...acceptedAsArray];
  }
  const nb = forKey.filter((e) => typeof e !== 'boolean');

  return nb.map((e) => (
    e !== null && e !== undefined
      ? e.trim()
      : e
    )
  ).join('|');
}

module.exports = function(Cdatasearch) {

  /**
   * This function finds v_cdata_search results by given filter.
   * Then uses latetRevision, accepted and original name fields to group results
   * and count records for each group.
   * This is an override for unsupported sql filter GROUP BY.
   * 
   * !! WARNING: offset and limit are excluded from the filter !!
   * @param {object} filter 
   */
  Cdatasearch.grouped = async function (filter) {
    // idCdata is left in the result, it may come in handy
    const fields = {
      countedBy: false, n: false, dn: false,
      ploidyLevelRevised: false, xRevised: false, chCount: false,
      ploidyRevised: false, coordinatesLatDec: false, coordinatesLonDec: false,
      paperAuthor: false, idWorldL1: false, idWorldL2: false, idWorldL3: false,
      idWorldL4: false,
    };
    const { offset, limit, ...relevantFilters } = filter;
    const cdataResults =  await Cdatasearch.find({ ...relevantFilters, fields });
    const groupedResults = groupBy(cdataResults, groupingKey);

    const results = [];
    Object.keys(groupedResults).forEach((k) => {
      const items = groupedResults[k];
      const { idCdata, ...relevantProps } = items[0].__data; // first item is enough since they are in the same group
      relevantProps.cdataIds = items.map((e) => e.idCdata);
      relevantProps.recordsCount = items.length;
      results.push(relevantProps);
    })
    return results;
  }

  Cdatasearch.remoteMethod('grouped', {
    accepts: { arg: 'filter', type: 'object' },
    returns: {
      arg: 'data',
      root: true,
      type: [
        'CdataSearchGrouped'
      ]
    },
    http: { verb: 'get' }
  });

};
