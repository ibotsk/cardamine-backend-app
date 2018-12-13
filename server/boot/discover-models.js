'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'cardamine';
const dataSourceConfig = require('../datasources.json');
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

async function discover(models) {
    // It's important to pass the same "options" object to all calls
    // of dataSource.discoverSchemas(), it allows the method to cache
    // discovered related models
    const options = { relations: true };

    // Discover models and relations

    await mkdirp('../../common/models');

    const schemas_config = {};
    for (const model of models) {
        const schema = await db.discoverSchemas(model, options);

        const modelDashed = model.replace('_', '-');
        await writeFile(
            `../../common/models/${modelDashed}.json`,
            JSON.stringify(schema[`public.${model}`], null, 2)
        );
        schemas_config[model] = { dataSource: DATASOURCE_NAME, public: true };

    }

    // Expose models via REST API
    const configJson = await readFile('/home/matus/Documents/Projects/VSCode/cardamine-backend-app/server/model-config.json', 'utf-8');
    console.log('MODEL CONFIG', configJson);
    const config = JSON.parse(configJson);
    const mergedConfig = {...config, ...schemas_config};

    await writeFile(
      '/home/matus/Documents/Projects/VSCode/cardamine-backend-app/server/model-config.json',
      JSON.stringify(mergedConfig, null, 2)
    );
}