import React from 'react';
import moment from 'moment';
import swal from 'sweetalert';
import PropTypes from 'prop-types';

import File from '../../_util/file';
import Click from '../../_util/click';


const noteDirAbsolute = path.normalize(`${__dirname}/../../../note`);
const stateJson = path.normalize(`${__dirname}/../../_conf/state.json`);

class List extends React.Component {
    static isSkipUpdate(props1, props2) {
        // not re-render:
        // file number is same (because we might have deleted a file)
        // open other file in same dir
        if (props1.files.length === props2.files.length
            && props1.fileName !== props2.fileName
            && props1.dir === props2.dir) {
            return true;
        }
        // modified time is not different
        // title is not changed
        if (moment(props1.modifiedTime).format('YYYYMMDDHHmm') === moment(props2.modifiedTime).format('YYYYMMDDHHmm')
            && props1.title === props2.title
            && props1.fileName === props2.fileName
            && props1.dir === props2.dir) {
            return true;
        }
        return false;
    }

    static getFileMap(fileList, dir) {
        let files = fileList;
        if (files) {
            const startWithDot = /^\./;
            files = files.filter((file) => !startWithDot.test(file));
            const filteredFiles = files.filter(fileName => !startWithDot.test(fileName));
            return filteredFiles.map((fileName) => {
                const title = File.getFileFirstLine(fileName, dir);
                const stat = File.getFileStat(fileName, dir);

                const now = moment();
                let mtime;
                if (now.isAfter(moment(stat.mtime).add(7, 'days'), 'day')) {
                    mtime = moment(stat.mtime).format('YYYY/MM/DD HH:mm');
                } else if (now.isAfter(moment(stat.mtime), 'day')) {
                    mtime = moment(stat.mtime).format('ddd HH:mm');
                } else {
                    mtime = moment(stat.mtime).format('HH:mm');
                }
                return { fileName, mtime, title };
            });
        }
        return [];
    }

    constructor(props) {
        super(props);

        // sync list pinned file with current files
        const { pinnedFiles } = require('../../_conf/state.json').list;
        const files = File.getListFileByDir(noteDirAbsolute);
        const state = require('../../_conf/state.json');
        const syncFiles = files.filter(file => pinnedFiles.includes(file));
        state.list.pinnedFiles = syncFiles;
        File.writeConfigFile(stateJson, JSON.stringify(state, null, 4));

        this.state = {
            listPinnedFile: [...syncFiles]
        };

        this.onPin = this.onPin.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.getListFile = this.getListFile.bind(this);
        this.createTable = this.createTable.bind(this);
        this.createTableForTrash = this.createTableForTrash.bind(this);
    }

    componentDidMount() {
        const { dir } = this.props;
        const fileList = this.getListFile(dir);
        const fileMap = List.getFileMap(fileList, dir);
        this.createTable(fileMap);
    }

    componentDidUpdate(prevProps) {
        if (List.isSkipUpdate(this.props, prevProps)) {
            return;
        }

        const { dir } = this.props;
        const fileList = this.getListFile(dir);
        const fileMap = List.getFileMap(fileList, dir);

        if (dir === noteDirAbsolute) {
            this.createTable(fileMap);
        } else {
            this.createTableForTrash(fileMap);
        }
    }

    onPin(fileName) {
        const { listPinnedFile } = this.state;
        const thisStatePinnedFile = [...listPinnedFile];
        const state = require('../../_conf/state.json');

        if (!thisStatePinnedFile.includes(fileName)) {
            thisStatePinnedFile.push(fileName);
        } else {
            thisStatePinnedFile.splice(thisStatePinnedFile.indexOf(fileName), 1);
        }
        state.list.pinnedFiles = thisStatePinnedFile;
        File.writeConfigFile(stateJson, JSON.stringify(state, null, 4));
        this.setState({
            listPinnedFile: [...thisStatePinnedFile]
        });
    }

    onDoubleClick(fileName) {
        const diff = Click.fileClick(fileName);
        const { onListDoubleClick } = this.props;
        if (diff && Click.isDoubleClick(diff)) {
            onListDoubleClick();
        }
    }

    getListFile(dir) {
        const { listPinnedFile } = this.state;
        let { files } = this.props;

        if (dir !== noteDirAbsolute) {
            files = File.sortFile(files, dir);
        } else {
            // sort pinnedFile then append other sorted files
            const subList1 = File.sortFile(listPinnedFile, dir);
            const remainFile = files.filter(file => !subList1.includes(file));
            const subList2 = File.sortFile(remainFile, dir);
            files = subList1.concat(subList2);
        }
        return files;
    }

    createTable(fileMap) {
        const { onOpenFile, onUpdateText, fileName } = this.props;
        const table = document.getElementById('list-tb');
        const tbdy = document.createElement('tbody');
        const { list } = require('../../_conf/state.json');
        const { pinnedFiles } = list;
        for (let i = 0; i < fileMap.length; i += 1) {
            const tr = document.createElement('tr');
            // create filename link
            // create title link
            for (let j = 0; j < 2; j += 1) {
                const td = document.createElement('td');
                const a = document.createElement('a');

                a.textContent = j === 0 ? fileMap[i].mtime : fileMap[i].title;
                a.setAttribute('href', '#');
                a.className = 'light-link';
                td.appendChild(a);
                td.onclick = () => {
                    onOpenFile(fileMap[i].fileName);
                    this.onDoubleClick(fileMap[i].fileName);
                };
                tr.appendChild(td);
            }
            // add pin icon glyphicon glyphicon-pushpin
            const pinCell = document.createElement('td');
            const pinButton = document.createElement('button');
            pinButton.className = 'btn btn-light btn-sm glyphicon glyphicon-pushpin';
            // check if file is pinned
            if (pinnedFiles.includes(fileMap[i].fileName)) {
                pinButton.classList.toggle('btn-light');
                pinButton.classList.toggle('btn-info');
                pinButton.style.visibility = 'visible';
            }
            pinButton.onclick = () => {
                this.onPin(fileMap[i].fileName);
            };
            pinCell.appendChild(pinButton);
            tr.appendChild(pinCell);

            // create delete button
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-light btn-sm glyphicon glyphicon-trash';
            // check if file is pinned
            if (pinnedFiles.includes(fileMap[i].fileName)) {
                deleteButton.setAttribute('disabled', 'disabled');
                deleteButton.setAttribute('title', 'Button is disabled when file is pinned');
            }
            deleteButton.onclick = () => {
                if (pinnedFiles.includes(fileMap[i].fileName)) {
                    swal('Action is not allowed', 'You can not delete pinned file', 'error');
                } else {
                    swal({
                        title: 'Are you sure?',
                        text: 'This file will be moved to trash!',
                        icon: 'warning',
                        buttons: true
                    })
                        .then((willDelete) => {
                            if (willDelete) {
                                File.deleteFile(fileMap[i].fileName, onUpdateText, fileName);
                                swal('Poof! Your file has been deleted!', {
                                    icon: 'success',
                                });
                            } else {
                                swal('Your file is safe!');
                            }
                        });
                }
            };
            deleteCell.appendChild(deleteButton);
            tr.appendChild(deleteCell);

            // add new row
            tbdy.appendChild(tr);
        }
        table.innerHTML = '';
        table.appendChild(tbdy);
    }

    createTableForTrash(fileMap) {
        const { onOpenFile, onUpdateText, fileName } = this.props;
        const table = document.getElementById('list-tb');
        const tbdy = document.createElement('tbody');
        for (let i = 0; i < fileMap.length; i += 1) {
            const tr = document.createElement('tr');
            // create filename link
            // create title link
            for (let j = 0; j < 2; j += 1) {
                const td = document.createElement('td');
                const a = document.createElement('a');
                a.textContent = j === 0 ? fileMap[i].mtime : fileMap[i].title;
                a.setAttribute('href', '#');
                a.className = 'light-link';
                td.appendChild(a);
                td.onclick = () => {
                    onOpenFile(fileMap[i].fileName);
                    this.onDoubleClick(fileMap[i].fileName);
                };
                tr.appendChild(td);
            }
            // create delete link
            const deleteCell = document.createElement('td');
            const deleteLink = document.createElement('a');
            deleteLink.textContent = 'Delete Permanent';
            deleteLink.setAttribute('href', '#');
            deleteLink.onclick = () => {
                swal({
                    title: 'Are you sure?',
                    text: 'Once deleted, you will not be able to recover this file!',
                    icon: 'warning',
                    buttons: true,
                    dangerMode: true,
                })
                    .then((willDelete) => {
                        if (willDelete) {
                            File.deleteFilePermanent(fileMap[i].fileName, onUpdateText, fileName);
                            swal('Poof! Your file has been deleted!', {
                                icon: 'success',
                            });
                        } else {
                            swal('Your file is safe!');
                        }
                    });
            };
            deleteLink.className = 'light-link';
            deleteCell.appendChild(deleteLink);
            tr.appendChild(deleteCell);
            tbdy.appendChild(tr);

            // create restore link
            const restoreCell = document.createElement('td');
            const restoreLink = document.createElement('a');
            restoreLink.textContent = 'Restore';
            restoreLink.setAttribute('href', '#');
            restoreLink.onclick = () => {
                swal({
                    title: 'Are you sure?',
                    text: 'Do you want this file to be restored?',
                    icon: 'warning',
                    buttons: true
                })
                    .then((willDelete) => {
                        if (willDelete) {
                            File.restoreFile(fileMap[i].fileName, onUpdateText, fileName);
                            swal('Poof! Your file has been restored!', {
                                icon: 'success',
                            });
                        } else {
                            swal('Your file is still in trash!');
                        }
                    });
            };
            restoreLink.className = 'light-link';
            restoreCell.appendChild(restoreLink);
            tr.appendChild(restoreCell);
            tbdy.appendChild(tr);
        }
        table.innerHTML = '';
        table.appendChild(tbdy);
    }

    render() {
        return (
            <div id="list">
                <table id="list-tb" />
            </div>
        );
    }
}

export default List;

List.propTypes = {
    files: PropTypes.arrayOf(PropTypes.string),
    dir: PropTypes.string,
    fileName: PropTypes.string,
    onOpenFile: PropTypes.func,
    onUpdateText: PropTypes.func,
    onListDoubleClick: PropTypes.func
};

List.defaultProps = {
    files: PropTypes.arrayOf(PropTypes.string),
    dir: PropTypes.string,
    fileName: PropTypes.string,
    onOpenFile: PropTypes.func,
    onUpdateText: PropTypes.func,
    onListDoubleClick: PropTypes.func
};
