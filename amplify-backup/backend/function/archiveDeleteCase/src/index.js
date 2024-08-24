/* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_ARCHIVECASE_NAME
    FUNCTION_DELETECASE_NAME
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT */
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda')

const lambda = new LambdaClient({ region: process.env.AWS_REGION })

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    const case_id = event.case_id
    const archive = event.archive
    const Payload = {
        id: case_id
    }
    const archiveCase = {
        FunctionName: process.env.FUNCTION_DELETECASE_NAME,
        Payload: JSON.stringify(Payload),
        InvocationType: 'Event'

    }
    const deleteCase = {
        FunctionName: process.env.FUNCTION_ARCHIVECASE_NAME,
        Payload: JSON.stringify(Payload),
        InvocationType: 'Event'
    }
    const archiveCommand = new InvokeCommand(archiveCase)
    const deleteCommand = new InvokeCommand(deleteCase)

    try {
        if (archive == 'true') {
            await lambda.send(archiveCommand)
            await lambda.send(deleteCommand)
            return apiResponse(200, { message: 'Case archived and deleted' })


        }
        else {
            await lambda.send(deleteCommand)
            return apiResponse(200, { message: 'Case deleted' })
        }
    } catch (error) {
        return apiResponse(400, { message: error.message })

    }
}
function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}
