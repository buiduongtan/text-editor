import React from 'react';

const Toolbar = () => {
    const click = () => {
        const span = document.createElement('span');
        const x = document.createElement('INPUT');
        x.setAttribute('type', 'checkbox');

        const t = document.createTextNode('Test');
        const label = document.createElement('LABEL');
        // label.setAttribute('data-placeholder','Insert text here...');
        label.appendChild(x);
        label.appendChild(t);
        span.appendChild(label);
        document.getElementById('container').appendChild(span);
        document.getElementById('container').dispatchEvent('input');
    };

    const seperate = () => {
        // document.execCommand('insertHorizontalRule', false, '');
        // document.execCommand('formatBlock', false, '<div>');
        document.execCommand('insertHtml', false, '<div contentEditable="false"><hr /></div><div><br/></div>');
        // document.execCommand('insertHtml', false, '<div>');
    };

    return (
        <div>
            {/* <div className="navbar navbar-light bg-light"> */}
            <button type="button" className="btn btn-light btn-sm">Project</button>
            &nbsp;
            <button type="button" className="btn btn-light btn-sm" onClick={click}>Checkbox</button>
            &nbsp;
            <button type="button" className="btn btn-light btn-sm" onClick={seperate}>Separator</button>
        </div>
    );
};

export default Toolbar;
