

// required packages

const fs = require('fs');
const OrientDB = require('orientjs');

const {createSchema, loadSchema} = require('./app/repo/schema');
const {createUser} = require('./app/repo/base');
const conf = require('./config/config'); // get the database connection configuration
const {AppServer} = require('./app');
const auth = require('./app/middleware/auth');
const {logger} = require('./app/repo/logging');

// process.on('uncaughtException', app.close);
let app;
conf.db.name = `kbapi_${process.env.DATABASE_NAME
    ? process.env.DATABASE_NAME
    : `v${process.env.npm_package_version}`}`;
delete conf.port;

(async () => {
    try {
        const verbose = conf.verbose || process.env.VERBOSE !== '';
        // set up the database server
        const server = OrientDB({
            host: conf.server.host,
            HTTPport: conf.server.port,
            port: conf.server.port,
            username: conf.server.user,
            password: conf.server.pass
        });
        const exists = await server.exists({name: conf.db.name});
        logger.log('info', `The database ${conf.db.name} ${exists
            ? 'exists'
            : 'does not exist'}`);
        let db,
            schema;
        if (!exists) {
            logger.log('info', `creating the database: ${conf.db.name}`);
            db = await server.create({name: conf.db.name, username: conf.db.user, password: conf.db.pass});
            await db.query('alter database custom standardElementConstraints=false');
            logger.log('verbose', 'create the schema');
            await createSchema(db, verbose);
            schema = await loadSchema(db, verbose);
            // create the admin user
            const user = await createUser(db, {
                model: schema.User,
                userName: process.env.USER || 'admin',
                groupNames: ['admin'],
                schema
            });
            logger.log('verbose', `created the user: ${user.name}`);
            await db.close();
        }

        logger.log('verbose', 'creating certificate');
        auth.keys.private = fs.readFileSync(conf.private_key);
        // conf.disableCats = true;
        app = new AppServer(conf);
        await app.listen();

        // cleanup
        process.on('SIGINT', async () => {
            if (app) {
                await app.close();
            }
            process.exit(1);
        });
    } catch (err) {
        logger.log('error', `Failed to start server: ${err}`);
        app.close();
        throw err;
    }
})();
