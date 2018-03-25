import authz, { can } from './authz'

var config = {
    roles: null,
    user: async req => req.user,
    role: async req => req.user && req.user.role
};

export async function middleware(permission, params = {}) {
    if (!permission) {
        throw new Error('Expected parameter to be defined : permission');
    }

    let paramsPromise;

    if (typeof params !== 'function') {
        paramsPromise = async () => params;
    }

    if (params.then) {
        paramsPromise = params;
    }

    if (!paramsPromise) {
        throw new Error('Expected parameter $params to be defined.');
    }

    return (req, res, next) => {
        try {
            let user = await config.user(req);
            if (!user) {
                console.error('No user found!');
                let err = new Error('Access forbidden!');
                err.status = 403;
                throw err; 
            }
    
            let role = await config.role(req);
            if (!role) {
                console.error(`No role found for ${user}!`);
                let err = new Error('Access forbidden!');
                err.status = 403;
                throw err;
            }
    
            let forbidden = await can(role, permission, paramsPromise);
            if (!forbidden) {
                let err = new Error('Access forbidden!');
                err.status = 403;
                throw err;
            }
            
            next();
        } catch (err) {
            next(err);
        }
    };
}

export default function configure({...custom } = config) {
    config = { ...config, ...custom };

    if (!config.roles) {
        throw new Error('Expected parameter to be defined : roles');
    }
    if (typeof config.roles !== 'object') {
        throw new Error('Expected parameter roles to be type of object.');
    }

    authz(config);

    return middleware;
}