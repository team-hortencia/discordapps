var prop =  PropertiesService.getScriptProperties().getProperties();
var sheetId = prop.SHEET_ID;
var sheetName = prop.SHEET_NAME_YOUTUBE;

function triggerYoutube()
{

  // A列に羅列してる前提
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  var values = sheet.getRange(1,1, sheet.getLastRow(), 1).getValues();

  // 配列にチャンネルIDをつめとく
  var channels = [];
  for(var i = 0; i < values.length; ++i){
    channels.push(values[i][0]);
  }
  
  for (var i = 0; i < channels.length; ++i) {

    // 一番新しい動画の日付を（lastFeedDateYoutube_ + チャンネルID）でプロパティに保持しておく
    var lastFeedDateKey = 'lastFeedDateYoutube_' + channels[i];
    var lastDateStr = getProperty(lastFeedDateKey);
    var lastDate = null;
    if(lastDateStr === null){
      var jst = new Date();
      lastDate = new Date(jst.getTime() - (9 * 60 * 60 * 1000));
    } else {
      lastDate = new Date(lastDateStr);
    }

    // 一番新しい動画の日付
    var newestDate = new Date(lastDate);

    // 最新5件もらえる
    var results = YouTube.Activities.list('snippet,contentDetails',{
      channelId: channels[i]
    });

    for (var j = 0; j < results.items.length; ++j) {
      var item = results.items[j];
      var snippet = item.snippet;
      var contentDetails = item.contentDetails;

      // 記事の公開日
      var pubDate = new Date(item.snippet.publishedAt);

      if(pubDate.getTime() <= lastDate.getTime()){
        // 返却されるリストが新しい順のため以降も古い
        break;
      }

      // 一番新しいのであれば更新
      if(newestDate.getTime() < pubDate.getTime()){
        newestDate = pubDate;
      }


      // 通知用メッセージ作成
      var message = 'https://www.youtube.com/watch?v=' + contentDetails.upload.videoId;
      console.log(message);
      
      postMessage(message);
      postMessage_potato(message);

    }

    // 保存
    setProperty(lastFeedDateKey,newestDate.toString());

  }

}

// util
function getProperty(key)
{
  return PropertiesService.getScriptProperties().getProperty(key);
}
function setProperty(key,value){
  PropertiesService.getScriptProperties().setProperty(key,value);
}

// 適当に実装してね
function postMessage(message){
  var url = prop.discordWebhooks01;
  var payload = JSON.stringify({content: message});
  
  var params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DiscordBot (http://example.com, v0.0.1)',
    },
    method: "post",
    payload: payload,
  };
  
  var rawRespons = UrlFetchApp.fetch(url, params);
}

function postMessage_potato(message){
  var url = prop.discordWebhooksPotato;
  var payload = JSON.stringify({content: message});
  
  var params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DiscordBot (http://example.com, v0.0.1)',
    },
    method: "post",
    payload: payload,
  };
  
  var rawRespons = UrlFetchApp.fetch(url, params);
}
function test () {
  postMessage('わーい');
}