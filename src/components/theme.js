import React from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';

import Toolbar from './toolbar';
import LeftNavi from './leftNavi';

const Theme = (props) => {
    const onDoubleClick = (e) => {
        if (e.target !== document.getElementById('toolbar')) {
            return;
        }

        const window = remote.getCurrentWindow();
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    };

    const {
        page,
        children,
        onClickTrash,
        onClickNotes,
        onClickSetting
    } = props;

    return (
        <div id="editor">
            <div id="toolbar" style={{ WebkitAppRegion: 'drag' }} onDoubleClick={e => onDoubleClick(e)}>
                <Toolbar />
            </div>
            <div id="left-navi">
                <LeftNavi
                    onClickTrash={onClickTrash}
                    onClickNotes={onClickNotes}
                    onClickSetting={onClickSetting}
                />
            </div>
            <div id="main">
                <div id="sitemap">{page}</div>
                {children}
            </div>
        </div>
    );
};

export default Theme;

Theme.propTypes = {
    page: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ]).isRequired,
    onClickTrash: PropTypes.func.isRequired,
    onClickNotes: PropTypes.func.isRequired,
    onClickSetting: PropTypes.func.isRequired,
};
