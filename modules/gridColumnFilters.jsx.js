"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var React = require("react");

var GridColumnFilters = React.createClass({
    displayName: "GridColumnFilters",
    getDefaultProps: function getDefaultProps() {
        return {
            columnFilters: {},
            columnFiltersClassName: ""
        };
    },

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        return this.props.columnSettings !== nextProps.columnSettings || this.props.columnFilters !== nextProps.columnFilters || this.props.columnFiltersClassName !== nextProps.columnFiltersClassName;
    },

    render: function render() {
        var _this = this;
        var inputStyle = {
            width: "100%"
        };
        var columnFiltersClassName = this.props.columnFiltersClassName;


        return React.createElement(
            "thead",
            null,
            React.createElement(
                "tr",
                null,
                this.props.columnSettings.getColumns().map(function (x) {
                    var meta = _this.props.columnSettings.getColumnMetadataByName(x);

                    var thClassName = meta.cssClassName ? meta.cssClassName : "";
                    var thStyle = {};
                    if (meta.width) {
                        thStyle.width = meta.width;
                    }
                    return React.createElement(
                        "th",
                        { key: meta.columnName, className: thClassName, style: thStyle },
                        meta.filterable !== false ? React.createElement("input", { type: "text",
                            name: meta.columnName,
                            value: _this.props.columnFilters[meta.columnName],
                            className: "griddle-column-filters " + columnFiltersClassName,
                            style: inputStyle,
                            onChange: _this.filter }) : React.createElement("input", { type: "text",
                            name: meta.columnName,
                            className: "griddle-column-filters-readonly " + columnFiltersClassName,
                            style: inputStyle,
                            readOnly: true })
                    );
                }),
                this.props.useFixedHeader && React.createElement("th", { key: "__fixed_th__", className: "griddle-fixed-th" })
            )
        );
    },

    filter: function filter(e) {
        var columnName = e.target.name;
        var filterWord = e.target.value;

        var updatedColumnFilters = _.extend({}, this.props.columnFilters, _defineProperty({}, columnName, filterWord));
        this.props.handleFilter(updatedColumnFilters);
    }
});

module.exports = GridColumnFilters;