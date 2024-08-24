/* Amplify Params - DO NOT EDIT
    API_LSAPI_APIID
    API_LSAPI_APINAME
    AUTH_LSAUTH_USERPOOLID
    ENV
    FUNCTION_DISABLEEVENT_NAME
    FUNCTION_HANDLER_NAME
    REGION
Amplify Params - DO NOT EDIT *//* eslint-disable indent */
/* Amplify Params - DO NOT EDIT
    API_LSAPI_APIID
    API_LSAPI_APINAME
    AUTH_LSAUTH_USERPOOLID
    ENV
    FUNCTION_HANDLER_NAME
    REGION
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_HANDLER_NAME
    REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// Imports
const {
    CloudWatchEventsClient,
    PutRuleCommand,
    EnableRuleCommand,
    PutTargetsCommand,
    PutEventsCommand
} = require('@aws-sdk/client-cloudwatch-events')

const {
    LambdaClient,
    AddPermissionCommand
} = require('@aws-sdk/client-lambda')

const {
    STSClient,
    GetCallerIdentityCommand
} = require('@aws-sdk/client-sts')

// Clients
const cloudwatchClient = new CloudWatchEventsClient({ region: process.env.AWS_REGION })
const lambda = new LambdaClient({ region: process.env.AWS_REGION })
const stsClient = new STSClient({ region: process.env.AWS_REGION })

// HEADERS
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': '*'
}

// Helper functions
const getCallerIdentity = async () => {
    try {
        const data = await stsClient.send(new GetCallerIdentityCommand({}))
        return data.Account
    } catch (error) {
        console.error('Error retrieving AWS account ID:', error)
    }
}

// Main handler
exports.handler = async (event) => {

    // essential fields from events
    const case_id = event.case_id
    const phone_number = event.phone_number
    const interval = event.interval
    const duration = event.duration

    let name
    if (!event.name) {
        name = 'DEFAULT'
    } else {
        name = event.name
    }


    const createBaseName = 'InvokeHandler'
    const deleteBaseName = 'DeleteHandler'
    const createRuleName = `${createBaseName}-${case_id}`
    const deleteRuleName = `${deleteBaseName}-${case_id}`

    const functionNameInvoke = process.env.FUNCTION_HANDLER_NAME
    const functionNameDelete = process.env.FUNCTION_DISABLEEVENT_NAME
    const accountId = await getCallerIdentity()
    const region = process.env.AWS_REGION
    const configuredFunctionInvoke = `arn:aws:lambda:${region}:${accountId}:function:${functionNameInvoke}`
    const configuredFunctionDelete = `arn:aws:lambda:${region}:${accountId}:function:${functionNameDelete}`





    if (interval == 'true') {

        try {


            // Payloads
            const handlerPayload = {
                case_id: case_id,
                phone_number: phone_number,
                name: name
            }


            // Duration logic for CRON expressions

            const dateObject = new Date()
            let day = dateObject.getDate()
            let month = dateObject.getMonth() + 1  //month is zero indexed
            let year = dateObject.getFullYear()
            let minutes, allotedHour, deleteCron, mod

            let newMonth = month, newDay, descriptionString
            switch (duration) {
                case '1':
                case '3':
                case '6':
                case '12':

                    allotedHour = (dateObject.getHours() + parseInt(duration)) % 24
                    minutes = dateObject.getMinutes() % 60
                    deleteCron = `cron(${minutes} ${allotedHour} ? * * *)`
                    descriptionString = `Deletes at ${allotedHour}:${minutes} on ${day}/${month} `
                    break

                case '24':
                case '48':
                    // checks # of days in month, accounts for leap years too!
                    mod = daysInMonth(month, year)

                    allotedHour = (dateObject.getHours()) % 24
                    minutes = dateObject.getMinutes() % 60
                    if (duration == '24') {
                        if (dateObject.getDate() == mod) {
                            newDay = (dateObject.getDate() + 1) % mod
                            newMonth += 1
                        }
                        else newDay = (dateObject.getDate() + 1)

                    } else if (duration == '48') {
                        if (dateObject.getDate() == mod) {
                            newDay = (dateObject.getDate() + 2) % mod
                            newMonth += 1
                        }
                        else if (dateObject.getDate() == mod - 1) {
                            newDay = (dateObject.getDate() + 2) % mod
                            newMonth += 1
                        }
                        else newDay = (dateObject.getDate() + 2)
                    }
                    // if new year
                    if (newMonth == 13) newMonth = 1
                    deleteCron = `cron(${minutes} ${allotedHour} ${newDay} ${newMonth} ? *)`
                    descriptionString = `Deletes at ${allotedHour}:${minutes} on ${newDay}/${newMonth} `
                    break


                default:

                    return apiResponse(400, 'Invalid duration')
            }




            // Invoke Email Events Params
            // Put Rule
            const createPutRuleParams = {
                Name: createRuleName,
                ScheduleExpression: 'rate(15 minutes)',
                State: 'DISABLED',
                Description: descriptionString,
                EventBusName: 'default'
            }
            const ruleCommand = new PutRuleCommand(createPutRuleParams)
            const rule = await cloudwatchClient.send(ruleCommand)
            const eventARN = rule.RuleArn


            // Create Target
            const targetParams = {
                Rule: createRuleName,
                Targets: [{
                    Id: createRuleName,
                    Arn: configuredFunctionInvoke,
                    Input: JSON.stringify(handlerPayload),
                }]
            }
            const targetCommand = new PutTargetsCommand(targetParams)
            await cloudwatchClient.send(targetCommand)


            // add permissions
            const statementId = 'EventBridgeInvokeTrigger' + case_id
            const triggerParams = {
                FunctionName: process.env.FUNCTION_HANDLER_NAME,
                StatementId: statementId,
                Action: 'lambda:InvokeFunction',
                Principal: 'events.amazonaws.com',
                SourceArn: eventARN,
            }
            const permissionCommand = new AddPermissionCommand(triggerParams)
            await lambda.send(permissionCommand)



            // Create the event bus
            const putEventsParams = {
                Entries: [
                    {
                        Resources: [configuredFunctionInvoke],
                        DetailType: 'AppEvent',
                        Detail: JSON.stringify(handlerPayload),
                        EventBusName: 'default',
                    }
                ]
            }
            const putEventsCommand = new PutEventsCommand(putEventsParams)
            await cloudwatchClient.send(putEventsCommand)


            // Enable Rule
            const enableParams = {
                Name: createRuleName
            }

            const enableCommand = new EnableRuleCommand(enableParams)
            await cloudwatchClient.send(enableCommand)



            // Delete Events Params
            const deleteStatementId = 'EventBridgeDeleteTrigger' + case_id
            const disableEventPayload = {
                invokeHandlerRuleName: createRuleName,
                deleteHandlerRuleName: deleteRuleName,
                enableStatementId: statementId,
                deleteStatementId: deleteStatementId,
                invokeTargetId: createRuleName,
                deleteTargetId: deleteRuleName,
                case_id: case_id

            }
            // Create Rule
            const deletePutRuleParams = {
                Name: deleteRuleName,
                ScheduleExpression: deleteCron,
                State: 'DISABLED',
                Description: descriptionString,
                EventBusName: 'default'
            }
            const deleteRuleCommand = new PutRuleCommand(deletePutRuleParams)
            const deleteRule = await cloudwatchClient.send(deleteRuleCommand)
            const deleteEventARN = deleteRule.RuleArn


            // Create Target
            const deleteTargetParams = {
                Rule: deleteRuleName,
                Targets: [{
                    Id: deleteRuleName,
                    Arn: configuredFunctionDelete,
                    Input: JSON.stringify(disableEventPayload),
                }]
            }

            const deleteTargetCommand = new PutTargetsCommand(deleteTargetParams)
            await cloudwatchClient.send(deleteTargetCommand)


            // add permissions

            const triggerDeleteParams = {
                FunctionName: process.env.FUNCTION_DISABLEEVENT_NAME,
                StatementId: deleteStatementId,
                Action: 'lambda:InvokeFunction',
                Principal: 'events.amazonaws.com',
                SourceArn: deleteEventARN,
            }

            const permissionDeleteCommand = new AddPermissionCommand(triggerDeleteParams)
            await lambda.send(permissionDeleteCommand)

            // create Event Params
            const DeleteEventsParams = {
                Entries: [
                    {
                        Resources: [configuredFunctionDelete],
                        DetailType: 'AppEvent',
                        Detail: JSON.stringify(disableEventPayload),
                        EventBusName: 'default',
                    }
                ]
            }
            const DeleteEventsCommand = new PutEventsCommand(DeleteEventsParams)
            await cloudwatchClient.send(DeleteEventsCommand)

            // Enable Rule
            const enableDeleteParms = {
                Name: deleteRuleName
            }

            const enableDeleteCommand = new EnableRuleCommand(enableDeleteParms)
            await cloudwatchClient.send(enableDeleteCommand)



            return apiResponse(200, { message: 'SUCCESS' })

        } catch (error) {
            console.error(error)
            return apiResponse(400, { message: error.message })
        }

    }
}
function apiResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
}
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
}