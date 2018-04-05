/*

Description:  WSD 2018, Group Work, Alphabet Game

Genre: Educational, Rating: 3

Author: Jyrki Iivainen

*/
// Game data
var id_current_letter = 0;
var id_next_letter = 0;
var previous_letter = "";
var selected_letter = "";
var next_letter = "";
var correct = 0;
var wrong = 0;
var points = 0;

// References to audio elements
var this_is_sound;
var where_is_sound;
var current_letter_sound;
var next_letter_sound;
var success_sound;
var failure_sound;

// Frame size
var frame_width = 480;
var frame_heigth = 360;

// card colors
var color_normal = "DodgerBlue";
var color_ok = "LawnGreen";
var color_fail = "Red";

//------------------------------------------------------------------------------
// Send a SETTING message to parent window.
function send_setting_message()
{
    var msg = {};
    msg.messageType = "SETTING";
    msg.options = {
        "width": frame_width, // pixels
        "height": frame_heigth // pixels
    };
    window.parent.postMessage(msg, "*");
}

//------------------------------------------------------------------------------
// Returns a JSON object to be sent to the game store.
function get_save_data()
{
    "use strict";
    var data = {
        "id_current_letter": id_current_letter,
        "id_next_letter": id_next_letter,
        "previous_letter": previous_letter,
        "selected_letter": selected_letter,
        "next_letter": next_letter,
        "correct": correct,
        "wrong": wrong,
        "points": points
   };
   return data;
}

//------------------------------------------------------------------------------
// Assigns given game data.
function load_save_data(data)
{
    "use strict";
    var selector = "";
    
    console.log("Alphabet game: load_save_data");
    selector = "#" + id_current_letter;
    $(selector).css("background-color", color_normal);
    
    id_current_letter = data.id_current_letter;
    id_next_letter = data.id_next_letter;
    previous_letter = data.previous_letter;
    selected_letter = data.selected_letter;
    next_letter = data.next_letter;
    correct = data.correct;
    wrong = data.wrong;
    points = data.points;

    selector = "#" + id_current_letter;
    $(selector).css("background-color", color_ok);
    
    update_points();
    
    update_next_letter();
}

//------------------------------------------------------------------------------
function update_points()
{
    $("#correct").val(correct);
    $("#wrong").val(wrong);
    $("#points").val(points);
}

//------------------------------------------------------------------------------
function update_next_letter()
{
    "use strict";
    var selector = "";
    
    while (1) {
        id_next_letter = Math.floor(Math.random() * 29) + 1; // returns a number between 1 and 29
        if (id_next_letter !== id_current_letter) {
            break;
        }
    }

    selector = "#" + id_next_letter;
    next_letter = $(selector).html();

    $("#help-text").html("Tämä on " + selected_letter + ", missä on " +  next_letter + "?");

    console.log("src", "audio/" + selected_letter + ".wav")
    current_letter_sound.setAttribute("src", "audio/" + selected_letter + ".wav");
    next_letter_sound.setAttribute("src", "audio/" + next_letter + ".wav");

    this_is_sound.play();
}

//------------------------------------------------------------------------------
// Run scripts when document object is ready.
$(document).ready(function() {
    "use strict";

    document.body.style.cursor = "hand";

    // Set up objects referencing audio elements
    this_is_sound = $("#this-is-sound").get(0);
    where_is_sound = $("#where-is-sound").get(0);
    current_letter_sound = $("#current-letter-sound").get(0);
    next_letter_sound = $("#next-letter-sound").get(0);
    success_sound = $("#success-sound").get(0);
    failure_sound = $("#failure-sound").get(0);
    success_sound.volume = 0.2;
    failure_sound.volume = 0.1;

    // Sequence audio plays
    this_is_sound.addEventListener("ended", function() {
        current_letter_sound.play();
    });
    current_letter_sound.addEventListener("ended", function() {
        where_is_sound.play();
    });
    where_is_sound.addEventListener("ended", function() {
        next_letter_sound.play();
    });

    //------------------------------------------------------------------------------
    // Handle letter clicking
    $(".grid-item").click(function(event) {
        var selector = "";
        var color = color_normal;

        selected_letter = event.target.innerText;
        
        if (previous_letter === selected_letter) {
            return;
        }
        if (next_letter === "") {
            // first letter, do nothing
        }
        else if (selected_letter !== next_letter) {
            failure_sound.play();
            points = points - 1;
            if (points < 0) {
                points = 0;
            }
            wrong = wrong + 1;
            color = color_fail;
        }
        else {
            success_sound.play();
            points = points + 1;
            correct = correct + 1;
            color = color_ok;
        }
        
        update_points();

        previous_letter = selected_letter;

        selector = "#" + id_current_letter;
        $(selector).css("background-color", color_normal);
        id_current_letter = event.target.id;
        selector = "#" + id_current_letter;
        $(selector).css("background-color", color);

        update_next_letter();
    });

    //----------------------------------------------------------------------------
    // Handle score button push.
    $("#button-score").click(function(event) {
        // sent from the game to the service, informing of a new score submission
        var msg = {};
        msg.messageType = "SCORE";
        msg.score =  points;
        window.parent.postMessage(msg, "*");
        correct = 0;
        wrong = 0;
        points = 0;
    });

    //----------------------------------------------------------------------------
    // Handle save button push.
    $("#button-save").click(function(event) {
        var data = get_save_data();
        // Sent from the game to the service, the service should now store the
        // sent game state
        var msg = {};
        msg.messageType = "SAVE";
        msg.gameState =  data;
        window.parent.postMessage(msg, "*");
    });

    //----------------------------------------------------------------------------
    // Handle load button push.
    $("#button-load").click(function(event) {
        //var data = load_save_data(data);
        // Sent from the game to the service, requesting that a game state
        // (if there is one saved) is sent from the service to the game
        var msg = {};
        msg.messageType = "LOAD_REQUEST";
        window.parent.postMessage(msg, "*");
    });

    //----------------------------------------------------------------------------
    // Respond to messages sent by the game store.
    //~ $(window).on("message", function(evt) {
        //~ //Note that messages from all origins are accepted
        //~ var msg = evt.originalEvent;
        //~ var type = msg.messageType;

        //~ if (type === "LOAD") {
            //~ // game state to load
            //~ var data = msg.gameState;
            //~ load_save_data(data);
            //~ send_setting_message();
        //~ }
        //~ else if (type === "ERROR") {
            //~ // information to be relayed to the user on what went wrong
            //~ var info  = msg.info;
            //~ window.alert(info);
        //~ }
    //~ });

//----------------------------------------------------------------------------
    // Respond to messages sent by the game store.
    window.addEventListener("message", function(evt) {
        //Note that messages from all origins are accepted
        var msg = evt.originalEvent;
        var type = evt.data.messageType;

        if (type === "LOAD") {
            // game state to load
            var data = evt.data.gameState;
            load_save_data(data);
            send_setting_message();
        }
        else if (type === "ERROR") {
            // information to be relayed to the user on what went wrong
            var info  = msg.info;
            window.alert(info);
        }
    });

    //----------------------------------------------------------------------------
    // Finished initial load. Notify Game Store.
    send_setting_message();
});
