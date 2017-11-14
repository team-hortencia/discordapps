var prop =  PropertiesService.getScriptProperties().getProperties();
var sheetId = prop.SHEET_ID;
var sheetName = prop.SHEET_NAME_RSS;

function gameUpdate() {
  
    // A列に羅列してる前提
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  var values = sheet.getRange(1,1, sheet.getLastRow(), 1).getValues();

  // 配列にfeedのURLをつめとく
  var feeds = [];
  for(var i = 0; i < values.length; ++i){
    feeds.push(values[i][0]);
  }
  for (var i = 0; i < feeds.length; ++i) {
    
    var lastFeedDateKey = 'lastFeedDate_' + feeds[i];
    var lastDateStr = getProperty(lastFeedDateKey);
    var lastDate = null;
    if(lastDateStr === null){
      var jst = new Date();
      lastDate = new Date(jst.getTime() - (9 * 60 * 60 * 1000));
    } else {
      lastDate = new Date(lastDateStr);
    }
    
    var newestDate = new Date(lastDate);
    
    // フィードを取得
    var rss = ELERSSReader.GetRSS(feeds[i]);
    if (rss != null) {
      for (var j = 0; j < rss.data.length; ++j) {
        var item = rss.data[j];
        var title = item.title[0];
        var url = item.link[0];

        // 記事の公開日
        var pubDate = new Date(item.pubDate[0]);

        if(pubDate.getTime() <= lastDate.getTime()){
          // 返却されるリストが新しい順のため以降も古い
          break;
        }

        // 一番新しいのであれば更新
        if(newestDate.getTime() < pubDate.getTime()){
          newestDate = pubDate;
        }

        // 通知用メッセージ作成
        var message = title + '\n' + url;
        postUpdate(message);
      }
      setProperty(lastFeedDateKey,newestDate.toString());
    }
  }
}

function postUpdate(message){
  var url = prop.discordWebhooks_update;
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