import authz, { can } from './authz'
import { errors } from './errors'

var config = {
    roles: null,
    user: async req => req.user,
    role: async req => req.user && req.user.role
};

export function middleware(permission, params = {}) {
    if (!permission) {
        throw new Error(errors.expected.parameter.to.be.defined('permission'));
    }

    if (typeof permission !== 'string') {
        throw new Error(errors.expected.parameter.to.be.typeOf.string('permission'));
    }

    let paramsFn;

    if (typeof params === 'object') {
        paramsFn = async () => params;
    } else if (typeof params === 'function') {
        paramsFn = async(req) => await params(req);
    }

    if (!paramsFn) {
        throw new Error(errors.expected.parameter.to.be.defined('paramsFn'));
    }

    return async (req, res, next) => {
        try {
            let user = await config.user(req);
            if (!user) {
                console.error('No user found!');
                let err = new Error(errors.access.forbidden);
                err.status = 403;
                throw err; 
            }
    
            let role = await config.role(req);
            if (!role) {
                console.error(`No role found for ${JSON.stringify(user)}!`);
                let err = new Error(errors.access.forbidden);
                err.status = 403;
                throw err;
            }

            let $params = await paramsFn(req);

            $params = Object.assign({
                user: user,
                role: role
            }, $params);

            let forbidden = await can(role, permission, $params);
            if (!forbidden) {
                let err = new Error(errors.access.forbidden);
                err.status = 403;
                throw err;
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}

export default function configure(custom) {

    config = { ...config, ...custom };

    if (!config.roles) {
        throw new Error(errors.expected.parameter.to.be.defined('roles'));
    }

    if (typeof config.roles !== 'object') {
        throw new Error(errors.expected.parameter.to.be.typeOf.object('roles'));
    }

    authz(config);

    return middleware;
}