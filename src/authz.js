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

    if (typeof roles !== 'object') {
        throw new Error('Expected parameter to be type of object : roles');
    }

    $roles.clear();

    Object.keys(roles).forEach(role =>  {
        const can = {}, inherits = [];
        
        const $role = roles[role];
        if (!$role) {
            throw new Error(`Expected definition for role to be defined : ${role}`);
        }
    
        if (!($role.can instanceof Array)) {
            throw new Error('Expected parameter to be type of array : can');
        }

        $role.inherits.forEach(inherit => {
            if (typeof inherit !== 'string') {
                throw new Error('Expected parameter to be type of string : inherit');
            }

            if (!roles[inherit]) {
                throw new Error(`Expected inherited role to be defined in roles : ${inherit}`)
            }

            inherits.push(inherit);
        });

        $role.can.forEach(permission => {
            if (typeof permission === 'string') {
                roleItem.can[permission] = true;
            }
            
            if (permission.name && permission.when) {
                roleItem.can[permission] = permission.when;
            }

            throw new Error(`Can not parse permission definition : ${JSON.stringify(permission)}`);
        });

        $roles.set(role, { can, inherits });
    });
}

function parse(role) {

}