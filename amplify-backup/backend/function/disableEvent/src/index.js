/* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_HANDLER_NAME
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_HANDLER_NAME
    REGION
    STORAGE_CASE_ARN
    STORAGE_CASE_NAME
    STORAGE_CASE_STREAMARN
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_HANDLER_NAME
    REGION
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
    ENV
    FUNCTION_HANDLERWRAPPER_NAME
    FUNCTION_HANDLER_NAME
    REGION
Amplify Params - DO NOT EDIT */
// import remove lambda target

// import disable rule
// import delete rule
// remove target

// import remove permissionCommand, not sure if we need it
const { CloudWatchEventsClient, DisableRuleCommand, DeleteRuleCommand, RemoveTargetsCommand } = require('@aws-sdk/client-cloudwatch-events')
const { LambdaClient, RemovePermissionCommand } = require('@aws-sdk/client-lambda')

const cloudwatchClient = new CloudWatchEventsClient({ region: process.env.AWS_REGION })
const lambda = new LambdaClient({ region: process.env.AWS_REGION })
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const dBClient = new DynamoDBClient({
    region: process.env.AWS_REGION
})
const documentClient = DynamoDBDocument.from(dBClient)

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    try {

        const invokeHandlerRuleName = event.invokeHandlerRuleName
        const deleteHandlerRuleName = event.deleteHandlerRuleName
        const enableStatementId = event.enableStatementId
        const deleteStatementId = event.deleteStatementId
        const InvokeTargetId = event.invokeTargetId
        const DeleteTargetId = event.deleteTargetId
        const id = event.case_id


        // disable the rule
        const disableEmailParams = {
            Name: invokeHandlerRuleName
        }

        const disableInvokeCommand = new DisableRuleCommand(disableEmailParams)
        await cloudwatchClient.send(disableInvokeCommand)

        // remove the target
        const removeEmailTarget = {
            Rule: invokeHandlerRuleName,
            Ids: [InvokeTargetId],
        }

        const removeInvokeTargetCommand = new RemoveTargetsCommand(removeEmailTarget)
        await cloudwatchClient.send(removeInvokeTargetCommand)

        // remove permissions
        const removeEmailPermissionParams = {
            FunctionName: process.env.FUNCTION_HANDLER_NAME,
            StatementId: enableStatementId
        }

        const removeInvokePermissionCommand = new RemovePermissionCommand(removeEmailPermissionParams)
        await lambda.send(removeInvokePermissionCommand)

        // delete the rule
        const deleteEmailParams = {
            Name: invokeHandlerRuleName,
            Force: true
        }

        const deleteInvokeCommand = new DeleteRuleCommand(deleteEmailParams)
        await cloudwatchClient.send(deleteInvokeCommand)




        // disable delete command
        const disableDeleteParams = {
            Name: deleteHandlerRuleName
        }

        const disableDeleteCommand = new DisableRuleCommand(disableDeleteParams)
        await cloudwatchClient.send(disableDeleteCommand)

        // remove the target
        const removeDeleteTarget = {
            Rule: deleteHandlerRuleName,
            Ids: [DeleteTargetId],
        }

        const removeDeleteTargetCommand = new RemoveTargetsCommand(removeDeleteTarget)
        await cloudwatchClient.send(removeDeleteTargetCommand)


        // remove permissions
        const removeDeletePermissionParams = {
            FunctionName: 'disableEvent-prod', //'disableEvent-will',
            StatementId: deleteStatementId
        }

        const removeDeletePermissionCommand = new RemovePermissionCommand(removeDeletePermissionParams)
        await lambda.send(removeDeletePermissionCommand)

        // delete the rule
        const deleteDeleteParams = {
            Name: deleteHandlerRuleName,
            Force: true
        }

        const deleteDeleteCommand = new DeleteRuleCommand(deleteDeleteParams)
        await cloudwatchClient.send(deleteDeleteCommand)

        // set status of the the case to closed
        const updateParams = {
            TableName: process.env.STORAGE_CASE_NAME,
            Key: {
                id: id
            },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'Closed'
            }

        }



        await documentClient.update(updateParams)

        console.log('SUCCESS')
        return 'SUCCESS'


    } catch (error) {
        console.log(error)
        throw error
    }


}