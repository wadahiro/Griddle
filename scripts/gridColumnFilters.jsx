var React = require('react');

var GridColumnFilters = React.createClass({
    getDefaultProps() {
        return {
            columnFilters: {},
            columnFiltersClassName: ''
        };
    },
    
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.columnSettings !== nextProps.columnSettings ||
            this.props.columnFilters !== nextProps.columnFilters ||
            this.props.columnFiltersClassName !== nextProps.columnFiltersClassName;
    },
    
    render() {
        const inputStyle = {
            width: '100%'
        };
        const { columnFiltersClassName } = this.props;
        
        return (
            <thead>
                <tr>
                    {this.props.columnSettings.getColumns().map(x => {
                        const meta = this.props.columnSettings.getColumnMetadataByName(x);
                        
                        const thClassName = meta.cssClassName ? meta.cssClassName : '';
                        const thStyle = {};
                        if (meta.width) {
                            thStyle.width = meta.width;
                        }
                        return (
                            <th key={meta.columnName} className={thClassName} style={thStyle}>
                                {meta.filterable !== false ?
                                    <input type='text'
                                        name={meta.columnName}
                                        value={this.props.columnFilters[meta.columnName]}
                                        className={`griddle-column-filters ${columnFiltersClassName}`}
                                        style={inputStyle}
                                        onChange={this.filter} />
                                    :
                                    <input type='text'
                                        name={meta.columnName}
                                        className={`griddle-column-filters-readonly ${columnFiltersClassName}`}
                                        style={inputStyle}
                                        readOnly={true} />
                                }
                            </th>
                        );
                    })}
                    {this.props.useFixedHeader &&
                        <th key='__fixed_th__' className='griddle-fixed-th'></th>
                    }
                  </tr>
            </thead>
        );
    },
    
    filter(e) {
        const columnName = e.target.name;
        const filterWord = e.target.value;
        
        var updatedColumnFilters = _.extend({}, this.props.columnFilters, {
            [columnName]: filterWord
        });
        this.props.handleFilter(updatedColumnFilters);
    }
});

module.exports = GridColumnFilters;