describe('JobController', function() {
  beforeEach(function() {
    module('app');
    module('app.controllers');
  });

  var $httpBackend, $controller, healthService;
  var API_ROOT = 'http://8.8.4.4:8080';
  var DEFAULT_START_DATE = new Date();

  beforeEach(inject(function(_$httpBackend_, _$controller_, _healthService_) {
    $httpBackend = _$httpBackend_;
    mockConfigService();
    mockHealthService();

    $controller = _$controller_;

    healthService = _healthService_;
  }));

  function mockHealthService() {
    var startDate = new Date(DEFAULT_START_DATE);
    startDate.setDate(startDate.getDate() - 1);

    var expectedResponse = {
      tests: {
        "2014-11-19T01:00:00": {
          "tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_list_fixed_ip_details": {
            fail: 1,
            pass: 27,
            run_time: 1
          },
          "tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_set_reserve": {
            fail: 0,
            pass: 13,
            run_time: 1
          },
          "tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_set_unreserve": {
            fail: 0,
            pass: 12,
            run_time: 1
          }
        }
      }
    };
    var endpoint = API_ROOT +
      '/build_name/gate-tempest-dsvm-neutron-full/test_runs?' +
      'callback=JSON_CALLBACK&' +
      'datetime_resolution=hour&' +
      'start_date=' +
      startDate.toISOString();
    $httpBackend.expectJSONP(endpoint)
    .respond(200, expectedResponse);
  }

  function mockConfigService() {
    var expectedResponse = { apiRoot: API_ROOT };
    var endpoint = 'config.json';
    $httpBackend.expectGET(endpoint).respond(200, expectedResponse);
  }

  it('should process chart data correctly', function() {
    var jobController = $controller('JobController', {
      healthService: healthService,
      jobName: 'gate-tempest-dsvm-neutron-full',
      startDate: DEFAULT_START_DATE
    });
    $httpBackend.flush();

    var expectedChartData = [{
      key: 'Passes',
      values: [{
        x: 1416358800000,
        y: 52
      }],
      color: 'blue'
    }, {
      key: 'Failures',
      values: [{
        x: 1416358800000,
        y: 1
      }],
      color: 'red'
    }];
    expect(jobController.chartData).toEqual(expectedChartData);
  });

  it('should process chart data rate correctly', function() {
    var jobController = $controller('JobController', {
      healthService: healthService,
      jobName: 'gate-tempest-dsvm-neutron-full',
      startDate: DEFAULT_START_DATE
    });
    $httpBackend.flush();

    var expectedChartDataRate = [{
      key: '% Failures',
      values: [{
        x: 1416358800000,
        y: 1.8867924528301887
      }]
    }];
    expect(jobController.chartDataRate).toEqual(expectedChartDataRate);
  });

  it('should process tests correctly', function() {
    var jobController = $controller('JobController', {
      healthService: healthService,
      jobName: 'gate-tempest-dsvm-neutron-full',
      startDate: DEFAULT_START_DATE
    });
    $httpBackend.flush();

    var expectedTests = [{
      name: 'tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_list_fixed_ip_details',
      passes: 27,
      failures: 1,
      failures_rate: 3.5714285714285716,
      mean_runtime: 1
    }, {
      name: 'tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_set_reserve',
      passes: 13,
      failures: 0,
      failures_rate: 0,
      mean_runtime: 1
    }, {
      name: 'tempest.api.compute.admin.test_fixed_ips:FixedIPsTestJson.test_set_unreserve',
      passes: 12,
      failures: 0,
      failures_rate: 0,
      mean_runtime: 1
    }];

    expect(jobController.tests).toEqual(expectedTests);
  });
});
