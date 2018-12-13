'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'cardamine';
const dataSourceConfig = require('../server/datasources.json');
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);

const models = [
    'cdata',
    'dcomments',
    'display_types',
    'dna',
    'family',
    'history',
    'list_of_species',
    'literature',
    'los_comments',
    'material',
    'persons',
    'phytogeographical_district',
    'reference',
    'synonyms',
    'world_l1',
    'world_l2',
    'world_l3',
    'world_l4'
];

discover(models).then(
    success => process.exit(),
    error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
);

function makeJsModel(modelName) {
    const modelNameNoSpaces = modelName.replace(/\_/g, '');
    const modelNameFirstCapital = modelNameNoSpaces.charAt(0).toUpperCase() + modelNameNoSpaces.slice(1);
    const contents = `'use strict'\n\nmodule.exports = function(${modelNameFirstCapital}) {\n\n};\n`;

    return contents;
}

async function discover(models) {
    // It's important to pass the same "options" object to all calls
    // of dataSource.discoverSchemas(), it allows the method to cache
    // discovered related models
    const options = { relations: true };

    // Discover models and relations

    await mkdirp('../common/models');

    const schemas_config = {};
    for (const model of models) {
        const schema = await db.discoverSchemas(model, options);

        const modelDashed = model.replace(/\_/g, '-');
        const schemaModel = schema[`public.${model}`];

        schemaModel.base = "PersistedModel";
        schemaModel.name = modelDashed;

        const filePath = `../common/models/${modelDashed}`;
        // write json file
        await writeFile(
            `${filePath}.json`,
            JSON.stringify(schemaModel, null, 2)
        );
        // write js file
        await writeFile(
            `${filePath}.js`,
            makeJsModel(model)
        );

        schemas_config[modelDashed] = { dataSource: DATASOURCE_NAME, public: true };

    }

    // Expose models via REST API
    const modelConfigFile = '../server/model-config.json';
    const configJson = await readFile(modelConfigFile, 'utf-8');
    console.log('MODEL CONFIG', configJson);
    const config = JSON.parse(configJson);
    const mergedConfig = {...config, ...schemas_config};

    await writeFile(
        modelConfigFile,
      JSON.stringify(mergedConfig, null, 2)
    );
}