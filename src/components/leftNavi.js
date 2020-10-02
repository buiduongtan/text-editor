import React from 'react';
import PropTypes from 'prop-types';

import { leftNaviState } from '../_conf/state.json';

class LeftNavi extends React.Component {
    static collapse(el, ma, button, width, sf) {
        const element = el;
        const main = ma;
        const searchField = sf;
        // const appDescription = ad;
        element.style.maxWidth = width;
        main.style.width = `calc(100% - ${width})`;
        button.classList.remove('glyphicon-chevron-left');
        button.classList.add('glyphicon-chevron-right');
        searchField.style.display = 'none';
        // appDescription.style.display = 'none';

        const menuLink = document.getElementsByClassName('menu-link')[0];
        for (let i = 0; i < menuLink.children.length; i += 1) {
            const child = menuLink.children[i].firstChild;
            child.style.display = 'none';
        }
        menuLink.className = 'menu-btn';
    }

    static expand(el, ma, button, width, sf) {
        const element = el;
        const main = ma;
        const searchField = sf;
        // const appDescription = ad;
        element.style.maxWidth = width;
        main.style.width = `calc(100% - ${width})`;
        button.classList.remove('glyphicon-chevron-right');
        button.classList.add('glyphicon-chevron-left');
        searchField.style.display = null;
        // appDescription.style.display = null;

        const menuButton = document.getElementsByClassName('menu-btn')[0];
        for (let i = 0; i < menuButton.children.length; i += 1) {
            const child = menuButton.children[i].firstChild;
            child.style.display = null;
        }
        menuButton.className = 'menu-link';
    }

    static collapseSection() {
        const minWidth = '55px';
        const maxWidth = '150px';
        const element = document.getElementById('navi-content');
        const main = document.getElementById('main');
        const button = document.getElementById('collapse-btn');
        const searchField = document.getElementById('search-field');
        // const appDescription = document.getElementById('app-description').firstChild;
        if (element.style.maxWidth !== minWidth) {
            LeftNavi.collapse(element, main, button, minWidth, searchField);
        } else {
            LeftNavi.expand(element, main, button, maxWidth, searchField);
        }
    }

    static focusOnButtonClick(e, callback) {
        const list = e.target.parentNode.childNodes;
        list.forEach(element => {
            if (element === e.target) {
                e.target.classList.remove('btn-custom-init');
                e.target.classList.add('btn-custom-onclick');
            } else {
                element.classList.remove('btn-custom-onclick');
                element.classList.add('btn-custom-init');
            }
        });
        callback();
    }

    componentDidMount() {
        if (leftNaviState.isCollapsed) {
            const minWidth = '55px';
            const element = document.getElementById('navi-content');
            const main = document.getElementById('main');
            const button = document.getElementById('collapse-btn');
            const searchField = document.getElementById('search-field');
            // const appDescription = document.getElementById('app-description').firstChild;
            LeftNavi.collapse(element, main, button, minWidth, searchField);
        }
    }

    render() {
        const { onClickNotes, onClickTrash, onClickSetting } = this.props;
        return (
            <div id="navi-content">
                {/* <div id="app-description">
                    <div className="text">&nbsp;This is left app-description</div>
                </div> */}
                <div>
                    <br />
                </div>
                <div id="search-field">
                    <input type="text" placeholder="Search for file" />
                </div>
                <div className="menu-link">
                    <button
                        type="button"
                        className="btn-custom btn-custom-onclick glyphicon glyphicon-home"
                        onClick={e => LeftNavi.focusOnButtonClick(e, onClickNotes)}
                    >
                        <span>&nbsp;Notes</span>
                    </button>
                    <button
                        type="button"
                        className="btn-custom btn-custom-init glyphicon glyphicon-stats"
                    >
                        <span>&nbsp;Progress</span>
                    </button>
                    <button
                        type="button"
                        className="btn-custom btn-custom-init glyphicon glyphicon-hourglass"
                    >
                        <span>&nbsp;History</span>
                    </button>
                    <button
                        type="button"
                        className="btn-custom btn-custom-init glyphicon glyphicon-option-horizontal"
                    >
                        <span>&nbsp;Options</span>
                    </button>
                    <button
                        type="button"
                        className="btn-custom btn-custom-init glyphicon glyphicon-trash"
                        onClick={e => LeftNavi.focusOnButtonClick(e, onClickTrash)}
                    >
                        <span>&nbsp;Trash</span>
                    </button>
                    <button
                        type="button"
                        className="btn-custom btn-custom-init glyphicon glyphicon-cog"
                        onClick={e => LeftNavi.focusOnButtonClick(e, onClickSetting)}
                    >
                        <span>&nbsp;Setting</span>
                    </button>
                </div>
                <div id="collapse">
                    <button
                        type="button"
                        id="collapse-btn"
                        className="btn-custom btn-custom-init glyphicon glyphicon-chevron-left"
                        onClick={LeftNavi.collapseSection}
                    />
                </div>
            </div>
        );
    }
}

export default LeftNavi;

LeftNavi.propTypes = {
    onClickNotes: PropTypes.func.isRequired,
    onClickTrash: PropTypes.func.isRequired,
    onClickSetting: PropTypes.func.isRequired
};
