const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const _ = require('underscore');
const op = require('object-path');
const Parse = require('parse/node');

module.exports = spinner => {
    const message = text => {
        if (spinner) {
            spinner.text = text;
        }
    };

    const fail = text => {
        if (spinner) {
            spinner.fail(text);
            console.log('');
            process.exit();
        }
    };

    return {
        init: ({ context, params }) => {
            message(`Initializing ${chalk.cyan('Parse')}...`);

            const { app, server, auth } = params;
            Parse.initialize(app);
            Parse.serverURL = server;

            context['options'] = { sessionToken: auth };
        },

        check: async ({ context, params, props }) => {
            let { name, overwrite } = params;

            const { prompt } = props;
            const { options = {} } = context;
            let { blueprints = [] } = await Parse.Cloud.run(
                'blueprint-retrieve',
                {
                    ID: name,
                },
                options,
            );

            if (blueprints.length > 0 && overwrite !== true) {
                fail(
                    `Blueprint ${name} already exists. Overwrite by setting the ${chalk.cyan(
                        '-o',
                    )} or ${chalk.cyan('--overwrite')} flag.`,
                );
            }

            if (blueprints.length > 0 && overwrite === true) {
                return Parse.Object.destroyAll(blueprints, options).catch(
                    err => {
                        fail(err.message);
                    },
                );
            }
        },

        template: async ({ context }) => {
            message(`Retrieving ${chalk.cyan('template')}...`);
            const { options = {} } = context;

            let blueprint = await Parse.Cloud.run(
                'blueprint-retrieve',
                {
                    ID: 'Admin',
                },
                options,
            );

            context['template'] = op.get(blueprint, 'blueprints.0');

            if (!op.get(context, 'template')) {
                fail('Unable to copy default admin blueprint');
            }

            context['template'] = op.get(context, 'template')
                ? context.template.toJSON()
                : {};
        },

        create: async ({ context, params, props }) => {
            message(`Creating ${chalk.cyan('blueprint')}...`);

            const { options = {} } = context;
            const { name, description, header, sidebar, zones } = params;

            const blueprint = {
                ...context.tempate,
                ID: name,
                description: description,
            };

            op.set(blueprint, 'sections.main.zones', zones);

            if (header !== true) {
                op.del(blueprint, 'sections.header');
            }

            if (sidebar !== true) {
                op.del(blueprint, 'sections.sidebar');
            }

            context['blueprint'] = await Parse.Cloud.run(
                'blueprint-create',
                blueprint,
                options,
            );
        },

        route: async ({ context, params }) => {
            const { route } = params;
            if (!route) {
                return;
            }

            const { blueprint, options } = context;

            if (!blueprint) {
                fail('Unable to create route');
            }

            let routeObj = await new Parse.Query('Route')
                .equalTo('route', route)
                .descending('updatedAt')
                .first(options);

            routeObj = routeObj || new Parse.Object('Route');
            routeObj.set('route', route).set('blueprint', blueprint);

            return routeObj.save(null, options);
        },
    };
};
