"use strict";
exports.__esModule = true;
var Utils_1 = require("../Utils");
var QuoteService = /** @class */ (function () {
    function QuoteService() {
        this.quotes = [];
    }
    QuoteService.prototype.initialize = function (bot) {
        var _this = this;
        bot.redisLoad('quotes', function (err, res) {
            _this.quotes = res;
        });
        if (!this.quotes) {
            this.quotes = [];
            bot.redisSave('quotes', this.quotes);
        }
        bot.registerCommand('addquote', function (msg, args) {
            if (Utils_1.isStringNullOrWhitespace(args)) {
                msg.channel.send('Invalid quote');
                return;
            }
            var quote = { id: _this.quotes.length + 1, content: args, author: msg.member.user.username };
            _this.quotes.push(quote);
            bot.redisSave('quotes', _this.quotes);
            msg.channel.send("Saved quote #" + _this.quotes.length);
        });
        bot.registerCommand('readquote', function (msg, args) {
            if (!args || !(+args && +args <= _this.quotes.length)) {
                msg.channel.send('Invalid quote id');
                return;
            }
            var quote = _this.quotes[+args - 1];
            msg.channel.send("Quote #" + quote.id + ": " + quote.content + " - Added by " + quote.author);
        });
        bot.registerCommand('delquote', function (msg, args) {
            if (!args || !(+args && +args <= _this.quotes.length)) {
                msg.channel.send('Invalid quote id');
                return;
            }
            var quote = _this.quotes[+args - 1];
            _this.quotes.splice(_this.quotes.indexOf(quote), 1);
            msg.channel.send("Deleted quote #" + +args);
        });
        bot.registerCommand('randomquote', function (msg) {
            var quote = _this.quotes[Utils_1.random(0, _this.quotes.length - 1)];
            msg.channel.send("Quote #" + quote.id + ": " + quote.content + " - Added by " + quote.author);
        });
    };
    return QuoteService;
}());
exports["default"] = QuoteService;
