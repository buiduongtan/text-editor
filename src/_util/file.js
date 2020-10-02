import fs from 'fs';
import path from 'path';

import logger from '../_logger/logger';

const noteDirAbsolute = path.normalize(`${__dirname}/../../note`);
const oldNoteDirAbsolute = path.normalize(`${__dirname}/../../old_note`);

const getFileStat = (fileName) => fs.statSync(fileName, (err) => {
    if (err) {
        logger.error(err);
    }
});

const moveFile = (targetFile, thisDir, newDir, callback, currentFile) => {
    if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir);
    }
    const stat = getFileStat(`${thisDir}/${targetFile}`);
    if (stat.isFile) {
        try {
            fs.renameSync(`${thisDir}/${targetFile}`, `${newDir}/${targetFile}`, (err) => {
                if (err) throw err;
            });
            if (currentFile !== targetFile) {
                callback(currentFile);
            } else {
                const lastFile = File.getLastModifiedFileByDir(thisDir);
                callback(lastFile);
            }
        } catch (e) {
            logger.error(e);
        }
    }
};

const File = {
    getListFileByDir(dir) {
        fs.stat(dir, (error) => {
            if (error) {
                logger.error(error);
            }
        });
        const list = fs.readdirSync(dir, (error) => {
            if (error) {
                logger.error(error);
            }
        });
        const startWithDot = /^\./;
        return list.filter((file) => !startWithDot.test(file));
    },
    getLastModifiedFileByDir(dir) {
        const files = fs.readdirSync(dir, (error) => {
            if (error) {
                logger.error(error);
            }
        });
        let modifiedTime = null;
        let lastFile = null;
        files.forEach((file) => {
            const stat = getFileStat(`${dir}/${file}`);
            if (stat.mtime) {
                if (!modifiedTime || modifiedTime < stat.mtime) {
                    modifiedTime = stat.mtime;
                    lastFile = file;
                }
            }
        });
        return lastFile;
    },
    writeFile(targetFile, content, callback) {
        const dir = noteDirAbsolute;
        const fileName = targetFile || `${new Date().getTime()}.txt`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`${dir}/${fileName}`, content, (err) => {
            if (err) {
                logger.error(err);
            }
        });
        callback(fileName);
    },
    writeConfigFile(filePath, content) {
        return fs.writeFileSync(filePath, content, (err) => {
            if (err) {
                logger.error(err);
            }
        });
    },
    getFileContent(fileName, dir) {
        let content = '';
        if (fileName) {
            const stat = getFileStat(`${dir}/${fileName}`);
            if (stat.isFile) {
                content = fs.readFileSync(`${dir}/${fileName}`, (error) => {
                    if (error) {
                        logger.error(error);
                    }
                });
            }
        }
        return content;
    },
    getFileStat(fileName, dir) {
        const filePath = `${dir}/${fileName}`;
        try {
            return getFileStat(filePath)
        } catch (e) {
            logger.error(e);
        }
        return null;
    },
    getContentLine(content, lineIndex) {
        let text = '';
        if (content !== '') {
            const node = document.createRange().createContextualFragment(content);
            text = node.childNodes.length >= lineIndex + 1 ? node.childNodes[lineIndex].textContent : '';
        }
        return text;
    },
    getContentFirstLine(content) {
        const title = File.getContentLine(content, 0);
        return title !== '' ? title : '<Empty Title>';
    },
    getFileFirstLine(fileName, dir) {
        const buffer = File.getFileContent(fileName, dir);
        const content = buffer.toString('utf8');
        return File.getContentFirstLine(content);
    },
    getFileLine(fileName, dir, lineIndex) {
        const buffer = File.getFileContent(fileName, dir);
        const content = buffer.toString('utf8');
        return File.getContentLine(content, lineIndex);
    },
    sortFile(files, dir) {
        const comparator = (file1, file2) => {
            const stat1 = getFileStat(`${dir}/${file1}`);
            const stat2 = getFileStat(`${dir}/${file2}`);
            return stat2.mtime - stat1.mtime;
        };
        if (files && files.length > 1) {
            return files.sort(comparator);
        }
        return files;
    },
    deleteFile(targetFile, callback, currentFile) {
        const thisDir = noteDirAbsolute;
        const newDir = oldNoteDirAbsolute;
        moveFile(targetFile, thisDir, newDir, callback, currentFile);
    },
    restoreFile(targetFile, callback, currentFile) {
        const thisDir = oldNoteDirAbsolute;
        const newDir = noteDirAbsolute;
        moveFile(targetFile, thisDir, newDir, callback, currentFile);
    },
    deleteFilePermanent(targetFile, callback, currentFile) {
        const dir = oldNoteDirAbsolute;
        const stat = getFileStat(`${dir}/${targetFile}`);
        if (stat.isFile) {
            try {
                fs.unlinkSync(`${dir}/${targetFile}`);
                if (currentFile !== targetFile) {
                    callback(currentFile);
                } else {
                    const lastFile = File.getLastModifiedFileByDir(dir);
                    callback(lastFile);
                }
            } catch (e) {
                logger.error(e);
            }
        }
    },
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    },
    revertEscapeHtml(text) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'",
            '&nbsp;': ' '
        };
        return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#039;|&nbsp;)/g, (m) => map[m]);
    },
    makeFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }
};

export default File;
