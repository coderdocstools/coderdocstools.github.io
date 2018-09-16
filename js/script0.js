var t = $('#example').DataTable({
  responsive: true
});
$('.listunfriends-id').text("[empty]");

var dataRemove = [];
var nameRemove = [];

var totalFriend = 0;
var totalNinja = 0;
var totalComment = 0;
var totalReaction = 0;

/*-----------------------------*/
//select emements in table
$('#example tbody').on( 'click', 'tr', function () {
    $(this).toggleClass('selected');
    var data = t.row( this ).data();

    if (dataRemove.indexOf(data[1]) === -1) {
      dataRemove.push(data[1]);
      nameRemove.push(data[0]);
      $('.listunfriends-id').text(nameRemove);
    } else {
      dataRemove.splice(dataRemove.indexOf(data[1]), 1);
      nameRemove.splice(nameRemove.indexOf(data[0]), 1);
      $('.listunfriends-id').text(nameRemove);
    }
    if(dataRemove.length === 0){
      $('.listunfriends-id').text("[empty]");
    }
} );
//---------------------------------------------------------------------------------------------------
$("#unselect").on('click', function (){
//$("tr.selected").removeClass('selected');
t.rows( '.selected' ).nodes().to$().removeClass( 'selected' );
dataRemove = [];
nameRemove = [];
$('.listunfriends-id').text("[empty]");
});

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
function clickingListFriendFunction(){
  var temp_string = '<br>';
  for (var i = 0; i < nameFriends.length; ++i) {
    temp_string = temp_string + nameFriends[i] + '<br>';
  }
  if(temp_string == '<br>'){
    $.alert('Nothing to show!');
  } else {
    $.alert(temp_string);
  }
}

function clickingListNinjaFunction(){
  var temp_string = '<br>';
  for (var i = 0; i < nameNinjas.length; ++i) {
    temp_string = temp_string + nameNinjas[i] + '<br>';
  }
  if(temp_string == '<br>'){
    $.alert('Nothing to show!');
  } else {
    $.alert(temp_string);
  }
}

function clickingCommentFunction(){
    $.alert('Please see in below table!');
}

function clickingReactionFunction(){
    $.alert('Please see in below table!');
}

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
$("#confirm").on('click', function	(){
var token=$('#token').val();
if(dataRemove.length === 0){
$.alert('You have nobody to remove. Please click someone and try again!');
}else {
$.confirm({
  title: 'Warning!',
  content: 'Do you want to unfriend those people?',
  buttons: {
      confirm: function () {
          //remove friends
          for(var i = 0; i < dataRemove.length; ++i){
            var url='https://graph.facebook.com/me/friends?uid='+dataRemove[i]+'&method=delete';
            $.get(url,{access_token:token}).done(function(response){

      }).fail(function(response){
        $.alert(JSON.parse(response.responseText).error.message+'\n');
        break;
      });
      t.row('.selected').remove().draw( false );

    }
    $.alert('Successfully confirmed!');
    dataRemove = [];
    $('.listunfriends-id').text("[empty]");
      },
      cancel: function () {
          $.alert('Successfully cancel!');
      }
  }
});
}
});
//---------------------------------------------------------------------------------------------------

// Handle Facebook token
var token=$('#token').val()

var flag = 0;

var countComments = [];
var countReactions = [];
var nameFriends = [];
var nameNinjas = [];
// click to scan token
$('#scan').click(function(){
  var token=$('#token').val();
  $('#scan').attr('disabled','disabled');

  $.get('https://graph.facebook.com/v3.0/me/',
      {access_token:token}).done(function(response){
        $('.yourname').text("Your name: " +response.name);
        $('.yourid').text("Your ID: " +response.id);


        //loading modal with jquery
          $('body').loadingModal({
            position: 'auto',
            text: 'Loading database. It can take a few minutes!',
            color: '#fff',
            opacity: '0.7',
            backgroundColor: 'rgb(0,0,0)',
            animation: 'doubleBounce'
          });

          getFriends(token);
      }).fail(function(response){
        $.alert(JSON.parse(response.responseText).error.message);
        $('#scan').attr('disabled',false); // active scan button
});
});


// main function
function getFriends(token){
$.get('https://graph.facebook.com/v3.0/me?fields=friends.limit(5000)',
{access_token:token}).done(function(response){
  $('#loading').text('Loading Database. Please wait...');

  var idFriends = new Array(response.friends.data.length);

    //init array
  for (var i = 0; i < response.friends.data.length; ++i) {
    countComments[i] = 0; // save amount of comment of every friend
    countReactions[i] = 0; // save amount of Reaction of every friend
    idFriends[i] = response.friends.data[i].id; // save ID of all friends
    nameFriends[i] = response.friends.data[i].name; // save name of all friends
  }
      console.log("done friends");
      //------------------------------------------------------------------
      //------------------------------------------------------------------
      $.get('https://graph.facebook.com/v3.0/me/?fields=feed.limit(300){comments{from},reactions{id}}',
        {access_token:token}).done(function(response){
          console.log(response);
            countComment(response.feed, idFriends, countComments) // caculate count of comment
            console.log("done comment");
            countLike(response.feed, idFriends, countReactions); // caculate count of like
            console.log("done comment");
      });

      //------------------------------------------------------------------
      //------------------------------------------------------------------

}).fail(function(response){
  $.alert(JSON.parse(response.responseText).error.message);
  $('#scan').attr('disabled',false); // active scan button
});
}

function countLike(response, idFriends, countReac){
for (var j = 0; j < response.data.length; ++j) { //250 lần
  if(response.data[j].reactions) { //if have comment in any post
    countLikeInside(response.data[j].reactions, idFriends, countReac);
  }
}
if(response.paging&&response){
  if (response.paging.next) {

    $.getJSON(response.paging.next,function(response){
      countLike(response, idFriends, countReac);
    });
  }
}else {
  drawTable (idFriends, 1);
}
}

function countLikeInside (response, idFriends, countReac) {
for (var k = 0; k < response.data.length; ++k) {
  for (var i = 0; i < idFriends.length; ++i) {
    if ((idFriends[i] === response.data[k].id)) {
      ++countReac[i];
    }
  }
}
if (response.paging&&response) {
  if (response.paging.next) {
    $.getJSON(response.paging.next,function(response){
      countLikeInside(response, idFriends, countReac);
    });
  }
}
}

function countComment(response, idFriends, count){
for (var j = 0; j < response.data.length; ++j) {
  if(response.data[j].comments) { //if have comment in any post
    countCommentInside(response.data[j].comments, idFriends, count);
    console.log("done cout comment inside");
  }
}
if(response.paging&&response){
  if (response.paging.next) {

    $.getJSON(response.paging.next,function(response){
      countComment(response, idFriends, count);
    });
  }
}else {
  drawTable (idFriends, 1);
}
}

function countCommentInside(response, idFriends, count){
for (var k = 0; k < response.data.length; ++k) {
  if(response.data[k].from!==null) {
    for (var i = 0; i < idFriends.length; ++i) {
      if ((idFriends[i] === response.data[k].from.id)) {
        ++count[i];
      }
    }
  }
}
if (response.paging&&response) {
  if (response.paging.next) {
    $.getJSON(response.paging.next,function(response){
      countCommentInside(response, idFriends, count);
    });
  }
}
}

function drawTable (idFriends, flagTemp){
flag += flagTemp;
if (flag === 2) {
  console.log("start");
  for (var i = 0; i < idFriends.length; ++i) {
    t.row.add([ nameFriends[i], idFriends[i], countReactions[i], countComments[i] ]).draw(false);
    totalComment += countComments[i]; // save total comment
    totalReaction += countReactions[i]; //save total reaction
    if(countReactions[i] === 0 && countComments[i] === 0) {
       ++totalNinja;
       nameNinjas.push(nameFriends[i]);
    }
  }
  console.log("done");
  totalFriend = idFriends.length; //save total friends
  $('#totalFriend').text(totalFriend);
  $('#totalNinja').text(totalNinja);
  $('#totalComment').text(totalComment);
  $('#totalReaction').text(totalReaction);

  // destroy the plugin
  $('body').loadingModal('destroy');



  $('#loading').text("Successfully!");

  $.alert("Get data successfully! Let's enjoy! ");
}
}
