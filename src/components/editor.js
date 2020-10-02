import React from 'react';
import path from 'path';

import Setting from './setting/setting';
import Theme from './theme';
import TextEditor from './note/textEditor';

const Page = {
    NOTE: 'Notes',
    TRASH: 'Trash',
    SETTING: 'Setting'
};

const noteDirAbsolute = path.normalize(`${__dirname}/../../note`);
const oldNoteDirAbsolute = path.normalize(`${__dirname}/../../old_note`);

class Editor extends React.Component {
    static insertHTML(text) {
        const sel = window.getSelection();
        let range;
        if (window.getSelection && sel.rangeCount) {
            range = sel.getRangeAt(0).startContainer;
            sel.deleteFromDocument();
            // range.collapse(true);
            let div;
            const smt = document.createRange();
            smt.selectNode(range);
            text.forEach(element => {
                div = document.createElement('div');
                div.textContent = element;
                // smt.insertNode(div);
            });

            // Move the caret immediately after the inserted span
            // range.setStartAfter(div);
            // range.collapse(true);
            // sel.removeAllRanges();
            // sel.addRange(range);
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            dir: path.normalize(noteDirAbsolute),
            page: Page.NOTE
        };

        this.onClickTrash = this.onClickTrash.bind(this);
        this.onClickNotes = this.onClickNotes.bind(this);
        this.onClickSetting = this.onClickSetting.bind(this);
    }

    componentDidMount() {
        const editor = document.getElementById('editor');
        editor.addEventListener('paste', (e) => {
            // cancel paste
            e.preventDefault();
            // get text representation of clipboard
            let text = (e.originalEvent || e).clipboardData.getData('text/plain');
            text = text.split('\n');
            // let input = '';
            text.forEach((element, index) => {
                // input += `<div>${element}</div>`;
                document.execCommand('insertText', false, element);
                if (index !== text.length - 1) {
                    document.execCommand('insertHTML', false, '<br>');
                }
                document.execCommand('formatBlock', false, '<div>');
            });
            // Editor.insertHTML(text);
        });
    }

    onClickNotes() {
        this.setState({
            dir: noteDirAbsolute,
            page: Page.NOTE
        });
    }

    onClickTrash() {
        this.setState({
            dir: oldNoteDirAbsolute,
            page: Page.TRASH
        });
    }

    onClickSetting() {
        const dir = null;
        this.setState({
            dir,
            page: Page.SETTING
        });
    }

    render() {
        const {
            dir,
            page
        } = this.state;

        return (
            <Theme
                page={page}
                onClickTrash={this.onClickTrash}
                onClickNotes={this.onClickNotes}
                onClickSetting={this.onClickSetting}
            >
                {page === Page.SETTING ? <Setting /> : null}
                {page === Page.NOTE ? <TextEditor dir={dir} /> : null}
                {page === Page.TRASH ? <TextEditor dir={dir} /> : null}
            </Theme>
        );
    }
}

export default Editor;
