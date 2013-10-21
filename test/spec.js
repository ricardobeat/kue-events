
var kue    = require('kue')
  , vents  = require('../')
  , jobs   = kue.createQueue()
  , assert = require('assert')

jobs.process('test.1', function (job, done) {
    done()
})

jobs.process('test.2', function (job, done) {
    done()
})

suite('kue-events', function () {

    test('job events', function (done) {
        var kuevents = vents()
        kuevents.on('job complete', function (id) {
            assert(!isNaN(id))
            kuevents.destroy()
            done()
        })
        jobs.create('test.1', { test: 1 }).save()
    })

    test('options.job fetches job ', function (done) {
        var kuevents = vents({ job: true })
        kuevents.on('complete', function (job) {
            assert.equal(job.type, 'test.2')
            assert.equal(job.data.test, 2)
            kuevents.destroy()
            done()
        })
        jobs.create('test.2', { test: 2 }).save()
    })

})
