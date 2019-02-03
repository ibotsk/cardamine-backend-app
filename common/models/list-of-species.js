'use strict'

const ntypeOrderMap = (ntype) => {
    switch (ntype) {
        case "A":
        case "PA":
            return 1;
        case "S":
        case "DS":
            return 3;
        case "U":
            return 5;
        default:
            return 8;
    }
}

module.exports = function (Listofspecies) {

    Listofspecies.beforeSave = function (next, modelInstance) {

        if (modelInstance.synType && parseInt(modelInstance.synType) === 1) {
            modelInstance.ntypeOrder = 4;
        } else {
            modelInstance.ntypeOrder = ntypeOrderMap(modelInstance.ntype);
        }
        next();
    };

};
