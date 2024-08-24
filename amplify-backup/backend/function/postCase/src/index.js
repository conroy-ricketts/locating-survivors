
/* Amplify Params - DO NOT EDIT
    API_LSAPI_APIID
    API_LSAPI_APINAME
    AUTH_LSAUTH_USERPOOLID
    ENV
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
    STORAGE_USER_ARN
    STORAGE_USER_NAME
    STORAGE_USER_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// DynamoDB SDK
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const dBClient = new DynamoDBClient({
    region: process.env.AWS_REGION
})
const documentClient = DynamoDBDocument.from(dBClient)
// Cognito SDK
const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider')
const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION
})
const UserPoolId = process.env.AUTH_LSAUTH_USERPOOLID

// Import UUID 
const { v4: uuidv4 } = require('uuid')

// Import CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}

const TABLE_NAME = process.env.STORAGE_CASE_NAME

exports.handler = async (event) => {

    try {

        // Turn event into object 
        let item = getItemFromBody(event)

        // Validate required params
        requiredParam(item)

        // Extract fields 
        const userId = item.user_id
        const phoneNumber = item.phone_number
        const caseId = uuidv4()

        const phoneNumberExists = await checkPhoneNumberExists(phoneNumber)

        if (phoneNumberExists) {
            return apiResponse(400, { message: 'Phone number already exists in a case.' })
        }

        // Get user from Cognito
        const user = await getUser(userId)

        if (!user) {
            return apiResponse(400, { message: 'User does not exist in cognito pool' })
        }

        // Extract user attributes
        const email = user.Attributes.find(attr => attr.Name === 'email').Value
        const name = user.Attributes.find(attr => attr.Name === 'name').Value

        // Mold item
        item = moldItem(item, caseId, userId, phoneNumber, email, name)

        // Insert item in DynamoDB
        const data = await insertItem(item)
        return apiResponse(200, { message: 'success', item: item, data: data })



    } catch (error) {
        return apiResponse(400, { message: error.message })
    }

}

async function checkPhoneNumberExists(phoneNumber) {
    const params = {
        TableName: process.env.STORAGE_CASE_NAME,
        FilterExpression: 'phone_number = :phone',
        ExpressionAttributeValues: {
            ':phone': phoneNumber,
        },
    }

    const data = await documentClient.scan(params)

    return data.Count > 0
}


// Get user function
async function getUser(userId) {

    const params = {
        UserPoolId,
        Filter: `sub = '${userId}'`
    }

    const command = new ListUsersCommand(params)

    const response = await client.send(command)

    return response.Users[0]

}

// Parse event body 
function getItemFromBody(body) {

    let item = {}

    Object.keys(body).forEach(key => {
        item[key] = body[key]
    })

    return item

}

// Build item
function moldItem(item, caseId, userId, phoneNumber, email, name) {

    item = {
        id: caseId,
        user_id: userId,
        phone_number: phoneNumber,
        email: email,
        name: name,
        date: new Date().toISOString(),
        time_posted: new Date().toISOString(),
        duration: [],
        time_updated: new Date().toISOString(),
        next_update: addMinutes(new Date(), 15).toISOString(), // maybe in update we can get interval from ecr table
        longitude: [],
        latitude: [],
        uncertainty: [],
        status: 'Pending Initial Update',
        _version: 1,
        _typename: 'Case',
        _lastChangedAt: new Date().getTime,
        _createdAt: new Date().toISOString()
    }

    return item

}

// Insert item into DynamoDB
async function insertItem(item) {

    const params = {
        TableName: TABLE_NAME,
        Item: item
    }

    const data = await documentClient.put(params)
    return data


}

// API response helper 
function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}

// Validate parameters
function requiredParam(item) {

    if (!item.user_id) {
        return apiResponse(400, {
            message: 'Missing user_id'
        })
    }

    if (!item.phone_number) {
        return apiResponse(400, {
            message: 'Missing phone_number'
        })
    }

}
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000)
}