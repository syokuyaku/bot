var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var forecast = require('weather-yahoo-jp').forecast;



//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//ボットの仕組みを提供してくれるUniversalBotオブジェクトを提供する
var bot = new builder.UniversalBot(connector);

// エンドポイントとしてボットをサーバで提供する
server.post('/api/messages', connector.listen());

// 認識に指定するluis apiのurlを指定
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=4fcf3965-0fce-44c6-b072-e078b85f95b7&subscription-key=033428336fd540aca26ab6f088d69f09');

// IntentDialogオブジェクトを作成
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});


//=========================================================
// Bots Dialogs
//=========================================================

// 初期ダイアログをintentDialogとして使用する
bot.dialog('/', intents);

intents.matches('isWeather',
    function (session, args) {
        var city = builder.EntityRecognizer.findEntity(args.entities, 'City');
        var day = builder.EntityRecognizer.findEntity(args.entities, 'Day');
		var forecastResult = "";
		var resultText = "";
		var forecastArea = "";
        if (city) {
			forecastArea = city.entity.replace(/\s+/g,"");
			forecast.get(forecastArea).then(function(forecast) {
				if (day) {
					if (day.entity == '明日' || day.entity == 'あした' || day.entity == 'あす') {
						forecastResult = forecast.tomorrow.text;
						resultText += '明日の';
					} else if (day.entity == '今日' || day.entity == '本日' || day.entity == 'きょう') {
						forecastResult = forecast.today.text;
						resultText += '今日の';
					} else {
						session.endDialog("今日か明日の天気しかわかりませんが何か？万能じゃないんで。");
					}
					resultText += forecast.where + "の天気は" + forecastResult + "なんじゃない？あとは気象庁に聞いてくれ。";
					session.endDialog(resultText);
				} else {
					session.endDialog("今日か明日くらい言ってくれてもいいんじゃない？");
				}
			}).catch(function(err) {
				session.endDialog("何故か例外をキャッチしたよ。ぼく死ぬのかな？");
			});
		} else {
			session.endDialog("都道府県ぐらい言ってほしいもんだ。");
		}
    }
)
.matches('getWeather', 
    function (session, args) {
        var city = builder.EntityRecognizer.findEntity(args.entities, 'City');
        var day = builder.EntityRecognizer.findEntity(args.entities, 'Day');
		var forecastResult = "";
		var resultText = "";
		var forecastArea = "";
        if (city) {
			forecastArea = city.entity.replace(/\s+/g,"");
			forecast.get(forecastArea).then(function(forecast) {
				if (day) {
					if (day.entity == '明日' || day.entity == 'あした' || day.entity == 'あす') {
						forecastResult = forecast.tomorrow.text;
						resultText += '明日の';
					} else if (day.entity == '今日' || day.entity == '本日' || day.entity == 'きょう') {
						forecastResult = forecast.today.text;
						resultText += '今日の';
					} else {
						session.endDialog("今日か明日の天気しかわかりませんが何か？万能じゃないんで。");
					}
					resultText += forecast.where + "の天気は" + forecastResult + "だと思うよ。勘だけども。";
					session.endDialog(resultText);
				} else {
					session.endDialog("今日か明日くらい言ってくれてもいいんじゃない？");
				}
			}).catch(function(err) {
				session.endDialog("何故か例外をキャッチしたよ。ぼく死ぬのかな？");
			});
		} else {
			session.endDialog("都道府県ぐらい言ってほしいもんだ。");
		}
    }
)
.matches('whois', 
    function (session, args) {
		session.endDialog("はじめまして僕はbot。名前はまだない。日本の天気に詳しいよ。");
	}
)
.matches('replyHello', 
    function (session, args) {
		var greet = builder.EntityRecognizer.findEntity(args.entities, 'Greetings');
		if (greet) {
			session.endDialog(greet.entity.replace(/\s+/g,"") + "。");
		} else {
			session.endDialog("ん？よ、よお。（。。。よくわからないけど挨拶っぽい）");
		}
	}
)
.matches('replyGoodBye', 
    function (session, args) {
		var greet = builder.EntityRecognizer.findEntity(args.entities, 'Greetings');
		if (greet) {
			session.endDialog(greet.entity.replace(/\s+/g,"") + "。天気が知りたくなったらまた呼んでロボ。");
		} else {
			session.endDialog("別れの挨拶を言われている気がする。ではまたね。");
		}
	}
)
.onDefault(function (session) { session.send("日本語でok") });


