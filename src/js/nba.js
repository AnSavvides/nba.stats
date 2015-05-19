"use strict";

var $ = require("jquery");
var d3 = require("d3");
var _ = require("lodash");

// We define these up here so we can re-use them for updating
// the bubble chart once it has been created
var svg, bubble, text;
var color = d3.scale.category20c();

// Util for getting the duration based on what has been selected
var getDuration = function() {
    var checkedDuration = $("#duration input[type=radio]:checked").val();

    return checkedDuration === "all" ? 0 : 1;
};

var durationRadioButtons = $("#duration input[type=radio][name=duration]");

var getNbaStatsAPI = function() {
    // Although we specify a Season, that doesn't matter since IsOnlyCurrentSeason is set
    // to 0, meaning the Season is ignored. We have to specify a Season otherwise we get
    // an error from the API.
    return "http://stats.nba.com/stats/commonallplayers/?LeagueID=00&Season=2014-15&IsOnlyCurrentSeason=" + getDuration();
};

var updateBubbleChart = function(data) {
    var formattedData = bubble.nodes(data).filter(function(d) { return !d.children; });

    var node = svg.selectAll(".node")
        .data(formattedData);

    // Capture enter selection
    var nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // Re-use enter selection for circles
    nodeEnter
        .append("circle")
        .attr("r", function (d) { return d.r; })
        .style("fill", function (d, i) { return color(i); });

    // Re-use enter selection for text
    text
        .data(formattedData)
        .text(function (d) {
            var threshold = getDuration() === 0 ? 15 : 2;
            if (d.value > threshold) { return d.name; }
        });

    node.select("circle")
        .transition().duration(1000)
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill", function (d, i) {
            return color(i);
        });

    node.transition().attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.exit().remove();
};

var renderBubbleChart = function(data) {
    var diameter = 680;

    bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    svg = d3.select("#bubble-chart").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    var node = svg.selectAll(".node")
      .data(bubble.nodes(data).filter(function(d) { return !d.children; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.name); });

    text = node.append("text")
      .attr("dy", ".3em")
      .attr("class", "bubble-text")
      .style("text-anchor", "middle")
      .text(function(d) {
        // Define a threshold for when to add some text to a bubble; with
        // all time names, we need to bump this up otherwise we will have
        // way too much text flying around in the UI.
        var threshold = getDuration() === 0 ? 15 : 2;

        if (d.value > threshold) { return d.name; }
      });

    d3.select(document.frameElement).style("height", diameter + "px");
};

var getMostPupularNames = function(data) {
    var allPlayers = data.resultSets[0].rowSet;
    var mostPopularNames = {};

    _.each(allPlayers, function(player) {
        var playerFirstName = player[1].split(", ")[1];

        if (mostPopularNames.hasOwnProperty(playerFirstName)) {
            mostPopularNames[playerFirstName] += 1;
        } else {
            mostPopularNames[playerFirstName] = 1;
        }
    });

    return _.map(mostPopularNames, function(value, key) {
        return { name: key, value: value };
    });
};

var makeRequestAndRenderBubbleChart = function(renderFunction) {
    var nbaStatsAPI = getNbaStatsAPI();

    $.ajax(nbaStatsAPI, {
        dataType: "jsonp"
    })
    .done(function(data) {
        renderFunction({ children: getMostPupularNames(data) });
    });
};

var onDurationChange = function() {
    makeRequestAndRenderBubbleChart(updateBubbleChart);
};

// when the duration is changed, we will want to re-render
durationRadioButtons.change(onDurationChange);

makeRequestAndRenderBubbleChart(renderBubbleChart);