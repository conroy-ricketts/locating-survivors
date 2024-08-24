/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
})
const documentClient = DynamoDBDocument.from(client)

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}


exports.handler = async (event) => {
    // non proxy events
    // const caseId = event.id
    // const userId = event.user_id
    let data
    // proxy events
    const caseId = event.queryStringParameters.id
    const userId = event.queryStringParameters.user_id
    // lets take the userID and check if it exists in the cognito table

    try {

        if (caseId) {
            data = await getCase(caseId)
        }
        else if (userId) {
            data = await getCases(userId)
        }
        else {
            throw new Error('Missing id or user_id')
        }

        return apiResponse(200, {
            message: 'Success',
            data
        })

    } catch (error) {
        return apiResponse(400, { message: error.message })
    }

}

// lets create a function that will get the case based on the id and return if su
async function getCase(id) {

    const params = {
        TableName: process.env.STORAGE_CASE_NAME,
        Key: { id }
    }

    return documentClient.get(params).then(res => res.Item)

}

async function getCases(userId) {

    const params = {
        TableName: process.env.STORAGE_CASE_NAME,
        FilterExpression: 'user_id = :userId',
        ExpressionAttributeValues: { ':userId': userId }
    }

    return documentClient.scan(params).then(res => res.Items)

}

function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}