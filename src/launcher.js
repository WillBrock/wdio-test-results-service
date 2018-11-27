import { request } from 'graphql-request';

class TestResultsService {
	async onPrepare(config) {
		this.endpoint       = process.evn.GRAPHQL_ENDPOINT;
		this.test_run_title = process.env.TEST_RUN_TITLE || Date.now();
		this.version        = process.env.CODE_VERSION || null;
		this.failed_tests   = {};

		if(!this.endpoint) {
			throw new Error(`No graphql endpoint specified`);
		}

		const query = `
			mutation createTestRun($run_title: String!, $version: String) {
				Run(run_title: $run_title, version: $version) {
					id,
				}
			}
		`;

		const variables = {
			run_title : this.test_run_title,
			version   : this.version,
		};

		const result = await request(this.endpoint, query, variables);

		this.test_run_id = result.id;
	};

	before() {
		// Each session id is a browser session. e.g. a spec file
		this.session_id = global.browser.sessionId;
		this.failed     = false;
		this.skipped    = false;
		this.spec_id    = null;
		this.duration   = 0;
	}

	beforeSuite(suite) {
		this.suite_title = suite.title;
	}

	afterTest(test) {
		// Get the test file name
		if(!this.spec_id && test.file) {
			const match = test.file.match(/([^\/]+)\.(js|ts)/);

			if(match) {
				this.spec_id = match[1];
			}
		}

		if(test.failed) {
			this.failed = true;

			this.failed_tests[this.spec_id] = true;
		}

		if(test.skipped) {
			this.skipped = true;
		}

		// Remove a failed test if this is a retry and the test passes
		if(this.passed && this.failed_tests[this.spec_id]) {
			delete this.failed_tests[this.spec_id];
		}

		this.duration += test.duration;
	}

	after(data) {
		const query = `
			mutation addTestResult($test_run_id: Int!, $spec_id: String!, $suite_title: String!, $duration: Int!, $passed: Int!, $failed: Int!, $skipped: Int!) {
				Result() {
					id,
				}
			}
		`;

		const variables = {
			test_run_id : this.test_run_id,
			spec_id     : this.spec_id,
			suite_title : this.suite_title,
			duration    : this.duration,
			passed      : !this.failed ? 1 : 0,
			failed      : this.failed ? 1 : 0,
			skipped     : this.skipped ? 1 : 0,
		};

		request(this.endpoint, query, variables);
	}

	async onComplete() {
		const failed_run = Object.keys(this.failed_tests).length > 0;

		const query = `
			mutation completeTestRun($id: Int!, $passed: Int!, $failed: Int!) {
				Complete(id: $id, passed: $passed, failed: $failed) {
					id
				}
			}
		`;

		const variables = {
			id     : this.test_run_id,
			passed : failed_run ? 0 : 1,
			failed : failed_run ? 1 : 0,
		}

		const result = await request(this.endpoint, query, variables);
		// Remove retries from the automation testing site db (user_audit_trail)
		// Update the test run with end datetime and failed or passed
	}
}

export default TestResultsService;
