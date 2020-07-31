'use strict';

const groupBy = require('lodash.groupby');

const areEmpty = (vals) => {
  const ne = vals.filter((e) => e);
  return ne.length === 0;
}

/**
 * Returns a string from properties of latestRevision and accepted, or
 * latestRevision and original if accepted is empty.
 * @param {object} item 
 */
const groupingKey = (item) => {
  const {
    latestRevisionGenus, latestRevisionSpecies, latestRevisionAuthors,
    latestRevisionSubsp, latestRevisionVar, latestRevisionSubvar,
    latestRevisionForma, latestRevisionProles, latestRevisionUnranked,
    latestRevisionGenusH, latestRevisionSpeciesH, latestRevisionAuthorsH,
    latestRevisionSubspH, latestRevisionVarH, latestRevisionSubvarH,
    latestRevisionFormaH,
    originalGenus, originalSpecies, originalAuthors,
    originalSubsp, originalVar, originalSubvar,
    originalForma, originalProles, originalUnranked,
    originalGenusH, originalSpeciesH, originalAuthorsH,
    originalSubspH, originalVarH, originalSubvarH,
    originalFormaH,
    acceptedGenus, acceptedSpecies, acceptedAuthors,
    acceptedSubsp, acceptedVar, acceptedSubvar,
    acceptedForma, acceptedProles, acceptedUnranked,
    acceptedGenusH, acceptedSpeciesH, acceptedAuthorsH,
    acceptedSubspH, acceptedVarH, acceptedSubvarH,
    acceptedFormaH,
  } = item;
  let forKey = [latestRevisionGenus, latestRevisionSpecies, latestRevisionAuthors,
    latestRevisionSubsp, latestRevisionVar, latestRevisionSubvar,
    latestRevisionForma, latestRevisionProles, latestRevisionUnranked,
    latestRevisionGenusH, latestRevisionSpeciesH, latestRevisionAuthorsH,
    latestRevisionSubspH, latestRevisionVarH, latestRevisionSubvarH,
    latestRevisionFormaH];

  const accepted = [
    acceptedGenus, acceptedSpecies, acceptedAuthors,
    acceptedSubsp, acceptedVar, acceptedSubvar,
    acceptedForma, acceptedProles, acceptedUnranked,
    acceptedGenusH, acceptedSpeciesH, acceptedAuthorsH,
    acceptedSubspH, acceptedVarH, acceptedSubvarH,
    acceptedFormaH
  ];

  if (areEmpty(accepted)) {
    forKey = [...forKey, originalGenus, originalSpecies, originalAuthors,
      originalSubsp, originalVar, originalSubvar,
      originalForma, originalProles, originalUnranked,
      originalGenusH, originalSpeciesH, originalAuthorsH,
      originalSubspH, originalVarH, originalSubvarH,
      originalFormaH];
  } else {
    forKey = [...forKey, ...accepted];
  }
  return forKey.map((e) => e ? e.trim() : e).join('|');
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
