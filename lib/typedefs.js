'use strict'

/**
 * @typedef Endpoint
 * @property {String} method The HTTP methods available for the path of this endpoint.
 * @property {String} path The path for this endpoint.
 * @property {String} swaggerPath The path to Swagger UI fragment of this path.
 * @property {Array<Function>} handles The middleware function associated to this route.
 * @property {Array<String>} routeParams An array with route parameters names.
 * @property {Array<String>} queryParams An array with query parameters names.
 * @property {Array<String>} bodyParams An array with body parameters names.
 */
class Endpoint {
    /**
     * @param {String} method The HTTP methods available for the path of this endpoint.
     * @param {String} path The path for this endpoint.
     * @param {Function} handles The middleware function associated to this route.
     * @param {String} swaggerPath The path to Swagger UI fragment of this path.
     * @param {Array<String>} routeParams Array of route parameters names
     */
    constructor(method, path, handles, swaggerPath, routeParams) {
        this.method = method
        this.path = path
        this.handles = handles
        this.swaggerPath = swaggerPath
        this.routeParams = routeParams ? routeParams : []
        this.queryParams = []
        this.bodyParams = []
    }
    /**
     * @param {Array<String>} keys Array of strings with parameters names.
     */
    addRouteParams(keys) {
        this.routeParams.push.apply(this.routeParams, keys.map(arg => arg.name))
    }
    /**
     * @param {Array<String>} keys Array of strings with parameters names.
     */
    addQueryParams(keys) {
        this.queryParams.push.apply(this.queryParams, keys)
    }
    /**
     * @param {Array<String>} keys Array of strings with parameters names.
     */
    addBodyParams(keys) {
        this.bodyParams.push.apply(this.bodyParams, keys)
    }
}


/**
 * @typedef SwaggerPathMethod
 * @property {Array<String>} tags
 * @property {Array} parameters
 * @property {ReqBody} requestBody
 * @property {Array} responses
 */
/**
 * @typedef ReqBody
 * @property {Content} content
 */
/**
 * @typedef Content
 * @property {Enctype} [application/x-www-form-urlencoded]
 * @property {Enctype} application/json
 */
/**
 * @typedef Enctype
 * @property {Schema} schema
 */
/**
 * @typedef Schema
 * @property {Object} properties
 */
/**
 * @param {String} tag 
 * @returns {SwaggerPathMethod}
 */
function swaggerPathMethod(tag, hasBodyContent) {
    const api = {
        'tags': [tag],
        'parameters': [],
        'responses': {}
    }
    if(hasBodyContent) api.requestBody = {
        'content': {
            'application/x-www-form-urlencoded': {
                'schema': {
                    'type': 'object',
                    'properties': {}
                }
            },
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {}
                }
            }
        }
    }
    return api
}

/**
 * @typedef SwaggerPathParam
 * @property {String} in
 * @property {String} name
 * @property {Boolean} required
 */
function swaggerPathParam(name) {
    return {
        'in': 'path',
        'name': name,
        'required': 'true'
    }
}
/**
 * @typedef SwaggerQueryParam
 * @property {String} in
 * @property {String} name
 */
function swaggerQueryParam(name) {
    return {
        'in': 'query',
        'name': name
    }
}
module.exports = {
    Endpoint,
    swaggerPathMethod, 
    swaggerQueryParam, 
    swaggerPathParam
}