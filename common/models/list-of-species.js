'use strict'

const ntypeOrderMap = (ntype) => {
    switch (ntype) {
        case "A":
        case "PA":
            return 1;
        case "S":
        case "DS":
            return 3;
        case "I":
            return 4;
        case "U":
            return 5;
        default:
            return 8;
    }
}

module.exports = function (Listofspecies) {

    Listofspecies.observe('before save', (ctx, next) => {
        ctx.instance.ntypeOrder = ntypeOrderMap(ctx.instance.ntype);
        next();
    });

};
