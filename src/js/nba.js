"use strict";

var $ = require("jquery");
var d3 = require("d3");
var _ = require("lodash");

// Although we specify a Season, that doesn't matter since IsOnlyCurrentSeason is set
// to 0, meaning the Season is ignored. We have to specify a Season otherwise we get
// an error from the API.
var nbaStatsAPI = "http://stats.nba.com/stats/commonallplayers/?LeagueID=00&Season=2014-15&IsOnlyCurrentSeason=0";

var renderBubbleChart = function(data) {
    var diameter = 680;
    var color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#bubble-chart").append("svg")
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

    node.append("text")
      .attr("dy", ".3em")
      .attr("class", "bubble-text")
      .style("text-anchor", "middle")
      .text(function(d) { if (d.value > 15) { return d.name; } });

    d3.select(document.frameElement).style("height", diameter + "px");
};

$.ajax(nbaStatsAPI, {
    dataType: "jsonp"
})
.done(function(data) {
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

    mostPopularNames = _.map(mostPopularNames, function(value, key) {
        return { name: key, value: value };
    });

    renderBubbleChart({ children: mostPopularNames });
});