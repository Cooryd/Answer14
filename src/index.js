import React from 'react';
import ReactDOM from 'react-dom';
import apiJson from './api.json';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            label: null,
            rows: [],
            fetching: false,
            showStock: true
        };
    }

    mockApiFetch = () => {
        return new Promise((resolve, reject) => {
            //mock AJAX call response time
            setTimeout(resolve, 500, apiJson);
        });
    }

    componentDidMount() {
        this.setState({fetching: true});
        this.mockApiFetch()
            .then(response => this.setState({
                label: response.label, 
                rows: response.row, 
                fetching: false
            }));
    }

    generateRow = (displayRowLevel, rowLevel, levelRowSpan, displayLocationName, locationName, locationRowSpan, stock, stockIndex) => {
        return (
            <tr key={`${rowLevel}-${locationName}-${stockIndex}`}>
                {
                    displayRowLevel &&
                        <td rowSpan={levelRowSpan}>{ rowLevel }</td>
                }
                {
                    displayLocationName &&
                    <td rowSpan={locationRowSpan}>{ locationName }</td>
                }
                {
                    stock &&
                        <React.Fragment>
                                <td>{ stock.product }</td>
                                <td>{ stock.qty }</td>
                                <td>{ stock.replenishment }</td>
                        </React.Fragment>
                }
            </tr>
        );
    }

    calculateLevelCellHeight = (row) => {
        let levelRowSpan = 0;
        row.locations.forEach(location => {
            if (this.state.showStock && location.stock.length) {
                levelRowSpan += location.stock.length
            } else {
                levelRowSpan++;
            }
        });

        return levelRowSpan;
    }

    createRowsFromStock = (location, row,levelCellHeight, locationIndex) => {
        return location.stock.map((stockItem, itemIndex)=>{
            return this.generateRow (
                locationIndex === 0 && itemIndex === 0, 
                row.level, 
                levelCellHeight, 
                itemIndex === 0, 
                location.name, 
                location.stock.length, 
                stockItem,
                itemIndex
            );
        });
    }

    createRowsFromLocations = (row, levelCellHeight) => {
        return row.locations.map((location, locationIndex) => {
            if (this.state.showStock && location.stock.length) {
               return this.createRowsFromStock(location, row, levelCellHeight, locationIndex)
            }
            return this.generateRow(locationIndex === 0, row.level, levelCellHeight, true, location.name);
        });
    }

    createTableRows = () => {
        const { rows = [] }  = this.state;

        return rows.map(row => {
            if (row.locations.length) {
                const levelCellHeight = this.calculateLevelCellHeight(row);
                return this.createRowsFromLocations(row, levelCellHeight);
            } 

            return this.generateRow(true, row.level);
        })
    }

    renderTable = () => {
        const { rows = [] } = this.state;
        return (
            <table>
                <thead>
                    <tr>
                        <th rowSpan={this.state.showStock ? '3' : undefined}>Level</th>
                        <th colSpan={this.state.showStock ? '5' : undefined}>Location</th>
                    </tr>
                    {
                            this.state.showStock &&
                            <React.Fragment>
                                <tr>
                                    <th rowSpan="2">Name</th>
                                    <th colSpan="3">Stock</th>
                                </tr>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Replenishment</th>
                                </tr>
                            </React.Fragment>
                    }
                </thead>
                <tbody>
                    {
                        this.createTableRows()
                    }
                </tbody>
            </table>
        );
    }

    render() {
        if (this.state.fetching) {
            return <div>Loading....</div>
        }

        return (
            <div>
                { 
                    this.state.label &&
                    <h1>{ this.state.label }</h1>
                }
                {
                    this.renderTable()
                }
                <div>
                    Toggle stock view: <input type="checkbox" checked={this.state.showStock} onChange={(e) => this.setState({ showStock: e.target.checked})}/>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);