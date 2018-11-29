# WebdriverIO Test Results Service

WebdriverIO service that allows you to store test results to an external GraphQL server. Supports Mocha and Jasmine.

This will store results based on an entire spec file run.

This service is still a work in progress.

Requires that there is a GraphQL back-end setup with the mutations below.

## Install

```
npm install --save-dev wdio-test-results-service
```

## Todo
- Add authentication

## Recomended fields for back-end

### Test Run

| Field       | Type        | Description                            |
| ------------|-------------|----------------------------------------|
| `run_key`   | `String`    | Identifier of the overall test run     |
| `issue_key` | `String`    | Jira issue, Jenkins job, etc.          |
| `suites`    | `String`    | WebdriverIO suites that were ran       |
| `version`   | `String`    | Version of code the tests ran against  |
| `passed`    | `Int`       | Overall test run passed                |
| `failed`    | `Int`       | Overall test run failed                |
| `start`     | `Timestamp` | Run start time                         |
| `end`       | `Timestamp` | Run end time                           |

### Test Run Result

| Field         | Type     | Description                                         |
| --------------|----------|-----------------------------------------------------|
| `test_run_id` | `Int`    | Id of the current test run                          |
| `spec_id`     | `String` | File name of the test                               |
| `suite_title` | `String` | Name of the first `describe` block in the test file |
| `duration`    | `Int`    | How long it took the test to complete in seconds    |
| `passed`      | `Int`    | Test passed or not                                  |
| `failed`      | `Int`    | Test failed or not                                  |
| `skipped`     | `Int`    | Test skipped or not                                 |
| `retries`     | `Int`    | Number of retries done                              |

## Enviroment variables

These can be set when running WebdriverIO and the data will be sent to the GraphQL endpoint

| Variable           |          | Description                                                                                  |
| -------------------|----------|----------------------------------------------------------------------------------------------|
| `GRAPHQL_ENDPOINT` | required | The endpoint to your GraphQL server                                                          |
| `TEST_RUN_TITLE`   | optional | The title of the overall test run. If not specified it will default to the current timestamp |
| `CODE_VERSION`     | optional | The version of the code that your tests are running against                                  |
| `ISSUE_KEY`        | optional | Jira issue, Jenkins job, etc.                                                                |

## Mutations

```graphql
type Mutation {
	testRunCreate(run_key: String, version: String, issue_key: String, suites: String) : TestRun,
	testRunComplete(id: Int) : TestRun,
	testResultAdd(test_run_id: Int, spec_id: String, suite_title: String, passed: Int, failed: Int, skipped: Int, duration: Int) : TestResult,
}
```

### testRunCreate

| Field       | Type        | Description                            |
| ------------|-------------|----------------------------------------|
| `run_key`   | `String`    | Identifier of the overall test run     |
| `version`   | `String`    | Version of code the tests ran against  |
| `issue_key` | `String`    | Jira issue, Jenkins job, etc.          |
| `suites`    | `String`    | WebdriverIO suites that were ran       |

### testRunComplete

| Field   | Type  | Description                    |
| --------|-------|--------------------------------|
| `id`    | `Int` | Id returned from testRunCreate |

### testResultAdd

| Field         | Type     | Description                                         |
| --------------|----------|-----------------------------------------------------|
| `test_run_id` | `Int`    | Id of the current test run                          |
| `spec_id`     | `String` | File name of the test                               |
| `suite_title` | `String` | Name of the first `describe` block in the test file |
| `passed`      | `Int`    | Test passed or not                                  |
| `failed`      | `Int`    | Test failed or not                                  |
| `skipped`     | `Int`    | Test skipped or not                                 |
| `duration`    | `Int`    | How long it took the test to complete in seconds    |

## Types

### TestRun

```graphql
type TestRun {
	id        : Int,
	run_key   : String,
	issue_key : String,
	suites    : String,
	passed    : Int,
	failed    : Int,
	duration  : Int,
	start     : String,
	end       : String,
	version   : String,
}
```

### TestResult

```graphql
type TestResult {
	id                 : Int,
	test_run_id        : Int,
	spec_id            : String,
	suite_title        : String,
	passed             : Int,
	failed             : Int,
	skipped            : Int,
	duration           : Int,
}
```
