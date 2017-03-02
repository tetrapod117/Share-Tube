$(document).ready(function () {

    // 定数宣言
    var APIKEY = 'APIKEY';

    // グローバル変数
    var callList = [];
    var myPeerid = '';
    var myStream = null;
    var peer = null;

    // getUserMediaのcompatibility
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Peerオブジェクトを生成
peer = new Peer ({key: APIKEY,debug: 3});

    // エラーハンドラ
peer.on('error',function(err){
  consol.error(err);
});

    // openイベントのハンドラ
peer.on(`open`,function(id){
myPeerid = id;
console.log('My peer ID is: ' + id );
$('#myStream').get(0).addEventListener('play',function(){
  myStream = $('#myStream').get(0).captureStream();
  connectToPeers();
  $('#my-id').text(peer.id);
});
navigator.getUserMedia({
  audio: true,
  video: false
},function(stream){
//  $('#myStream').prop('src',URL.createObjectURL(stream));

},function(){
  console.log(`getUserMedia error`);
});
});

    // callイベント用のハンドラを設置
    peer.on('call',function(call){
      call.answer(myStream);

      //setupCallEventHandlers(call);

      addCall(call);
    });
    
        // ユーザリストを取得して片っ端から繋ぐ

function connectToPeers(){
  peer.listAllPeers(function(list){
    for(var cnt = 0;cnt < list.length;cnt++){
      if(myPeerid != list[cnt]){
        var call = peer.call(list[cnt], myStream);
        //setupCallEventHandlers(call);
        addCall(call);
      }
    }
  });
}

    // コールの追加
function addCall(call){
  callList.push(call);
}

    // コールの削除
function removeCall(call){
  var position = callList.indexOf(call);
  if(position > 0){
    callList.splice(position,1)
  }
}

    // VIDEO要素を追加する
function addVideo(call,stream){
  var videoDom = $('<video autoplay>');
  videoDom.attr('id',call.peer);
  videoDom.prop('src',URL.createObjectURL(stream));
    $('.videosContainer').append(videoDom);
}

    // VIDEO要素を削除する
function removeVideo(call){
  $('#'+call.peer).remove();
}

peer.on('connection', function(connection){
  　
    // データ通信用に connectionオブジェクトを保存しておく
    conn = connection;

    // 接続が完了した場合のイベントの設定
    conn.on("open", function() {
        // 相手のIDを表示する
        // - 相手のIDはconnectionオブジェクトのidプロパティに存在する
        $("#peer-id").text(conn.id);
    });

    // メッセージ受信イベントの設定
    conn.on("data", onRecvMessage);
});

// メッセージ受信イベントの設定
function onRecvMessage(data) {
    // 画面に受信したメッセージを表示
    $("#messages").append($("<p>").text(conn.id + ": " + data).css("font-weight", "bold"));
}
$("#send").click(function() {
       // 送信テキストの取得
       var message = $("#message").val();

       // 送信
       conn.send(message);

       // 自分の画面に表示
       $("#messages").append($("<p>").html(peer.id + ": " + message));

       // 送信テキストボックスをクリア
       $("#message").val("");
   });


});
