/* Amplify Params - DO NOT EDIT
    API_LSAPI_APIID
    API_LSAPI_APINAME
    AUTH_LSAUTH_USERPOOLID
    ENV
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
    STORAGE_ECR_ARN
    STORAGE_ECR_NAME
    STORAGE_ECR_STREAMARN
    STORAGE_USER_ARN
    STORAGE_USER_NAME
    STORAGE_USER_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// database imports and clients
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
})
const documentClient = DynamoDBDocument.from(client)
// import uuid to get random id
const { v4: uuidv4 } = require('uuid')
// Constants
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}
const TABLE_NAME = process.env.STORAGE_ECR_NAME


// Required fields for Posting ECR
const requiredFields = [
    'name',
    'phone_number',
    'phone_provider',
    'case_id',
    'email',
    'subscriber_information',
    'periodic_location_updates',
    'last_known_information',
    'duration',
    'call_detail_with_sites',
]



exports.handler = async (event) => {



    try {

        let item = getItemFromBody(event)
        // validate required fields
        validateFields(item, requiredFields)
        // initialize some fields that need to be included in post

        // add the fields to the item, may optimize this later
        const ecr_id = uuidv4()
        const date = new Date().toISOString()
        item.date = date
        item.id = ecr_id
        item._lastChangedAt = date
        item._createdAt = date
        item._version = 1
        item._typename = 'ECR'


        await postItemToDatabase(item)


        return apiResponse(200, { message: 'success' })



    } catch (error) {

        return apiResponse(400, { message: error.message })
    }
}



// Lets make some helper functions
function getItemFromBody(body) {
    let item = {}
    Object.keys(body).forEach(key => {
        item[key] = body[key]
    })
    return item

}
function validateFields(item, fields) {
    for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(item, field)) {
            throw new Error(`Missing field: ${field}`)
        }
    }
}
async function postItemToDatabase(item) {
    const params = {
        TableName: TABLE_NAME,
        Item: item
    }
    await documentClient.put(params)
}


function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }


}