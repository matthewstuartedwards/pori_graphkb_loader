const ExtendableError = require('extendable-error-class');

const errorJSON = function(error) {
    return {type: error.type, message: error.message};
}

class AttributeError extends ExtendableError {
    constructor(message) {
        super(message);
    }
};

module.exports = {AttributeError, errorJSON};
