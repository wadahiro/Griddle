﻿/** @jsx React.DOM */

/*
   Griddle - Simple Grid Component for React
   https://github.com/DynamicTyped/Griddle
   Copyright (c) 2014 Ryan Lanciaux | DynamicTyped

   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
var React = require('react');
var GridTable = require('./gridTable.jsx');
var GridFilter = require('./gridFilter.jsx');
var GridPagination = require('./gridPagination.jsx');
var GridSettings = require('./gridSettings.jsx');
var GridTitle = require('./gridTitle.jsx');
var GridNoData = require('./gridNoData.jsx');
var CustomRowFormatContainer = require('./customRowFormatContainer.jsx');
var CustomPaginationContainer = require('./customPaginationContainer.jsx');
var _ = require('underscore');

var Griddle = React.createClass({
    getDefaultProps: function() {
        return{
            "columns": [],
            "columnMetadata": [],
            "resultsPerPage":5,
            "results": [], // Used if all results are already loaded.
            "initialSort": "",
            "initialSortAscending": true,
            "gridClassName":"",
            "tableClassName":"",
            "customRowFormatClassName":"",
            "settingsText": "Settings",
            "filterPlaceholderText": "Filter Results",
            "nextText": "Next",
            "previousText": "Previous",
            "maxRowsText": "Rows per page",
            "enableCustomFormatText": "Enable Custom Formatting",
            //this column will determine which column holds subgrid data
            //it will be passed through with the data object but will not be rendered
            "childrenColumnName": "children",
            //Any column in this list will be treated as metadata and will be passed through with the data but won't be rendered
            "metadataColumns": [],
            "showFilter": false,
            "showSettings": false,
            "useCustomRowFormat": false,
            "useCustomGridFormat": false,
            "useCustomPager": false,
            "customRowFormat": null,
            "customGridFormat": null,
            "customPager": {},
            "allowToggleCustom":false,
            "noDataMessage":"There is no data to display.",
            "customNoData": null,
            "showTableHeading":true,
            "showPager":true,
            "useFixedHeader":false,
            "useExternal": false,
            "externalSetPage": null,
            "externalChangeSort": null,
            "externalSetFilter": null,
            "externalSetPageSize":null,
            "externalMaxPage":null,
            "externalCurrentPage": null,
            "externalSortColumn": null,
            "externalSortAscending": true,
            "externalResults": [],
            "infiniteScroll": null,
            "bodyHeight": null,
            "infiniteScrollSpacerHeight": 50
        };
    },
    /* if we have a filter display the max page and results accordingly */
    setFilter: function(filter) {
        if(this.props.useExternal) {
            this.props.externalSetFilter(filter);
            return;
        }

        var that = this,
        updatedState = {
            page: 0,
            filter: filter
        };

        // Obtain the state results.
       updatedState.filteredResults = _.filter(this.props.results,
       function(item) {
            var arr = _.values(item);
            for(var i = 0; i < arr.length; i++){
               if ((arr[i]||"").toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0){
                return true;
               }
            }

            return false;
        });

        // Update the max page.
        updatedState.maxPage = that.getMaxPage(updatedState.filteredResults);

        //if filter is null or undefined reset the filter.
        if (_.isUndefined(filter) || _.isNull(filter) || _.isEmpty(filter)){
            updatedState.filter = filter;
            updatedState.filteredResults = null;
        }

        // Set the state.
        that.setState(updatedState);
    },
    setPageSize: function(size){
        if(this.props.useExternal) {
            this.props.externalSetPageSize(size);
            return;
        }

        //make this better.
        this.props.resultsPerPage = size;
        this.setMaxPage();
    },
    toggleColumnChooser: function(){
        this.setState({
            showColumnChooser: !this.state.showColumnChooser
        });
    },
    toggleCustomFormat: function(){
        if(this.state.customFormatType === "grid"){
            this.setProps({
                useCustomGridFormat: !this.props.useCustomGridFormat
            });
        } else if(this.state.customFormatType === "row"){
            this.setProps({
                useCustomRowFormat: !this.props.useCustomRowFormat
            });
        }
    },
    getMaxPage: function(results, totalResults){
        if(this.props.useExternal){
          return this.props.externalMaxPage;
        }

        if (!totalResults) {
          totalResults = (results||this.getCurrentResults()).length;
        }
        var maxPage = Math.ceil(totalResults / this.props.resultsPerPage);
        return maxPage;
    },
    setMaxPage: function(results){
        var maxPage = this.getMaxPage(results);
        //re-render if we have new max page value
        if (this.state.maxPage !== maxPage){
          this.setState({ maxPage: maxPage, filteredColumns: this.props.columns });
        }
    },
    setPage: function(number) {
        if(this.props.useExternal) {
            this.props.externalSetPage(number);
            return;
        }

        //check page size and move the filteredResults to pageSize * pageNumber
        if (number * this.props.resultsPerPage <= this.props.resultsPerPage * this.state.maxPage) {
            var that = this,
                state = {
                    page: number
                };

                that.setState(state);
        }
    },
    getColumns: function(){
        var that = this;

        var results = this.getCurrentResults();

        //if we don't have any data don't mess with this
        if (results === undefined || results.length === 0){ return [];}

        var result = this.state.filteredColumns;

        //if we didn't set default or filter
        if (this.state.filteredColumns.length === 0){

            var meta = [].concat(this.props.metadataColumns);

            if(meta.indexOf(this.props.childrenColumnName) < 0){
                meta.push(this.props.childrenColumnName);
            }
            result =  _.keys(_.omit(results[0], meta));
        }


        result = _.sortBy(result, function(item){
            var metaItem = _.findWhere(that.props.columnMetadata, {columnName: item});

            if (typeof metaItem === 'undefined' || metaItem === null || isNaN(metaItem.order)){
                return 100;
            }

            return metaItem.order;
        });

        return result;
    },
    setColumns: function(columns){
        columns = _.isArray(columns) ? columns : [columns];
        this.setState({
            filteredColumns: columns
        });
    },
    nextPage: function() {
        currentPage = this.getCurrentPage();
        if (currentPage < this.getCurrentMaxPage() - 1) { this.setPage(currentPage + 1); }
    },
    previousPage: function() {
      currentPage = this.getCurrentPage();
        if (currentPage > 0) { this.setPage(currentPage - 1); }
    },
    changeSort: function(sort){
        if(this.props.useExternal) {
            this.props.externalChangeSort(sort, this.props.externalSortColumn === sort ? !this.props.externalSortAscending : true);

            return;
        }

        var that = this,
            state = {
                page:0,
                sortColumn: sort,
                sortAscending: true
            };

        // If this is the same column, reverse the sort.
        if(this.state.sortColumn == sort){
            state.sortAscending = !this.state.sortAscending;
        }

        this.setState(state);
    },
    componentWillReceiveProps: function(nextProps) {
        this.setMaxPage(nextProps.results);
    },
    getInitialState: function() {
        var state =  {
            maxPage: 0,
            page: 0,
            filteredResults: null,
            filteredColumns: [],
            filter: "",
            sortColumn: this.props.initialSort,
            sortAscending: this.props.initialSortAscending,
            showColumnChooser: false,
            isLoading: false
        };

        return state;
    },
    componentWillMount: function() {
        this.verifyExternal();
        this.verifyCustom();
        this.setMaxPage();
        //don't like the magic strings
        if(this.props.useCustomGridFormat === true){
            this.setState({
                 customFormatType: "grid"
            });
        } else if(this.props.useCustomRowFormat === true){
            this.setState({
                customFormatType: "row"
            });
        }
    },
    //todo: clean these verify methods up
    verifyExternal: function(){
        if(this.props.useExternal === true){
            //hooray for big ugly nested if
            if(this.props.externalSetPage === null){
                console.error("useExternal is set to true but there is no externalSetPage function specified.");
            }

            if(this.props.externalChangeSort === null){
                console.error("useExternal is set to true but there is no externalChangeSort function specified.");
            }

            if(this.props.externalSetFilter === null){
                console.error("useExternal is set to true but there is no externalSetFilter function specified.");
            }

            if(this.props.externalSetPageSize === null){
                console.error("useExternal is set to true but there is no externalSetPageSize function specified.");
            }

            if(this.props.externalMaxPage === null){
                console.error("useExternal is set to true but externalMaxPage is not set.");
            }

            if(this.props.externalCurrentPage === null){
                console.error("useExternal is set to true but externalCurrentPage is not set. Griddle will not page correctly without that property when using external data.");
            }
        }
    },
    verifyCustom: function(){
        if(this.props.useCustomGridFormat === true && this.props.customGridFormat === null){
            console.error("useCustomGridFormat is set to true but no custom component was specified.")
        }
        if (this.props.useCustomRowFormat === true && this.props.customRowFormat === null){
            console.error("useCustomRowFormat is set to true but no custom component was specified.")
        }
        if(this.props.useCustomGridFormat === true && this.props.useCustomRowFormat === true){
            console.error("Cannot currently use both customGridFormat and customRowFormat.");
        }
    },
    getDataForRender: function(data, cols, pageList){
        var that = this;
            //get the correct page size
            if(this.state.sortColumn !== "" || this.props.initialSort !== ""){
                data = _.sortBy(data, function(item){
                    return item[that.state.sortColumn||that.props.initialSort];
                });

                if(this.state.sortAscending === false){
                    data.reverse();
                }
            }

            var currentPage = this.getCurrentPage();

            if (!this.props.useExternal && pageList && (this.props.resultsPerPage * (currentPage+1) <= this.props.resultsPerPage * this.state.maxPage) && (currentPage >= 0)) {
                if (this.isInfiniteScrollEnabled()) {
                  // If we're doing infinite scroll, grab all results up to the current page.
                  data = _.first(data, (currentPage + 1) * this.props.resultsPerPage);
                } else {
                  //the 'rest' is grabbing the whole array from index on and the 'initial' is getting the first n results
                  var rest = _.rest(data, currentPage * this.props.resultsPerPage);
                  data = _.initial(rest, rest.length-this.props.resultsPerPage);
                }
            }
        var meta = [].concat(this.props.metadataColumns);
        if (meta.indexOf(this.props.childrenColumnName) < 0){
            meta.push(this.props.childrenColumnName);
        }

        var transformedData = [];

        for(var i = 0; i<data.length; i++){
            var mappedData = _.pick(data[i], cols.concat(meta));

            if(typeof mappedData[that.props.childrenColumnName] !== "undefined" && mappedData[that.props.childrenColumnName].length > 0){
                //internally we're going to use children instead of whatever it is so we don't have to pass the custom name around
                mappedData["children"] = that.getDataForRender(mappedData[that.props.childrenColumnName], cols, false);

                if(that.props.childrenColumnName !== "children") { delete mappedData[that.props.childrenColumnName]; }
            }

            transformedData.push(mappedData);
        }

        return transformedData;
    },
    //this is the current results
    getCurrentResults: function(){
      return this.state.filteredResults || this.props.results;
    },
    getCurrentPage: function(){
      return this.props.externalCurrentPage||this.state.page;
    },
    getCurrentSort: function(){
        return this.props.useExternal ? this.props.externalSortColumn : this.state.sortColumn;
    },
    getCurrentSortAscending: function(){
        return this.props.useExternal ? this.props.externalSortAscending : this.state.sortAscending;
    },
    getCurrentMaxPage: function(){
        return this.props.useExternal ? this.props.externalMaxPage : this.state.maxPage;
    },
    isInfiniteScrollEnabled: function(){
      // If a custom pager is included, don't allow for infinite scrolling.
      if (this.props.useCustomPager) {
        return false;
      }

      // Otherwise, send back the property.
      return this.props.infiniteScroll;
    },
    render: function() {
        var that = this,
            results = this.getCurrentResults();  // Attempt to assign to the filtered results, if we have any.

        var headerTableClassName = this.props.tableClassName + " table-header";

        //figure out if we want to show the filter section
        var filter = (this.props.showFilter && this.props.useCustomGridFormat === false) ? <GridFilter changeFilter={this.setFilter} placeholderText={this.props.filterPlaceholderText} /> : "";
        var settings = this.props.showSettings ? <span className="settings" onClick={this.toggleColumnChooser}>{this.props.settingsText} <i className="glyphicon glyphicon-cog"></i></span> : "";

        //if we have neither filter or settings don't need to render this stuff
        var topSection = "";
        if (this.props.showFilter || this.props.showSettings){
           topSection = (
            <div className="row top-section">
                <div className="col-xs-6">
                   {filter}
                </div>
                <div className="col-xs-6 right">
                    {settings}
                </div>
            </div>);
        }

        var resultContent = "";
        var pagingContent = "";
        var keys = [];
        var cols = this.getColumns();

        // If we're not loading results, fill the table with legitimate data.
        if (!this.state.isLoading) {
            //figure out which columns are displayed and show only those
            var data = this.getDataForRender(results, cols, true);

            //don't repeat this -- it's happening in getColumns and getDataForRender too...
            var meta = this.props.metadataColumns;
            if(meta.indexOf(this.props.childrenColumnName) < 0){
                meta.push(this.props.childrenColumnName);
            }

            // Grab the column keys from the first results
            keys = _.keys(_.omit(results[0], meta));

            // Grab the current and max page values.
            var currentPage = this.getCurrentPage();
            var maxPage = this.getCurrentMaxPage();

            // Determine if we need to enable infinite scrolling on the table.
            var hasMorePages = (currentPage + 1) < maxPage;

            //clean this stuff up so it's not if else all over the place. ugly if
            if(this.props.useCustomGridFormat && this.props.customGridFormat !== null){
                //this should send all the results it has
                resultContent = <this.props.customGridFormat data={this.props.results} className={this.props.customGridFormatClassName} />
            } else if(this.props.useCustomRowFormat){
                resultContent = <CustomRowFormatContainer data={data} columns={cols} metadataColumns={meta} className={this.props.customRowFormatClassName} customFormat={this.props.customRowFormat}/>
            } else {
                resultContent = <GridTable columnMetadata={this.props.columnMetadata} data={data} columns={cols} metadataColumns={meta} className={this.props.tableClassName} infiniteScroll={this.isInfiniteScrollEnabled()} nextPage={this.nextPage} changeSort={this.changeSort} sortColumn={this.getCurrentSort()} sortAscending={this.getCurrentSortAscending()} showTableHeading={this.props.showTableHeading} useFixedHeader={this.props.useFixedHeader} bodyHeight={this.props.bodyHeight} infiniteScroll={this.isInfiniteScrollEnabled()} infiniteScrollSpacerHeight={this.props.infiniteScrollSpacerHeight} hasMorePages={hasMorePages} isLoading={this.state.isLoading} selectRow={this.props.selectRow}/>
            }

            // Grab the paging content if it's to be displayed
            if (this.props.showPager && !this.isInfiniteScrollEnabled() && !this.props.useCustomGridFormat) {
                pagingContent = (
                  <div className="grid-footer clearfix">
                      {this.props.useCustomPager ?
                          <CustomPaginationContainer next={this.nextPage} previous={this.previousPage} currentPage={currentPage} maxPage={maxPage} setPage={this.setPage} nextText={this.props.nextText} previousText={this.props.previousText} customPager={this.props.customPager}/> :
                          <GridPagination next={this.nextPage} previous={this.previousPage} currentPage={currentPage} maxPage={maxPage} setPage={this.setPage} nextText={this.props.nextText} previousText={this.props.previousText}/>
                      }
                  </div>
              );
            }
        } else {
            // Otherwise, display the loading content.
            resultContent = (<div className="loading img-responsive center-block"></div>);
        }

        var columnSelector = this.state.showColumnChooser ? (
            <div className="row">
                <div className="col-md-12">
                    <GridSettings columns={keys} selectedColumns={cols} setColumns={this.setColumns} settingsText={this.props.settingsText} maxRowsText={this.props.maxRowsText} setPageSize={this.setPageSize} showSetPageSize={!this.props.useCustomGridFormat} resultsPerPage={this.props.resultsPerPage} allowToggleCustom={this.props.allowToggleCustom} toggleCustomFormat={this.toggleCustomFormat} useCustomFormat={this.props.useCustomRowFormat || this.props.useCustomGridFormat} enableCustomFormatText={this.props.enableCustomFormatText} columnMetadata={this.props.columnMetadata} />
                </div>
            </div>
        ) : "";

        var gridClassName = this.props.gridClassName.length > 0 ? "griddle " + this.props.gridClassName : "griddle";
        //add custom to the class name so we can style it differently
        gridClassName += this.props.useCustomRowFormat ? " griddle-custom" : "";


        //todo: refactor this since it's basically the same now with a diff class
        var gridTable = this.props.useCustomFormat ?
            <div>{resultContent}</div>
            :       (<div className="grid-body">
                        {resultContent}
                        </div>);

        if (typeof results === 'undefined' || results.length === 0) {
            var myReturn = null;
            if (this.props.customNoData != null) {
                myReturn = (<div className={gridClassName}><this.props.customNoData /></div>);

                return myReturn
            }

            myReturn = (<div className={gridClassName}>
                    {topSection}
                    <GridNoData noDataMessage={this.props.noDataMessage} />
                </div>);
            return myReturn;

        }

        return (
            <div className={gridClassName}>
                {topSection}
                {columnSelector}
                <div className="grid-container panel">
                    {gridTable}
                    {pagingContent}
                </div>
            </div>
        );

    }
});

module.exports = Griddle;
