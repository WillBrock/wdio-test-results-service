import { request } from 'graphql-request';

class TestResultsService {
	constructor() {
		this.endpoint = process.env.GRAPHQL_ENDPOINT;

		if(!this.endpoint) {
			throw new Error(`No graphql endpoint specified`);
		}
	}

	async onPrepare(config) {
		this.test_run_key = (process.env.TEST_RUN_KEY || Date.now()).toString();
		this.version      = process.env.CODE_VERSION || null;
		this.issue_key    = process.env.ISSUE_KEY || null;

		const query = `
			mutation CreateTestRun(
				$run_key: String!,
				$version: String,
				$issue_key: String,
				$suites: String
			) {
				testRunCreate(
					run_key: $run_key,
					version: $version,
					issue_key: $issue_key,
					suites: $suites
				) {
					id,
				}
			}
		`;

		const variables = {
			run_key   : this.test_run_key,
			version   : this.version,
			issue_key : this.issue_key,
			suites    : config.suite,
		};

		try {
			const result = await request(this.endpoint, query, variables);

			process.env.WDIO_TEST_RUN_ID = result.testRunCreate.id;
		}
		catch(e) {
			// Foo
		}
	}

	before() {
		// Each session id is a browser session. e.g. a spec file
		this.session_id  = global.browser.sessionId;
		this.failed      = false;
		this.skipped     = false;
		this.spec_id     = null;
		this.duration    = 0;
	}

	beforeSuite(suite) {
		this.suite_title = suite.title ? suite.title.trim() : null;
	}

	afterTest(test) {
		// Get the test file name
		if(!this.spec_id && test.file) {
			const match = test.file.match(/([^\/]+)\.(js|ts)/);

			if(match) {
				this.spec_id = match[1];
			}
		}

		if(!test.passed) {
			this.failed = true;
		}

		if(test.pending) {
			this.skipped = true;
		}

		this.duration += test.duration;
	}

	after() {
		const query = `
			mutation AddTestResult(
				$test_run_id: Int!,
				$spec_id: String!,
				$suite_title: String!,
				$duration: Int!,
				$passed: Int!,
				$failed: Int!,
				$skipped: Int!
			) {
				testResultAdd(
					test_run_id: $test_run_id,
					spec_id: $spec_id,
					suite_title: $suite_title,
					duration: $duration,
					passed: $passed,
					failed: $failed,
					skipped: $skipped
				) {
					id,
				}
			}
		`;

		const variables = {
			test_run_id : process.env.WDIO_TEST_RUN_ID,
			spec_id     : this.spec_id,
			suite_title : this.suite_title,
			duration    : this.duration || 0,
			passed      : !this.failed ? 1 : 0,
			failed      : this.failed ? 1 : 0,
			skipped     : this.skipped ? 1 : 0,
		};

		try {
			request(this.endpoint, query, variables);
		}
		catch(e) {
			// Foo
		}
	}

	onComplete() {
		const query = `
			mutation CompleteTestRun($id: Int!) {
				testRunComplete(id: $id) {
					id
				}
			}
		`;

		const variables = {
			id : process.env.WDIO_TEST_RUN_ID,
		};

		try {
			return request(this.endpoint, query, variables);
		}
		catch(e) {
			// Foo
		}
	}
}

export default TestResultsService;
