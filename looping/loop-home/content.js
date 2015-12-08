var self = {
    "name" : "Felicia",
    "profile-pic" : "user-icon.png"
};

var posts1 = [{
    "source" : "Gail",
    "date" : "11:30pm 11/24/15",
    "location" : "San Francisco, CA",
    "type" : "written",
    "content" : "Here's a picture of the latest stuff I have for the website! Let me know if you have any changes you want me to make and I'll make sure to add them!",
    "comments" : [{
        "source" : "Felicia",
        "content" : "Awesome! Thanks Gail!"
    }]
},
{
    "source" : "Lauren",
    "date" : "7:43pm 11/24/15",
    "location" : "Pittsburgh, PA",
    "type" : "written",
    "content" : "If you guys want to see my current UI, I posted it on the drive.",
    "comments" : []
},
{
    "source" : "Casey",
    "date" : "1:30pm 11/20/15",
    "location" : "Pittsburgh, PA",
    "type" : "written",
    "content" : "Take a look at what I came up with!",
    "comments" : []
},
{
    "source" : "Evi",
    "date" : "10:45am 11/19/15",
    "location" : "Pittsburgh, PA",
    "content" : "Meeting at 11:30am in Tazza! You guys there!",
    "comments" : []
},
{
    "source" : "Felicia",
    "date" : "5:01pm 11/15/15",
    "location" : "Pittsburgh, PA",
    "type" : "written",
    "content" : "Here's the group! Post the content you come up with here!",
    "comments" : []
}];

var posts2 = [{
    "source" : "Justin",
    "date" : "11:30pm 11/24/15",
    "location" : "San Francisco, CA",
    "type" : "written",
    "content" : "This is awesome! Great job guys keep it up!",
    "comments" : []
},
{
    "source" : "Felicia",
    "date" : "5:01pm 11/15/15",
    "location" : "Pittsburgh, PA",
    "type" : "written",
    "content" : "Here's the group! Post the content you come up with here!",
    "comments" : []
}];

var members = {
    "Gail" : {
        "pic" : "user-icon.png",
        "groups" : ["Social Web Final Project", "Roommates"],
        "last-message" : "Sounds Great!"
    },
    "Evi" : {
        "pic" : "user-icon.png",
        "groups" : ["Social Web Final Project"],
        "last-message" : "I love Tazza!"
    },
    "Lauren" : {
        "pic" : "user-icon.png",
        "groups" : ["Social Web Final Project"],
        "last-message" : "Let's meet to design stuff!"
    },
    "Casey" : {
        "pic" : "user-icon.png",
        "groups" : ["Social Web Final Project"],
        "last-message" : "Awesome! now I'll work on this other thing!"
    },
    "Justin" : {
        "pic" : "user-icon.png",
        "groups" : ["15110 Staff", "Management Game", "Swim Team Seniors"],
        "last-message" : "Goodnight!"
    },
    "Andrew" : {
        "pic" : "user-icon.png",
        "groups" : ["15110 Staff", "Management Game", "Swim Team Seniors"],
        "last-message" : "Parting is such sweet sorrow"
    },
    "Jonathan" : {
        "pic" : "user-icon.png",
        "groups" : ["15110 Staff", "Management Game", "Swim Team Seniors"],
        "last-message" : "That I shall say Goodnight"
    },
    "Tim" : {
        "pic" : "user-icon.png",
        "groups" : ["15110 Staff", "Management Game"],
        "last-message" : "Till it be morrow"
    }
}

var groups = [{
    "title" : "15110 Staff",
    "members" : ["Justin", "Andrew", "Jonathan", "Tim"],
    "posts" : posts2
},
{
    "title" : "Management Game",
    "members" : ["Justin", "Andrew", "Jonathan", "Tim"],
    "posts" : posts2
},
{
    "title" : "Social Web Final Project",
    "members" : ["Gail", "Evi", "Lauren", "Casey"],
    "posts" : posts1
},
{
    "title" : "Swim Team Seniors",
    "members" : ["Justin", "Andrew", "Jonathan"],
    "posts" : posts2
},
{
    "title" : "Roommates",
    "members" : ["Gail"],
    "posts" : []
}];




