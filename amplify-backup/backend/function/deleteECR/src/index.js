/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_ECR_ARN
    STORAGE_ECR_NAME
    STORAGE_ECR_STREAMARN
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
    // const ecr_id = event.id // non lambda proxy
    const ecr_id = event.queryStringParameters.id // lambda proxy

    try {

        const params = {
            TableName: process.env.STORAGE_ECR_NAME,
            Key: {
                id: ecr_id,
            }
        }

        const data = await documentClient.delete(params)
        return apiResponse(200, data)

    } catch (err) {
        console.error('Error deleting item:', err)
        return apiResponse(500, { body: 'Error deleting item', err })

    }
}
function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }


}
