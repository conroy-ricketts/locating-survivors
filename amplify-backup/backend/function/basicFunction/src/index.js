/* Amplify Params - DO NOT EDIT
    ENV
    REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    if (event.requestContext.authorizer) {
        console.log('claims: ', event.requestContext.authorizer.claims)
    }
    console.log(`EVENT: ${JSON.stringify(event)}`)
    return {
        statusCode: 200,
        //  Uncomment below to enable CORS requests
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify('Hello from Lambda!'),
    }

}
