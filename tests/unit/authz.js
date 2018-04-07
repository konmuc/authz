/* global intern */
import authz, { can } from '../../src/authz';
import { errors } from '../../src/errors';

const { assert } = intern.getPlugin('chai');
const { registerSuite } = intern.getInterface('object');

registerSuite('authoritzation tests', () => {

    return {
        'tests for authz default export': {
            'no roles argument': () => {
                const roles = {};
                
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.typeOf.object('roles'));
            },
            'role is not defined': () => {
                const roles = { user: null };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.defined('user'));
            },
            'role.can is not an array': () => {
                const roles = { user: { can: null } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.instanceOf.array('can'));
            },
            'role.inherits is not an array': () => {
                const roles = { user: { can: [], inherits: null } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.instanceOf.array('inherits'));
            },
            'inherit is not a string': () => {
                const roles = { user: { can: [], inherits: [ null ] } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.typeOf.string('inherit'));
            },
            'inherited role is not defined': () => {
                const roles = { user: { can: [], inherits: [ 'guest' ] } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.inherited.role.to.be.defined('guest'));
            },
            'unkown permission definition': () => {
                const roles = { user: { can: [ null ], inherits: [] } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.can.not.parse.permission(null));
            },
            'invalid functional permission : name': () => {
                const roles = { user: { can: [ { name: {}, when: () => {} } ], inherits: [] } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.typeOf.string('name'));
            },
            'invalid functional permission : when': () => {
                const roles = { user: { can: [ { name: 'post:edit', when: {} } ], inherits: [] } };
    
                assert.throws(authz.bind(null, { roles }),
                    errors.expected.parameter.to.be.typeOf.function('when'));
            }
        },
        'tests for authz can export': {
            before() {
                const roles = {
                    user: { can: [ { name: 'post:edit', when: (params) => params.user.username === params.post.owner } ], inherits: [ 'guest' ] },
                    guest: { can: [ 'post:view' ], inherits: [] }
                }
    
                authz({ roles });
            },
            'role is not defined': () => {
                assert.throws(can.bind(null, null),
                    errors.expected.parameter.to.be.typeOf.string('role'))
            },
            'permission is not defined': () => {
                assert.throws(can.bind(null, 'user', null),
                    errors.expected.parameter.to.be.typeOf.string('permission'))
            },
            'user inherits from guest': () => {
                const permitted = can('user', 'post:view');

                assert.isTrue(permitted);
            },
            'user can edit': () => {
                const permitted = can('user', 'post:edit', { user: { username: 'perry' }, post: { owner: 'perry' }});

                assert.isTrue(permitted);
            },
            'user can not edit post foreign post': () => {
                const permitted = can('user', 'post:edit', { user: { username: 'perry' }, post: { owner: 'jack' }});

                assert.isFalse(permitted);
            },
            'guest can not edit': () => {
                const permitted = can('guest', 'post:edit');
                
                assert.isFalse(permitted);
            }
        }
    };
});