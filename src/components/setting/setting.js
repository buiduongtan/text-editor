import React from 'react';
import path from 'path';

import File from '../../_util/file';

const settingJson = path.normalize(`${__dirname}/../../_conf/setting.json`);

class Setting extends React.Component {
    constructor(props) {
        super(props);

        const setting = require('../../_conf/setting.json');
        this.state = {
            setting
        };

        this.onLayoutClick = this.onLayoutClick.bind(this);
    }

    componentDidMount() {
        const { setting } = this.state;
        if (setting.main.layout === 0) {
            document.getElementById('row').setAttribute('checked', 'checked');
        } else {
            document.getElementById('column').setAttribute('checked', 'checked');
        }
    }

    onLayoutClick(e) {
        const { setting } = this.state;
        setting.main.layout = setting.main.layout === 0 ? 1 : 0;
        File.writeConfigFile(settingJson, JSON.stringify(setting, null, 4));
        this.setState({
            setting
        });
    }

    render() {
        return (
            <div id="changable-area">
                <div id="setting-menu">
                    <div>
                        Screen layout:
                        <input type="radio" name="layout" id="row" value="0" onClick={e => this.onLayoutClick(e)} />
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor="row">&nbsp;Horizontal</label>
                        <input type="radio" name="layout" id="column" value="1" onClick={e => this.onLayoutClick(e)} />
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor="column">&nbsp;Vertical</label>
                    </div>
                </div>
            </div>
        );
    }
}

export default Setting;
