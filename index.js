var EventEmitter = require('events').EventEmitter
  , util         = require('util')
  , events       = require('kue/lib/queue/events')
  , kue          = require('kue')

function KueEvents (options) {
  if (!(this instanceof KueEvents)) return new KueEvents(options)
  EventEmitter.call(this)
  this.options = options || {}
  this.client = kue.redis.pubsubClient()
  this.subscribe()
}

util.inherits(KueEvents, EventEmitter)

KueEvents.prototype.subscribe = function () {
  this.client.subscribe(events.key)
  this.client.on('message', this.onMessage.bind(this))
}

KueEvents.prototype.onMessage = function (channel, msg) {
  var self = this

  try { msg = JSON.parse(msg) } catch (e) {
    self.emit('invalid', msg)
  }

  self.emit('job ' + msg.event, msg.id)

  if (!this.options.job) return

  kue.Job.get(msg.id, function (err, job) {
    if (err) return self.emit('error', msg)
    self.emit('' + msg.event, job)
  })

}

KueEvents.prototype.destroy = function () {
  this.removeAllListeners()
}

module.exports = KueEvents
