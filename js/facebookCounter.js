// define 3 global variable to save all data
var userID = [];
var userName = [];
var countOfUsername = [];
var message = [];

var t = $('#dataTables-example').DataTable({
    responsive: true,
    "aaSorting": [2,'desc'],
    "columnDefs": [
    { "width": "9%", "targets": 0, className: "text-center" }
  ],
  "aoColumns": [
            { sWidth: '10%' },
            { sWidth: '40%' },
            { sWidth: '20%' },
            { sWidth: '30%' }
           ]
});


$("#countNow").click(function() {
  $("countNow").attr('disabled', 'disabled');

  //loading modal with jquery
    $('body').loadingModal({
      position: 'auto',
      text: 'Loading database. It can take a few minutes!',
      color: '#fff',
      opacity: '0.7',
      backgroundColor: 'rgb(0,0,0)',
      animation: 'doubleBounce'
    });
  // Get access_token and post ID from user input
  var token = $("#facebookToken").val();
  var url = 'https://graph.facebook.com/me/conversations/'; //https://graph.facebook.com/v1.0/t_660852740756958/messages?access_token=EAAAAUaZA8jlABANiB0eIDnKstvnzjZA5hM4Vc1qKcXQkZBTft1kRgI10pH1ag2WJrkEIIZBORljFPmqcp2fYcF8o61CYJNsE69pWi1UBML1KQxV2LEnftLWIRRDe5lB3DRKkt3M8UTKv6QZAYUtmyodShhBQZCo7GTRyZAdCetZBWgMnmZCxwLSja&pretty=1&limit=25&after=QVFIUjljdWsxRzcxVWxoU1d5czRqRWZASQ2p5c3RCWm5OdGQzUF9lV244b0c1MnlzWlM5V1dScmRoOW05bXd3SVowWVJYM21WRDJEZAk54WUdQVlhVVVlrUW5vM1cyWkNxa0RVRk5pakVvS0pxRlFKNnVEV29BWjBVZAGNfekFIYUY5WHpf
// https://graph.facebook.com/me/conversations?access_token=EAAAAUaZA8jlABANiB0eIDnKstvnzjZA5hM4Vc1qKcXQkZBTft1kRgI10pH1ag2WJrkEIIZBORljFPmqcp2fYcF8o61CYJNsE69pWi1UBML1KQxV2LEnftLWIRRDe5lB3DRKkt3M8UTKv6QZAYUtmyodShhBQZCo7GTRyZAdCetZBWgMnmZCxwLSja&version=v3.1
  // Get data from facebook with GET method using graph API
  $.get(url, {
    access_token: token,
    version: 3.1
  }).done(function(response) {

    //Call function to count Messages
    facebookCounter(response);

  }).fail(function(response) {
    $.alert(JSON.parse(response.responseText).error.message);
    $('#getComment').attr('disabled',false); // active scan button
    $('body').loadingModal('destroy');
  });

});

function facebookCounter(res) {
    for(var i = 0; i < res.data.length; ++i) {

      if (res.data[i].participants.data[2] === undefined) {
        // Count message of a user.
        // string is image display
        var urlImage = 'https://graph.facebook.com/' + res.data[i].participants.data[0].id + '/picture';
        var image = '<img style="border-radius: 50%" height="50px" width="50px" src="'+urlImage+'" />   ';

        var urlUser = 'https://facebook.com/' + res.data[i].participants.data[0].id;
        var linkUser = '<a href="'+urlUser+'" target="_blank">'+res.data[i].participants.data[0].name+'</a>'

        // Save username
        userName.push(image + linkUser);

        //Save number of message
        countOfUsername.push(res.data[i].message_count);
        // Save User ID
        userID.push(res.data[i].participants.data[0].id);

        var urlMessage = 'https://www.facebook.com/messages/t/' + res.data[i].participants.data[0].id;
        var buttonMessage = '<a href="'+urlMessage+'" target="_blank"><button class="btn btn-primary" type="button">View Messages</button></a>'
        message.push(buttonMessage);
      }
    }

    if(res && res.paging) {
      if(res.paging.next) {
        $.getJSON(res.paging.next, function(response) {
          facebookCounter(response);
        });
      } else{
        drawTable();
      }
    }
}

// Function to draw tables
function drawTable() {
    bubbleSort();
    //var top = $("#topNumber").val();
  //  console.log(top);
  var top = 20;
    for (var i = userID.length - top; i < userID.length; i++) {
      t.row.add([ top, userName[i], countOfUsername[i], message[i] ]).draw(false);
      top--;
    }
    $("#displayNone").hide();
    $('body').loadingModal('destroy');
}

function bubbleSort()
{
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < countOfUsername.length-1; i++) {
            if (countOfUsername[i] > countOfUsername[i+1]) {
                var temp = countOfUsername[i];
                var temp2 = userName[i];
                var temp3 = userID[i];
                var temp4 = message[i];

                countOfUsername[i] = countOfUsername[i+1];
                userName[i] = userName[i+1];
                userID[i] = userID[i+1];
                message[i] = message[i+1];

                countOfUsername[i+1] = temp;
                userName[i+1] = temp2;
                userID[i+1] = temp3;
                message[i+1] = temp4;
                swapped = true;
            }
        }
    } while (swapped);
}
