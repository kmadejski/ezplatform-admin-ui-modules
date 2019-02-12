import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

import TableViewItemComponent from './table.view.item.component';
import Icon from '../../../common/icon/icon';

const KEY_CONTENT_NAME = 'ContentName';
const KEY_DATE_MODIFIED = 'DateModified';
const KEY_LOCATION_PRIORITY = 'LocationPriority';
const SORTKEY_MAP = {
    [KEY_CONTENT_NAME]: 'name',
    [KEY_DATE_MODIFIED]: 'date',
    [KEY_LOCATION_PRIORITY]: 'priority',
};

export default class TableViewComponent extends Component {
    constructor(props) {
        super(props);

        this.sortByName = this.sortByName.bind(this);
        this.sortByDate = this.sortByDate.bind(this);
        this.sortByPriority = this.sortByPriority.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.toggleColumnsToggler = this.toggleColumnsToggler.bind(this);
        this.handleColumnsTogglerClose = this.handleColumnsTogglerClose.bind(this);

        this._refColumnsTogglerButton = createRef();

        this.headerLabelsMap = {
            name: Translator.trans(/*@Desc("Name")*/ 'items_table.header.name', {}, 'sub_items'),
            modified: Translator.trans(/*@Desc("Modified")*/ 'items_table.header.modified', {}, 'sub_items'),
            contentType: Translator.trans(/*@Desc("Content type")*/ 'items_table.header.content_type', {}, 'sub_items'),
            priority: Translator.trans(/*@Desc("Priority")*/ 'items_table.header.priority', {}, 'sub_items'),
            translations: Translator.trans(/*@Desc("Translations")*/ 'items_table.header.translations', {}, 'sub_items'),
        };

        this.state = {
            isColumnsTogglerOpen: false,
            columnsVisibility: { // TODO: save in localStorage?
                modified: true,
                contentType: true,
                priority: true,
                translations: true,
            },
        };
    }

    componentDidMount() {
        document.addEventListener('click', this.handleColumnsTogglerClose, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleColumnsTogglerClose);
    }

    handleColumnsTogglerClose({ target }) {
        if (!this.state.isColumnsTogglerOpen) {
            return;
        }

        const isClickInsideColumnsToggler = target.closest('.c-table-view__columns-toggler-panel');
        const isClickOnColumnsTogglerBtn = target.closest('.c-table-view__columns-toggler-btn');

        if (!isClickInsideColumnsToggler && !isClickOnColumnsTogglerBtn) {
            this.setState(() => ({
                isColumnsTogglerOpen: false,
            }));
        }
    }

    /**
     * Changes sort to name
     */
    sortByName() {
        const { onSortChange } = this.props;

        onSortChange(KEY_CONTENT_NAME);
    }

    /**
     * Changes sort to modification date
     */
    sortByDate() {
        const { onSortChange } = this.props;

        onSortChange(KEY_DATE_MODIFIED);
    }

    /**
     * Changes sort to priority
     */
    sortByPriority() {
        const { onSortChange } = this.props;

        onSortChange(KEY_LOCATION_PRIORITY);
    }

    /**
     * Selects all visible items
     *
     * @param {Event} event
     */
    selectAll(event) {
        const { toggleAllItemsSelect } = this.props;
        const isSelectAction = event.target.checked;

        toggleAllItemsSelect(isSelectAction);
    }

    toggleColumnVisibility(column) {
        this.setState((state) => ({
            columnsVisibility: {
                ...state.columnsVisibility,
                [column]: !state.columnsVisibility[column],
            },
        }));
    }

    toggleColumnsToggler() {
        this.setState((state) => ({
            isColumnsTogglerOpen: !state.isColumnsTogglerOpen,
        }));
    }

    /**
     * Renders single list item
     *
     * @method renderItem
     * @param {Object} data
     * @returns {JSX.Element}
     * @memberof TableViewComponent
     */
    renderItem(data) {
        const { columnsVisibility } = this.state;
        const {
            contentTypesMap,
            handleItemPriorityUpdate,
            handleEditItem,
            generateLink,
            languages,
            onItemSelect,
            selectedLocationsIds,
        } = this.props;
        const isSelected = selectedLocationsIds.has(data.location.id);

        return (
            <TableViewItemComponent
                key={data.location.id}
                {...data}
                contentTypesMap={contentTypesMap}
                onItemPriorityUpdate={handleItemPriorityUpdate}
                languages={languages}
                handleEditItem={handleEditItem}
                generateLink={generateLink}
                onItemSelect={onItemSelect}
                isSelected={isSelected}
                columnsVisibility={columnsVisibility}
            />
        );
    }

    renderColumnsToggler() {
        const { isColumnsTogglerOpen } = this.state;

        if (!isColumnsTogglerOpen) {
            return null;
        }

        const { columnsVisibility } = this.state;

        return (
            <div className="c-table-view__columns-toggler-panel">
                <ul className="c-table-view__columns-toggler-list">
                    {Object.keys(columnsVisibility).map((columnKey) => {
                        const isColumnVisible = columnsVisibility[columnKey];
                        const label = this.headerLabelsMap[columnKey];

                        return (
                            <li
                                key={columnKey}
                                className="c-table-view__columns-toggler-option"
                                onClick={this.toggleColumnVisibility.bind(this, columnKey)}>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="checkbox" checked={isColumnVisible} />
                                    <label className="c-table-view__columns-toggler-option-label form-check-label">{label}</label>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    /**
     * Renders table's head
     *
     * @method renderHead
     * @returns {JSX.Element|null}
     * @memberof GridViewComponent
     */
    renderHead() {
        const cellClass = 'c-table-view__cell';
        const cellHeadClass = `${cellClass} ${cellClass}--head`;
        const cellSortClass = `${cellClass}--sortable`;
        const { items } = this.props;
        let headClass = 'c-table-view__head';

        if (!items.length) {
            return null;
        }

        const { sortClause, sortOrder } = this.props;

        if (sortClause) {
            const headSortOrderClass = sortOrder === 'ascending' ? `${headClass}--sort-asc` : `${headClass}--sort-desc`;
            const headSortByClass = `${headClass}--sort-by-${SORTKEY_MAP[sortClause]}`;

            headClass = `${headClass} ${headSortOrderClass} ${headSortByClass}`;
        }

        const { selectedLocationsIds } = this.props;
        const { columnsVisibility } = this.state;
        const anyLocationSelected = !!selectedLocationsIds.size;

        return (
            <thead className={headClass}>
                <tr className="c-table-view__row">
                    <th className={`${cellHeadClass} ${cellClass}--checkbox`}>
                        <input type="checkbox" checked={anyLocationSelected} onChange={this.selectAll} />
                    </th>
                    <th className={cellHeadClass} />
                    <th className={`${cellHeadClass} ${cellClass}--name ${cellSortClass}`} onClick={this.sortByName} tabIndex="-1">
                        <span className="c-table-view__label">{this.headerLabelsMap.name}</span>
                    </th>
                    {columnsVisibility.modified && (
                        <th className={`${cellHeadClass} ${cellClass}--date ${cellSortClass}`} onClick={this.sortByDate} tabIndex="-1">
                            <span className="c-table-view__label">{this.headerLabelsMap.modified}</span>
                        </th>
                    )}
                    {columnsVisibility.contentType && (
                        <th className={cellHeadClass}>
                            <span className="c-table-view__label">{this.headerLabelsMap.contentType}</span>
                        </th>
                    )}
                    {columnsVisibility.priority && (
                        <th
                            className={`${cellHeadClass} ${cellClass}--priority ${cellSortClass}`}
                            onClick={this.sortByPriority}
                            tabIndex="-1">
                            <span className="c-table-view__label">{this.headerLabelsMap.priority}</span>
                        </th>
                    )}
                    {columnsVisibility.translations && (
                        <th className={`${cellHeadClass} ${cellClass}--priority ${cellSortClass}`}>
                            <span className="c-table-view__label">{this.headerLabelsMap.translations}</span>
                        </th>
                    )}
                    <th className={`${cellHeadClass} ${cellClass}--actions`}>
                        <div className="c-table-view__columns-toggler">
                            <button
                                ref={this._refColumnsTogglerButton}
                                type="button"
                                className="btn btn-dark c-table-view__columns-toggler-btn"
                                onClick={this.toggleColumnsToggler}>
                                <Icon name="filters" extraClasses="ez-icon--small ez-icon--light" />
                            </button>
                            {this.renderColumnsToggler()}
                        </div>
                    </th>
                </tr>
            </thead>
        );
    }

    render() {
        const { items } = this.props;
        const content = items.map(this.renderItem);

        return (
            <div className="c-table-view__wrapper">
                <div className="c-table-view__scroller">
                    <table className="c-table-view">
                        {this.renderHead()}
                        <tbody className="c-table-view__body">{content}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

TableViewComponent.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    contentTypesMap: PropTypes.object.isRequired,
    handleItemPriorityUpdate: PropTypes.func.isRequired,
    generateLink: PropTypes.func.isRequired,
    handleEditItem: PropTypes.func.isRequired,
    languages: PropTypes.object.isRequired,
    onItemSelect: PropTypes.func.isRequired,
    toggleAllItemsSelect: PropTypes.func.isRequired,
    selectedLocationsIds: PropTypes.instanceOf(Set),
    onSortChange: PropTypes.func.isRequired,
    sortClause: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
};
