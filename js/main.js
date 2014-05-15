Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/*$(function(){
    $( "[data-role='header'], [data-role='footer']" ).toolbar();
});*/

var currentDeviceController = null;

/*function errorCallback(e) {
  if (e.code == 1) {
    alert('User denied access to their camera');
  } else {
    alert('getUserMedia() not supported in your browser.');
  }
  //e.target.src = 'http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.ogv';
}*/

function openPopup(id) {
  setTimeout(function() {
    $('#'+id).popup('open');
  }, 250); // we have to wait a little bit for another popup to show
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getDeviceControllersById(deviceController, id) {
  // filtering the device controller by id
  return deviceController.filter(
    function(data){return data.id == id}
  );
}

//var server = 'http://192.168.232.1/server/';
//var server = 'http://localhost:8888/webserver/';
var server = 'http://192.168.187.101:3000/';
//var server = 'http://192.168.43.19:3000/';
//var server = 'http://192.168.43.189:8888/webserver/';
//var server = 'http://192.168.232.103:8888/server/';

//var source_url = server + 'index.php';
//var source_url = "testing.json"; // for development only
var source_url = server + 'Gateways/read';

//var docCookies.hasItem('isloggedin');

$(document).on('mobileinit', function() {
  //var docCookies.hasItem('isloggedin') = docCookies.hasItem('isloggedin') ? docCookies.getItem('islogged') : false;

  /*if (docCookies.hasItem('isloggedin') && docCookies.hasItem('u') && docCookies.hasItem('p')) {
    docCookies.hasItem('isloggedin') = true;
  }
  else docCookies.hasItem('isloggedin') = false;*/
});

$(document).on('pageinit', '#authPage',function() {
  // check if user have login cookie or not
  if (docCookies.hasItem('isloggedin')) {
    $.mobile.pageContainer.pagecontainer('change', '#homePage', { });
  }
  else {

  }
});

$(document).on('pagebeforeshow', '#homePage', function() {
  console.log('#homePage isloggedin : ' + docCookies.hasItem('isloggedin'));
  if (!docCookies.hasItem('isloggedin')) {
    $.mobile.pageContainer.pagecontainer('change', '#authPage', { });
  }
  var username = docCookies.hasItem('u') ? docCookies.getItem('u') : '';
  var password = docCookies.hasItem('p') ? docCookies.getItem('p') : '';
  
  // load the webqr
  load();
    // fill the listview from JSON
    var i=0;

    $.ajax({
      type: 'GET',
      url: source_url,
      //data: data,
      //headers : { "Authorization" : "Basic " + btoa(username + ":" + password) },
      beforeSend: function(xhr) {
        // This callback function will trigger before data is sent
        $.mobile.loading('show');
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      success: function(data) {
        console.log("Success updating data");

        localStorage.setItem('gateway', JSON.stringify(data)); // fill result to local storage [HTML5]

        $('#device_list').html(''); // clean up first

        $.each(data, function(index, value) {
          $('#device_list').append('<li data-role="list-divider">Gateway '+value.id+'</li>');
          $('#device_list').listview('refresh');
            $.each(value.DeviceControllers, function(index, value) {
              //console.log(value);
              $('#device_list').append('<li><a href="detail.html?id='+value.id+'">Device Controller '+value.id+'</a></li>');
              $('#device_list').listview('refresh');
            });
            i++;
        });
      },
      error : function(data, error) {
        console.log("Error updating data");
      },
      complete: function() {
        // A function to be called when the request finishes (after success and error callbacks are executed).
        $.mobile.loading('hide');
      },
      dataType: "json"
    });
});

$(document).on('pagebeforeshow', '#detailPage', function() {
  if (!docCookies.hasItem('isloggedin')) {
    $.mobile.pageContainer.pagecontainer('change', '#authPage', { });
  }
    // showing the Leds in Device Controller with id = "id"
    var id = getUrlVars()["id"];
    var deviceControllers = JSON.parse(localStorage.getItem('gateway'))[0].DeviceControllers;
    currentDeviceController = getDeviceControllersById(deviceControllers, id)[0];
    $('#deviceControllerDetail #deviceId').append(id);

    $.each(currentDeviceController.Leds, function(index, value) {
      console.log(value);
      var label = 'led-'+value.id;
      $('#detailPage #ledForm').append('<div data-role="fieldcontain"><label for="'+label+'">Led '+value.id+'</label><input type="checkbox" data-ledid="'+value.id+'" id="'+label+'" data-role="flipswitch"></div>');
      if (value.status == 1) {
        $('#'+label).val('on').attr('checked', true);
      }
      else {
        $('#'+label).val('off').attr('checked', false);
      }
      $('#'+label).flipswitch();
      $('#'+label).parent().parent().fieldcontain();

    });
});

$(document).on('pagebeforehide', '#detailPage', function() {
  // moving away from the detail page, so we set the current to null
  currentDeviceController = null;
});

$(document).on('change', 'input[id|="led"]', function() {
  // listen to any change for the input checkboxes / the flipswitches
  var ledId = -1; // default for error checking
  if($(this).prop('checked')) {
    ledId = $(this).data('ledid');
    $(this).val('on').attr('checked', true);
    // TODO: make ajax post call to update led status
  }
  else {
    ledId = $(this).data('ledid');
    $(this).val('off').attr('checked', false);
    // TODO: make ajax post call to update led status
  }
});

var add_device_list = 0; // 0=undefined; 1=gateway; 2=devicecontroller; 3=device;
$(document).on('click', '#add-device-list a', function() {
  $('#popupDialog').popup('close');
  if ($(this).attr('id') == 'add_gateway') {
    add_device_list = 1;
    openPopup('popupInput');
  }
  else if ($(this).attr('id') == 'add_devicecontroller') {
    add_device_list = 2;
    openPopup('popupInput');
  }
  else if ($(this).attr('id') == 'add_device') {
    add_device_list = 3;
    openPopup('popupInput');
  }
});

$(document).on('click', '#manual_input', function() {
  $('#popupInput').popup('close');
  switch (add_device_list) {
    case 0:
      // something error here
      return false;
    case 1:
      // add gateway
      // do something
      openPopup('popupAddGateway');
      break;
    case 2:
      // add devicecontroller
      // do something
      openPopup('popupAddDeviceController');
      break;
    case 3:
      // add device
      // do something
      openPopup('popupAddDevice');
      break;
  }
});

$(document).on('popupbeforeposition', '#popupAddGateway', function() {
  console.log('before add gateway');
});

$(document).on('popupbeforeposition', '#popupAddDeviceController', function() {
  console.log('before add device controller');
  // clean up the select
  $('#popupAddDeviceController #select1').empty();
  // populate the select element here with ajax get request from server (gateway)
  var username = docCookies.hasItem('u') ? docCookies.getItem('u') : '';
  var password = docCookies.hasItem('p') ? docCookies.getItem('p') : '';
  $.ajax({
      type: 'GET',
      url: server + 'Gateways/read',
      beforeSend: function(xhr) {
        // This callback function will trigger before data is sent
        $.mobile.loading('show');
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      success: function(data) {
        $.each(data, function(index, value) {
          if(index == 0) // make sure something is selected as default
            $('#popupAddDeviceController #select1').append('<option selected="selected" value="'+value.id+'">Gateway '+value.id+'</option>');
          else
            $('#popupAddDeviceController #select1').append('<option value="'+value.id+'">Gateway '+value.id+'</option>');
        });
        $('#popupAddDeviceController #select1').selectmenu('refresh');
      },
      error : function(data, error) {
        alert('uh oh something went wrong..');
        $('#popupAddDeviceController').popup('close');
      },
      complete: function() {
        // A function to be called when the request finishes (after success and error callbacks are executed).
        $.mobile.loading('hide');
      },
      dataType: "json"
    });
});

$(document).on('popupbeforeposition', '#popupAddDevice', function() {
  console.log('before add device');
  // clean up the select
  $('#popupAddDevice #select1').empty();
  $('#popupAddDevice #select2').empty();
  // populate the select element here with ajax get request from server (gateway and device controller)
  var username = docCookies.hasItem('u') ? docCookies.getItem('u') : '';
  var password = docCookies.hasItem('p') ? docCookies.getItem('p') : '';
  $.ajax({
      type: 'GET',
      url: server + 'Gateways/read',
      beforeSend: function(xhr) {
        // This callback function will trigger before data is sent
        $.mobile.loading('show');
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      success: function(data) {
        $.each(data, function(index, value) {
          if(index == 0) // make sure something is selected as default
            $('#popupAddDevice #select1').append('<option selected="selected" value="'+value.id+'">Gateway '+value.id+'</option>');
          else
            $('#popupAddDevice #select1').append('<option value="'+value.id+'">Gateway '+value.id+'</option>');
        });
        $('#popupAddDevice #select1').selectmenu('refresh');
      },
      error : function(data, error) {
        alert('uh oh something went wrong..');
        $('#popupAddDevice').popup('close');
      },
      complete: function() {
        // A function to be called when the request finishes (after success and error callbacks are executed).
        $.mobile.loading('hide');
      },
      dataType: "json"
    });
});

// dynamically populated select2 (select device controller) for popupAddDevice from selected gateway
$(document).on('change', '#popupAddDevice #select2', function() {
  console.log('changed');
});

$(document).on('popupafterclose', '#popupInput', function() {
  if (window.stream !== null) {
    stop();
  }
});

$(document).on('click', '#authPage #register', function() {
  openPopup('popupRegister');
});

$(document).on('click', '#popupRegister #submit', function() {
  // TODO:
  var url = '/register/'; // post url to register
  var username = $('#popupRegister #username').val();
  var password = $('#popupRegister #password').val();
  var data = {
      'userName' : username,
      'password' : password
  };
  $.ajax({
      type: 'POST',
      url: url,
      data: data,
      beforeSend: function() {
        // This callback function will trigger before data is sent
        $.mobile.loading('show');
      },
      success: function(data) {
        console.log("Success updating data");
      },
      error : function(data, error) {
        console.log("Error updating data");
      },
      complete: function() {
        // A function to be called when the request finishes (after success and error callbacks are executed).
        $.mobile.loading('hide');
      },
      dataType: "json"
    });
});

$(document).on('click', '#authPage #login', function() {
  openPopup('popupLogin');
});

$(document).on('click', '#popupLogin #submit', function() {
  // TODO:
  var url = source_url; //+ '/login/'; // post url to register
  var username = $('#popupLogin #username').val();
  var password = $('#popupLogin #password').val();
  var remember_me = $('#popupLogin #remember-me').prop('checked');
  var data = {
      'userName' : username,
      'password' : password,
      //'remember-me' : remember_me
  };
  console.log(data);
  $.ajax({
      type: 'GET',
      url: url,
      //data: data,
      beforeSend: function(xhr) {
        // This callback function will trigger before data is sent
        $.mobile.loading('show');
        xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      },
      success: function(data) {
        console.log("Success login");
        docCookies.setItem('u', username);
        docCookies.setItem('p', password); // BAD!!
        docCookies.setItem('isloggedin', true);
        $.mobile.pageContainer.pagecontainer('change', '#homePage', { });
      },
      error : function(data, error) {
        console.log("Error login");
        alert('Wrong username/password');
        docCookies.removeItem('u');
        docCookies.removeItem('p');
        docCookies.hasItem('isloggedin', false);
      },
      complete: function() {
        // A function to be called when the request finishes (after success and error callbacks are executed).
        $.mobile.loading('hide');
      },
      dataType: "json"
    });
  if(!docCookies.hasItem('isloggedin')) return false;
});

$(document).on('swipeleft', '#car_list li', function() {
  // showing the delete button when user swipe on the list member
  /*
  alert('swiped!');
  $('.aDeleteBtn').remove();
  var $li = $(this);
  var $aDeleteBtn = $('<a>Delete</a>')
                .attr({
                  'class': 'aDeleteBtn ui-btn-up-r',
                  'href': '#',
                  'data-theme' : 'z'
                });
  $li.prepend($aDeleteBtn);
  $li.addClass('delete');
  */
});
