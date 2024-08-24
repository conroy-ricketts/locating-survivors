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

exports.handler = async (event) => {

    const userId = event.queryStringParameters.user_id
    console.log('ID is ' + userId)
    const params = {
        TableName: process.env.STORAGE_CASE_NAME,
        FilterExpression: 'user_id = :id',
        ExpressionAttributeValues: { ':id': userId }
    }
    try {
        const data = await documentClient.scan(params)
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        }
    } catch (error) {
        console.error('Error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred' }),
        }
    }


}
