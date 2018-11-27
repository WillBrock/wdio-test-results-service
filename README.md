# WebdriverIO Test Results Service

WebdriverIO service that allows you to store test results to an external GraphQL server. Supports Mocha and Jasmine.

This will store results based on an entire spec file run.

This service is still a work in progress.

## Install

```
npm install --save-dev wdio-test-results-service
```

## Todo
- Add authentication
- Add support for each `it`

## Stored data

Test Run

- title
	Title of the overall test run
- version
	Version of code the tests ran against
- passed
	Overall test run passed
- failed
	Overall test run failed

Note: start and end times should be done in your resolvers if you want that tracked

Test Run Result

- test_run_id
	Id of the current test run
- spec_id
	File name of the test
- suite_title
	Name of the first `describe` block in the test file
- duration
	How long it took the test to complete in seconds
- passed
	Test passed or not
- failed
	Test failed or not
- skipped
	Test skipped or not

## Enviroment variables
- GRAPHQL_ENDPOINT
	The endpoint to your GraphQL server
- TEST_RUN_TITLE (optional)
	The title of the overall test run. If not specified it will default to the current timestamp
- CODE_VERSION (optional)
	The version of the code that your tests are running against

## Mutations

### createTestRun

This will create the test run

Schema

```

```

Example

```

```

### completeTestRun

This will complete the test run

Schema

```

```

Example

```

```

### addTestResult

This will add a test result record

Schema

```

```

Example

```

```
