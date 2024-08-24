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
    // const case_id = event.id // without lambda proxy
    const case_id = event.queryStringParameters.id // lambda proxy

    try {

        const params = {
            TableName: process.env.STORAGE_CASE_NAME,
            Key: {
                id: case_id,
            }
        }

        await documentClient.delete(params)

        return apiResponse(200, { body: JSON.stringify('Case ' + case_id + ' deleted successfully!') })

    } catch (err) {
        console.error('Error deleting Case:', err)
        return apiResponse(500, { body: JSON.stringify('Error deleting case') })

    }
}

function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }


}