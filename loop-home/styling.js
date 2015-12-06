/*jslint browser: true*/
/*global $, jQuery, alert, click, slideToggle, slideUp, console, offset, scrollTop, scrollIntoView, */


function createWritePostBlock () {
    var write_post_chunk = document.createElement("div");
    write_post_chunk.id = "header-post";
    write_post_chunk.innerHTML = '<div id="postOptionWrap"><div id="postOption"><ul><li class="postOption-chunk selected"><a href="#" id="write-post-button">write post</a></li><span>|</span><li class="postOption-chunk" id="add-photo-vid-button"><a href="#">add photo/video</a></li><span>|</span><li class="postOption-chunk"><a href="#" id="ask-question-button">ask question</a></li><span>|</span><li class="postOption-chunk"><a href="#" id="add-file-button">add file</a></li></ul><div id="postOptionSeparator">____________________________________________________________________</div><textarea name="postText" id="postText" rows="3" cols="84" placeholder="Write Something..." ></textarea></div></div></div>';

    return write_post_chunk;
}

function createPostChunk (post) {
    
   var post_chunk = document.createElement("div"),
       user_header = document.createElement("div"),
       user_pic = document.createElement("div"),
       user_img = document.createElement("img"),
       post_info = document.createElement("div"),
       user_name = document.createElement("div"),
       date = document.createElement("div"),
       post_content = document.createElement("div"),
       postOptionSeparator = document.createElement("div"),
       comment_chunk = document.createElement("div"),
       comment_user_pic = document.createElement("div"),
       comment_img = document.createElement("img"),
       comment_input = document.createElement("input");

    post_chunk.className = "post-chunk";

    user_header.className = "user-header";
    user_pic.className = "user-pic";
    if (post.source == self.name) {
        user_img.src = self["profile-pic"];
    } else {
        user_img.src = members[post.source].pic;
    }
    user_pic.appendChild(user_img);
    user_header.appendChild(user_pic);
    post_info.className = "post-info";
    user_name.className = "user-name";
    user_name.innerHTML = post["source"];
    post_info.appendChild(user_name);
    date.className = "date";
    date.innerHTML = post["date"];
    post_info.appendChild(date);
    user_header.appendChild(post_info);
    
    post_chunk.appendChild(user_header);
    
    post_content.className = "post-content";
    post_content.innerHTML = post["content"];
    
    post_chunk.appendChild(post_content);
    
    postOptionSeparator.id = "postOptionSeparator";
    postOptionSeparator.innerHTML = "_____________________________________________________________________________";
    
    post_chunk.appendChild(postOptionSeparator);
    
    comment_chunk.className = "comment-chunk";
    comment_user_pic.className = "comment-user-pic";
    comment_img.src = self["profile-pic"];
    comment_user_pic.appendChild(comment_img);
    comment_chunk.appendChild(comment_user_pic);
    comment_input.type = "text";
    comment_input.placeholder = "Write a comment...";
    comment_chunk.appendChild(comment_input);
    
    post_chunk.appendChild(comment_chunk);
    
    return post_chunk;

}

function createUserChunk (user) {
  var user_chunk = document.createElement("li"),
      user_pic = document.createElement("div"),
      user_img = document.createElement("img"),
      lower_div = document.createElement("div"),
      user_name = document.createElement("div"),
      last_message = document.createElement("div");
       
    user_chunk.className = "user-chunk";
    user_pic.className = "user-pic";
    user_img.src = members[user].pic;
    user_pic.appendChild(user_img);
    user_chunk.appendChild(user_pic);
    
    user_name.className = "user-name";
    user_name.innerHTML = members[user].name;
    lower_div.appendChild(user_name);
    last_message.className = "last-message";
    last_message.innerHTML = members[user]["last-message"];
    lower_div.appendChild(last_message);
    user_chunk.appendChild(lower_div);

    return user_chunk;
}

(function( $ ){
   $.fn.switchGroup = function(group) {
       $(document).find('#project-title').html(group.title);
       
       // Replace posts
       $('.post-chunk').remove();
       
       for (var i = 0; i < group.posts.length; i+=1) {
           var post = group.posts[i],
               post_chunk = createPostChunk(post);
           $(document).find("#bulletin-post").append(post_chunk);
       }
       
       //Replace users
       $('.user-chunk').remove();
       
       for (var i = 0; i < group.members.length; i+=1) {
           var user = group.members[i],
               user_chunk = createUserChunk(user);
           $(document).find("#users").append(user_chunk);
       }
      return this;
   }; 
})( jQuery );

$(window).load(function () {
    "use strict";
    
    $('#users .user-chunk').click(function () {
        if (!$(this).hasClass('selected')) {
            $('#users .selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });
    
    $('#nav .nav-chunk').click(function () {
        if (!$(this).hasClass('selected')) {
            $('#nav .selected').removeClass('selected');
            $(this).addClass('selected');
            
            if (this.id == "bulletin-board-button") {
                $(document).find('#bulletin-post').html("");
                
                var group = groups[$(document).find("#conversations .selected li .group-title").html()];
                
                // Replace write post block
                $('#header-post').remove();

                $(document).find("#bulletin-post").append(createWritePostBlock());

                // Replace posts
                $('.post-chunk').remove();

                for (var i = 0; i < group.posts.length; i+=1) {
                    var post = group.posts[i],
                        post_chunk = createPostChunk(post);
                    $(document).find("#bulletin-post").append(post_chunk);
                }

                //Replace users
                $('.user-chunk').remove();

                for (var i = 0; i < group.members.length; i+=1) {
                    var user = group.members[i],
                        user_chunk = createUserChunk(user);
                    $(document).find("#users").append(user_chunk);
                }
            }
            
            if (this.id == "calendar-button") {
                $(document).find('#bulletin-post').html("<span>Calendar!</span>");                
            }
            
            if (this.id == "drive-button") {
                $(document).find('#bulletin-post').html("<span>Drive!</span>");                
            }
            
            if (this.id == "files-button") {
                $(document).find('#bulletin-post').html("<span>Files!</span>");                
            }
        }
    });
    
    $('#conversations .conversation-chunk').click(function () {
        if (!$(this).hasClass('selected')) {
            $('#conversations .selected').removeClass('selected');
            $(this).addClass('selected');
            var newTitle = $(this).find('.group-title').html(),
                group = groups[newTitle];
            $(document).find('#project-title').html(newTitle);

            $('#placeholder-text').remove();
                        
            // Replace write post block
            $('#header-post').remove();
            
            $(document).find("#bulletin-post").append(createWritePostBlock());
            
            // Replace posts
            $('.post-chunk').remove();
            
            for (var i = 0; i < group.posts.length; i+=1) {
                var post = group.posts[i],
                    post_chunk = createPostChunk(post);
                $(document).find("#bulletin-post").append(post_chunk);
            }
            
            //Replace users
            $('.user-chunk').remove();

            for (var i = 0; i < group.members.length; i+=1) {
                var user = group.members[i],
                    user_chunk = createUserChunk(user);
                $(document).find("#users").append(user_chunk);
            }

        }
    });
    
    $('#postOption .postOption-chunk').click(function () {
        if (!$(this).hasClass('selected')) {
            $('#postOption .selected').removeClass('selected');
            $(this).addClass('selected');         
        }
    });
});
