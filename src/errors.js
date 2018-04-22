export const errors = {
    expected: {
        parameter: {
            to: {
                be: {
                    typeOf: {
                        string: (param) => `Expected parameter to be type of string : ${param}`,
                        object: (param) => `Expected parameter to be type of object : ${param}`,
                        function: (param) => `Expected parameter to be type of function : ${param}`
                    },
                    instanceOf: {
                        array: (param) => `Expected parameter to be instance of array : ${param}`
                    },
                    defined: (param) => `Expected parameter to be defined : ${param}`
                }
            }
        },
        inherited: {
            role: {
                to: {
                    be: {
                        defined: (role) => `Expected inherited role to be defined in roles : ${role}`
                    }
                }
            }
        }
    },
    can: {
        not: {
            parse: {
                permission: (permission) => `Can not parse permission definition : ${JSON.stringify(permission)}`
            }
        }
    },
    access: {
        forbidden: 'Access forbidden!'
    }
};