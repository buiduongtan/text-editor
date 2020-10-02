import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import path from 'path';

import File from '../../_util/file';

const noteDirAbsolute = path.normalize(`${__dirname}/../../note`);

class TextArea extends React.Component {
    static placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection !== 'undefined'
            && typeof document.createRange !== 'undefined') {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange !== 'undefined') {
            const textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    static displayFileContent(content) {
        const container = document.getElementById('container');
        // remove all <br> from content
        const text = content === '' ? '<div><br></div>' : content.toString().replace(new RegExp('/(<br>)(?!<div>)/g'), '');
        container.innerHTML = text;
        TextArea.placeCaretAtEnd(container);
    }

    static getInputedContent() {
        if (document.getElementById('container').textContent === '') {
            return '<div><br></div>';
        }
        return document.getElementById('container').innerHTML;
    }

    static fullSize() {
        const textArea = document.getElementById('text-area');
        textArea.style = `
        position: absolute;
        height: inherit;
        border-radius: 1% 1% 0 0;
        border: 1px solid black;
        `;
        const button = document.getElementById('close-btn');
        button.classList.toggle('glyphicon-chevron-down');
        button.classList.toggle('glyphicon-chevron-up');
        const container = document.getElementById('container');
        TextArea.placeCaretAtEnd(container);
    }

    static normalSize() {
        const textArea = document.getElementById('text-area');
        textArea.style = `
        position: '';
        height: '';
        width: '';
        border-radius: '';
        border: '';
        `;
        const button = document.getElementById('close-btn');
        button.classList.toggle('glyphicon-chevron-up');
        button.classList.toggle('glyphicon-chevron-down');
        const container = document.getElementById('container');
        TextArea.placeCaretAtEnd(container);
    }

    constructor(props) {
        super(props);

        this.onContainerChange = this.onContainerChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onExpandButtonClick = this.onExpandButtonClick.bind(this);
    }

    componentDidMount() {
        // const container =     document.getElementById('container');
        // container.addEventListener('input', this.onInput, false);

        // display content: main
        const { fileName } = this.props;
        let { dir } = this.props;
        dir = dir !== '' ? dir : noteDirAbsolute;
        const content = File.getFileContent(fileName, dir);
        TextArea.displayFileContent(content);
    }

    componentWillReceiveProps(nextProps) {
        const { fileName, isFullSize } = this.props;

        if (isFullSize !== nextProps.isFullSize) {
            if (nextProps.isFullSize) {
                TextArea.fullSize();
            } else {
                TextArea.normalSize();
            }
        }

        // Reload text when create new file
        // or display file from trash empty to notes or open other file if new file is open but not saved
        // or open other file
        if (((fileName && !nextProps.fileName)
            || (!fileName && nextProps.fileName)
            || (fileName && nextProps.fileName && fileName !== nextProps.fileName))) {
            const newFileName = nextProps.fileName;
            const container = document.getElementById('container');
            const newDir = nextProps.dir !== '' ? nextProps.dir : noteDirAbsolute;
            const content = File.getFileContent(newFileName, newDir);

            if (newDir !== noteDirAbsolute) {
                container.removeAttribute('contentEditable');
            } else {
                container.setAttribute('contentEditable', 'true');
            }

            TextArea.displayFileContent(content);
        }
    }

    // if content file is blank (file is not exist or content is blank), return
    // if content has no change => return
    onInput() {
        // const selection = window.getSelection();
        // const range = selection.getRangeAt(0);
        // const pointedElement = range.startContainer.parentElement;
        // console.log(pointedElement);
        // console.log(pointedElement.tagName);
        // console.log(pointedElement.tagName !== 'DIV');
        // if (pointedElement.id === 'container' || pointedElement.tagName !== 'DIV') {
        //     document.execCommand('formatBlock', false, '<div>');
        //         // because execCommand will change the text content (adding div)
        //         // so to avoid to run 2 times onkeydown, return
        //         // return;
        // }

        // if file is empty, input new div br div
        if (document.getElementById('container').innerHTML === ''
            || (document.getElementById('container').textContent === ''
                && !RegExp('<div>(.*)</div>').test(document.getElementById('container').innerHTML))
        ) {
            document.execCommand('insertHtml', false, '<div><br></div>');
            return;
        }
        const { fileName, dir } = this.props;
        if (dir !== noteDirAbsolute) {
            return;
        }
        if (!fileName) {
            this.onContainerChange();
            return;
        }
        const previouscontent = File.getFileContent(fileName, dir).toString('utf8');
        const currentContent = document.getElementById('container').textContent;
        if (previouscontent !== currentContent) {
            this.onContainerChange();
        }
    }

    onContainerChange() {
        const { fileName, onUpdateText } = this.props;
        File.writeFile(fileName, File.revertEscapeHtml(TextArea.getInputedContent()), onUpdateText);
    }

    onExpandButtonClick() {
        const { isFullSize, onMinimizeClick, onMaximizeClick } = this.props;
        if (isFullSize) {
            onMinimizeClick();
        } else {
            onMaximizeClick();
        }
    }

    render() {
        const { fileName, dir } = this.props;
        let time;
        if (fileName) {
            time = moment(File.getFileStat(fileName, dir).mtime).format('MMMM Do, YYYY HH:mm');
        } else {
            time = moment().format('MMMM Do, YYYY HH:mm');
        }
        return (
            <div id="text-area">
                <div id="date-time">{time}</div>
                {/* tabIndex to make container focusable even if contentEditable is false */}
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <div id="container" contentEditable="true" tabIndex="0" onInput={this.onInput} />
                <button
                    type="button"
                    id="close-btn"
                    className="btn btn-dark glyphicon glyphicon-chevron-up"
                    contentEditable="false"
                    onClick={this.onExpandButtonClick}
                />
            </div>
        );
    }
}

export default TextArea;

TextArea.propTypes = {
    fileName: PropTypes.string,
    dir: PropTypes.string,
    onUpdateText: PropTypes.func,
    isFullSize: PropTypes.bool,
    onMinimizeClick: PropTypes.func,
    onMaximizeClick: PropTypes.func
};
TextArea.defaultProps = {
    fileName: PropTypes.string,
    dir: PropTypes.string,
    onUpdateText: PropTypes.func,
    isFullSize: PropTypes.bool,
    onMinimizeClick: PropTypes.func,
    onMaximizeClick: PropTypes.func
};
