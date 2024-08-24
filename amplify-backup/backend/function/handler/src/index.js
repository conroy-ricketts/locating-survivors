/* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_EMAILLISTENER_NAME
    FUNCTION_EMAILSCRAPER_NAME
    FUNCTION_EMAILSENDER_NAME
    REGION
Amplify Params - DO NOT EDIT */




/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// Load in Lambda Client

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda')

const lambda = new LambdaClient({ region: process.env.AWS_REGION })

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}


const timeout = (ms, promise) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout'))
        }, ms)
        promise.then(resolve, reject)
    })
}
exports.handler = async (event) => {

    const case_id = event.case_id
    const name = event.name
    const phone_number = event.phone_number
    let duration = event.duration
    if (duration == null || duration == undefined) {
        duration = 0
    }
    duration = parseInt(duration)

    // event that we will be passing into sender
    const senderPayload = {
        case_id: case_id,
        name: name,
        phone_number: phone_number,
        duration: duration
    }

    // event that we will be passing into listener
    const listenerPayload = {
        case_id: case_id

    }

    // paramaters for sender
    const sender = {
        FunctionName: process.env.FUNCTION_EMAILSENDER_NAME,
        Payload: JSON.stringify(senderPayload),
        InvocationType: 'Event'

    }

    // paramaters for listener
    const listener = {
        FunctionName: process.env.FUNCTION_EMAILLISTENER_NAME,
        Payload: JSON.stringify(listenerPayload),
        InvocationType: 'Event'

    }

    // invocation commands
    const send_command = new InvokeCommand(sender)
    const listen_command = new InvokeCommand(listener)


    try {


        const results = await timeout(9000,
            Promise.all([
                lambda.send(listen_command),
                lambda.send(send_command)
            ])
        )

        return apiResponse(200, results)


    } catch (err) {
        console.error(err)
        return apiResponse(400, { message: err.message })



    }
}




function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}
