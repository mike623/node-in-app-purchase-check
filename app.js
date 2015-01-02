var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var IAPVerifier = require('iap_verifier');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send('hello');
});

app.all('/check_purchase', function(req, res) {
  console.log(req.body);
  var transaction = req.param('transaction');
  var receipt = transaction.transactionReceipt;
  var result = {};
  var client = new IAPVerifier('2567363b81c44bdeac914c8d627d50dc');
  client.verifyAutoRenewReceipt(receipt, true, function(valid, msg, data) {
    result.data = {
      msg: msg,
      data: data
    };

    if (valid) {
      result.ok = true;
      console.log("Valid receipt");
    } else {
      console.log("Invalid receipt");
      result.ok = false;
    }

    console.log(data.receipt, data.latest_receipt_info, '====result from apple');

    res.send(result);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('checkpurchase');

app.set('port', process.env.PORT || process.env.OPENSHIFT_INTERNAL_PORT || 3000);
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

var server = app.listen(app.get('port'), app.get('host'), function() {
  debug('Express server listening on port ' + server.address().port);
});
