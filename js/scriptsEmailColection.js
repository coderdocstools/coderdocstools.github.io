// define 4 global variable to save all data
var userID = [];
var userComment = [];
var userName = [];
var userCreater = [];

var emailResult = '<br>';
var t = $('#dataTables-example').DataTable({
    responsive: true
});
/*
Get token from input and request data from Facebook
*/
$("#getComment").click(function() {
  $('#getComment').attr('disabled','disabled');
  // Get access_token and post ID from user input
  var token = $("#facebookToken").val();
  var postID = $("#postID").val();
  var url = 'https://graph.facebook.com/v3.1/' + postID + '/comments';

  // Get data from facebook with GET method using graph API
  $.get(url, {
    access_token:token
  }).done(function(response) {

    //loading modal with jquery
      $('body').loadingModal({
        position: 'auto',
        text: 'Loading database. It can take a few minutes!',
        color: '#fff',
        opacity: '0.7',
        backgroundColor: 'rgb(0,0,0)',
        animation: 'doubleBounce'
      });

    //call getcomment function
    getCommentFunction(response);
  }).fail(function(response) {
    $.alert(JSON.parse(response.responseText).error.message);
    $('#getComment').attr('disabled',false); // active scan button
  });
});
/*
End get data
*/

// function to get comment
// @input: JSON data which get from Facebook database.
function getCommentFunction (res) {
  for(var i = 0; i < res.data.length; i++) {
    userID.push(res.data[i].from.id);
    userComment.push(res.data[i].message);
    userName.push(res.data[i].from.name);
    userCreater.push(res.data[i].created_time);
  }

  if(res && res.paging){
    if(res.paging.next) {
      $.getJSON(res.paging.next,function(response){
        getCommentFunction(response);
        console.log('print');
      });
    } else {
      drawTable();
    }
  }
}


// Function to draw tables
function drawTable() {
  for (var i = 0; i < userComment.length; i++) {
    t.row.add([ userID[i], userName[i], userComment[i], userCreater[i] ]).draw(false);
  }

  $("#totalComment").text(userComment.length);
  // finish loading modal
  $('body').loadingModal('destroy');
}

//When user click to Collect Email button
$("#getEmail").click(function() {
  emailResult = '<br>';

  var totalEmails = 0;
  if(userComment.length === 0){ // Database is not loaded yet.
    $.alert('Database is not loaded yet. Please gets comment first.');
  } else {

    for(var i = 0; i < userComment.length; i++) {
      console.log(userComment[i]);
      userComment[i] = userComment[i].trim(); // Removes whitespace from both sides of a string

      for(var lenStr = 0; lenStr < userComment[i].length; lenStr++) {

        if (userComment[i][lenStr] === '@') { // have email
          var temp_string = '';

          var temp = lenStr;
          totalEmails++

          temp--;
          while(((userComment[i][temp] >= 'A' && userComment[i][temp] <= 'Z') || (userComment[i][temp] >= '0' && userComment[i][temp] <= '9') || (userComment[i][temp] >= 'a' && userComment[i][temp] <= 'z')
          || userComment[i][temp] === '.') && temp !== -1) {
            temp_string = temp_string + userComment[i][temp];
            temp--;
          }
          temp_string = temp_string.split("").reverse().join(""); // reverse string
          temp_string = temp_string + '@';

          temp = lenStr;
          temp++;
          while(((userComment[i][temp] >= 'A' && userComment[i][temp] <= 'Z') || (userComment[i][temp] >= '0' && userComment[i][temp] <= '9') || (userComment[i][temp] >= 'a' && userComment[i][temp] <= 'z')
          || userComment[i][temp] === '.') && temp !== userComment[i].length) {
            temp_string = temp_string + userComment[i][temp];
            temp++;
          }
          emailResult = emailResult + temp_string + '<br>';
          break;
        }
      }
    }
    $("#totalEmail").text(totalEmails);
    $.alert(emailResult);
  }

});
