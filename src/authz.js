var $roles = new Map();

export function can(role, permission, params = {}) {

    // First some validations.
    if (role instanceof Array) {
        // If role is an array, check all roles.
        return role.some(role => can(role, permission, params));
    }

    // Validate, that role is a string.
    if (typeof role !== 'string') {
        throw new Error('Expected parameter to be type of string : role');
    }

    // Validate that permission is a string.
    if (typeof permission !== 'string') {
        throw new Error('Expected parameter to be type of string : permission');
    }
    
    // Fetch the role.
    let $role = $roles.get(role);

    // If no role is found, return false.
    if (!$role) {
        console.info(`Role not found : ${role}`);
        return false;
    }

    // Check if the permission is deposited
    let $permission = $role.can[permission];

    // If a permission matches, return true.
    if ($permission === true) {
        return true;
    }

    // Check if permission is a function.
    if (typeof $permission === 'function') {
        try {
            return $permission(params);
        } catch (err) {
            console.warn(`Failed to evaluate permission : ${permission}`, e);
            return false;
        }
    }

    // Check inherited roles
    return $role.inherits.some(inherit => can(inherit, permision, params));
}

export default function configure({ roles }) {
    
    // Check if role is an object.
    if (typeof roles !== 'object') {
        throw new Error('Expected parameter to be type of object : roles');
    }

    // clear role defintions.
    $roles.clear();

    // Iterate all keys of roles
    Object.keys(roles).forEach(role =>  {        
        // If no definition for role found, throw an error.
        const $role = roles[role];
        if (!$role) {
            throw new Error(`Expected definition for role to be defined : ${role}`);
        }
        
        // If role.can is not an array, throw an error.
        if (!($role.can instanceof Array)) {
            throw new Error('Expected parameter to be type of array : can');
        }

        // If role.inherits is not an array, throw an error.
        if (!($role.inherits instanceof Array)) {
            throw new Error('Expected parameter to be type of array : inherits');
        }

        // Iterate inherited roles
        const inherits = $role.inherits.map(inherit => {
            
            // If inherit is not a string, throw an error.
            if (typeof inherit !== 'string') {
                throw new Error('Expected parameter to be type of string : inherit');
            }

            // If inherit is not defined in roles, throw an error.
            if (!roles[inherit]) {
                throw new Error(`Expected inherited role to be defined in roles : ${inherit}`)
            }

            // Inherited role seems to be valid, return it.
            return inherit;
        });

        // Iterate permissions of role and check known permission configuration.
        const can = $role.can.map(permission => {
            
            if (typeof permission === 'string') {
                // Permission is a string.
                return { [permission] : true };
            }

            if (permission.name && permission.when) {
                // Validate permission.
                if (typeof permission.name !== 'string') {
                    throw new Error('Expected parameter to be type of string : name');
                }

                if (typeof permission.when !== 'function') {
                    throw new Error('Expected parameter to be type of function : when');
                }

                // Permission is a function.
                return { [permission] : permission.when };
            }

            // Permission configuration is unknown.
            throw new Error(`Can not parse permission definition : ${JSON.stringify(permission)}`);
        })
        .reduce((can, permission) =>  ({ ...can, ...permission }), {});

        // add role to role definitions.
        $roles.set(role, { can, inherits });
    });
}