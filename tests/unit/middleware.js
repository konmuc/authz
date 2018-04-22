/* global intern Promise */
import configureAuthz from '../../src/index';
import { errors } from '../../src/errors';

const { assert } = intern.getPlugin('chai');
const { registerSuite } = intern.getInterface('object');

registerSuite('configure middleware tests', () => {

    return {

        'undefined roles argument': () => {
            const roles = null;

            assert.throws(configureAuthz.bind(null, { roles }),
                errors.expected.parameter.to.be.defined('roles'));
        },

        'non object roles argument': () => {
            const roles = 'string';
            
            assert.throws(configureAuthz.bind(null, { roles }),
                errors.expected.parameter.to.be.typeOf.object('roles'));
        },

        'extend config': () => {
            const roles = { guest: { can: ['post:view'], inherits: [] } };
            configureAuthz({ roles });
        }
    };
});

registerSuite('middelware tests', () => {
    
    const roles = {
        user: {
            can: [
                {
                    name: 'post:edit',
                    when: (params) => params.user.username === params.post.owner
                }
            ],
            inherits: ['guest'],
        },
        guest: { can: ['post:view'], inherits: [] }
    };

    var authz;

    return {

        before() {
            authz = configureAuthz({ roles });
        },


        'undefined permission': () => {
            assert.throws(authz.bind(null, null),
                errors.expected.parameter.to.be.defined('permission'));
        },

        'non string permission': () => {
            assert.throws(authz.bind(null, {}),
                errors.expected.parameter.to.be.typeOf.string('permission'));
        },


        'unsupported params type : string': () => {
            assert.throws(authz.bind(null, 'post:view', 'string'),
                errors.expected.parameter.to.be.defined('paramsFn'));
        },

        'no user on request object': async () => {
            const middleware = authz('post:view');

            await middleware({ user: null }, {}, ({ message }) => {
                assert.equal(message, errors.access.forbidden);
            });
        },

        'no role on request object': async () => {
            const middleware = authz('post:view');

            await middleware({ user: { role: null } }, {}, ({ message }) => {
                assert.equal(message, errors.access.forbidden);
            });
        },

        'no permission': async () => {
            const middleware = authz('post:delete');

            await middleware({ user: { role: 'user' } }, {}, ({ message }) => {
                assert.equal(message, errors.access.forbidden);
            });
        },


        'params as object': async () => {
            const middleware = authz('post:view', {});

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        },


        'params as function': async () => {
            const middleware = authz('post:view', (req) => {
                return { post: { owner: req.user.username } };
            });

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        },


        'params as function wich returns empty object': async () => {
            const middleware = authz('post:view', () => { return {}; });

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        },

        'params as async function wich returns empty object': async () => {
            const middleware = authz('post:view', async () => { return Promise.resolve({}); });

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        },


        'params as function without return value': async() => {
            const middleware = authz('post:view', () => {
                return null;
            });

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        },

        'successfull authorization': async() => {
            const middleware = authz('post:view', (req) => {
                return { post: { owner: req.user.username } };
            });

            await middleware({ user: { username: 'testuser', role: 'user' } }, {}, (...args) => {
                assert.isEmpty(args);
            });
        }
    };

});