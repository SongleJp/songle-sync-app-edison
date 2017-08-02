// LEDをチカチカさせたい
var grove = require("jsupm_grove"), LEDBar = require("jsupm_my9221"), led = new grove.GroveLed(2), bar = new LEDBar.GroveLEDBar(8, 9), bar2 = new LEDBar.GroveLEDBar(6, 7);
var SongleWidget = require("songle-widget");
// トークンの情報を取ってくる
var settings = require("./settings");
// Songle Widget IoMT APIのエンドポイント指定
SongleWidget.System.defaultEndpointWebClientProtocol = "https:";
SongleWidget.System.defaultEndpointWebClientHost = "api.songle.jp";
SongleWidget.System.defaultEndpointWebSocketProtocol = "https:";
SongleWidget.System.defaultEndpointWebSocketHost = "api.songle.jp";
SongleWidget.System.showLogMode = true;
// ビート情報と基本情報をもらってくる
var player = new SongleWidget.Player({
    accessToken: settings.tokens.access
});
player.addPlugin(new SongleWidget.Plugin.Beat());
player.addPlugin(new SongleWidget.Plugin.Chorus());
player.addPlugin(new SongleWidget.Plugin.SongleSync());
// 何かあったらコンソールに書き出す
player.on("play", function (ev) { return console.log("play"); });
player.on("seek", function (ev) { return console.log("seek"); });
// 曲が止まったらLED消灯
player.on("pause", function (ev) {
    console.log("pause");
    led.off();
    bar.setBarLevel(0);
    bar2.setBarLevel(0);
    on = false;
});
// 曲が止まったらLED消灯
player.on("finish", function (ev) {
    console.log("finish");
    led.off();
    bar.setBarLevel(0);
    bar2.setBarLevel(0);
    on = false;
});
// ビートごとにLED点滅
var on = false, inChorus = false;
player.on("chorusSectionLeave", function (ev) {
    inChorus = false;
});
player.on("chorusSectionEnter", function (ev) {
    inChorus = true;
});
player.on("beatEnter", function (ev) {
    console.log("beat:", ev.data.beat.position);
    if (on)
        led.off();
    else
        led.on();
    if (inChorus) {
        bar.setBarLevel(on ? 10 : 0);
        bar2.setBarLevel(on ? 10 : 0);
    }
    else {
        bar.setBarLevel(ev.data.beat.position * 10 / ev.data.beat.count, true);
        bar2.setBarLevel(ev.data.beat.position * 10 / ev.data.beat.count, false);
    }
    on = !on;
});
process.on('SIGTERM', function () {
    led.off();
    bar.setBarLevel(0);
    bar2.setBarLevel(0);
});
