"use strict";

/*
   Griddle - Simple Grid Component for React
   https://github.com/DynamicTyped/Griddle
   Copyright (c) 2014 Ryan Lanciaux | DynamicTyped

   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
var React = require("react");

var CustomPaginationContainer = React.createClass({
  displayName: "CustomPaginationContainer",
  getDefaultProps: function () {
    return {
      maxPage: 0,
      nextText: "",
      previousText: "",
      currentPage: 0,
      customPagerComponent: {},
      resultsPerPage: 5,
      totalResults: 0,
      filteredResults: 0
    };
  },
  render: function () {
    var that = this;

    if (typeof that.props.customPagerComponent !== "function") {
      console.log("Couldn't find valid template.");
      return React.createElement("div", null);
    }

    return React.createElement(that.props.customPagerComponent, { maxPage: this.props.maxPage, nextText: this.props.nextText, previousText: this.props.previousText, currentPage: this.props.currentPage, setPage: this.props.setPage, previous: this.props.previous, next: this.props.next, resultsPerPage: this.props.resultsPerPage, totalResults: this.props.totalResults, filteredResults: this.props.filteredResults });
  }
});

module.exports = CustomPaginationContainer;